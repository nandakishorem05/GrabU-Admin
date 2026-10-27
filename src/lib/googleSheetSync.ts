/**
 * Master Catalogue Spreadsheet Sync Service
 * Supports:
 *  1. Google Sheets (Share URL -> auto CSV export)
 *  2. OneDrive / Excel Online Public Links (1drv.ms or sharepoint)
 *  3. Direct File Upload (.xlsx, .xls, .csv)
 *  4. Direct CSV/XLSX URLs
 *
 * Upserts each product into Supabase `master_product` table.
 */

import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SheetSyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  lastSyncAt: string;
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

/**
 * Checks if a URL is an internal/authenticated OneDrive editor session
 */
export function isOneDriveEditorUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("onedrive.live.com") &&
    (url.includes("Doc.aspx") || url.includes("action=edit") || url.includes("/personal/"))
  );
}

/**
 * Converts a 1drv.ms public share URL into a Microsoft Graph content download URL
 */
export function toOneDriveShareDownloadUrl(url: string): string {
  try {
    const base64 = typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(url)))
      : Buffer.from(url).toString("base64");

    const encoded = "u!" + base64.replace(/=/g, "").replace(/\//g, "_").replace(/\+/g, "-");
    return `https://api.onedrive.com/v1.0/shares/${encoded}/root/content`;
  } catch {
    return url;
  }
}

/**
 * Converts any Google Sheets share URL to direct CSV export URL.
 */
export function toGoogleSheetsCsvUrl(url: string): string {
  if (!url) throw new Error("Sheet URL is required");

  if (url.includes("export?format=csv") || url.includes("/pub?output=csv")) {
    return url;
  }

  const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!sheetIdMatch) {
    throw new Error(
      "Invalid Google Sheets URL. Expected: https://docs.google.com/spreadsheets/d/SHEET_ID/..."
    );
  }

  const sheetId = sheetIdMatch[1];
  const gidMatch = url.match(/[?&#]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Normalizes any spreadsheet URL (Google Sheets, OneDrive, direct link)
 */
export function resolveSpreadsheetFetchUrl(rawUrl: string): {
  fetchUrl: string;
  isDirectBinary: boolean;
} {
  const trimmed = rawUrl.trim();

  // 1. Google Sheets
  if (trimmed.includes("docs.google.com/spreadsheets")) {
    return { fetchUrl: toGoogleSheetsCsvUrl(trimmed), isDirectBinary: false };
  }

  // 2. OneDrive Private Editor URL check
  if (isOneDriveEditorUrl(trimmed)) {
    throw new Error(
      "⚠️ Private OneDrive Web Editor URL detected.\n\n" +
      "This link requires your personal Microsoft browser session. To connect this file:\n" +
      "• Easiest: Click 'Upload Excel / CSV' to upload your .xlsx file directly (instant & 100% reliable).\n" +
      "• Or in Excel Online: Click 'Share' → 'Anyone with the link can view' → 'Copy link' (starts with 1drv.ms).\n" +
      "• Or copy rows into Google Sheets for automated 5-min background sync."
    );
  }

  // 3. OneDrive 1drv.ms public share
  if (trimmed.includes("1drv.ms") || trimmed.includes("sharepoint.com") || trimmed.includes("onedrive.live.com")) {
    if (trimmed.includes("1drv.ms")) {
      return { fetchUrl: toOneDriveShareDownloadUrl(trimmed), isDirectBinary: true };
    }
    // If it has download=1 or download.aspx
    if (trimmed.includes("download=1") || trimmed.includes("download.aspx")) {
      return { fetchUrl: trimmed, isDirectBinary: true };
    }
    return { fetchUrl: trimmed, isDirectBinary: true };
  }

  // 4. Direct CSV or XLSX file URL
  const isXlsx = /\.xlsx?(\?.*)?$/i.test(trimmed);
  return { fetchUrl: trimmed, isDirectBinary: isXlsx };
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parses an ArrayBuffer or Uint8Array (.xlsx, .xls, .csv) into raw row objects.
 * Iterates through ALL sheets in multi-sheet workbooks (e.g. categorized tabs).
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer | Uint8Array): Record<string, any>[] {
  const wb = XLSX.read(buffer, { type: "array" });
  if (!wb.SheetNames || wb.SheetNames.length === 0) return [];

  const allRows: Record<string, any>[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: "",
    });
    if (rows.length === 0) continue;

    // Attach sheetName as default category if not present in the row
    for (const row of rows) {
      if (!row.__sheetName) {
        row.__sheetName = sheetName;
      }
      allRows.push(row);
    }
  }

  return allRows;
}

/**
 * Parses raw CSV text into row objects
 */
export function parseCsvText(raw: string): Record<string, any>[] {
  try {
    const wb = XLSX.read(raw, { type: "string" });
    if (wb.SheetNames && wb.SheetNames.length > 0) {
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
    }
  } catch {}
  return [];
}

// ─── Column Resolver ──────────────────────────────────────────────────────────

function resolve(row: Record<string, any>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const targetKey = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const rowKey of Object.keys(row)) {
      const normalizedRowKey = rowKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalizedRowKey === targetKey) {
        const val = row[rowKey];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
  }
  return "";
}

// ─── Unit & Brand Helpers ─────────────────────────────────────────────────────

function extractUnitFromName(name: string): string {
  const match = name.match(/\b(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|ml|l|ltr|litre|litres|pcs|pc|pack|s))\b/i);
  return match ? match[1].toLowerCase().replace(/\s+/g, "") : "1pc";
}

function extractBrandFromName(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    const firstTwo = `${words[0]} ${words[1]}`.toUpperCase();
    if (["AMRUTH VENI", "RED LABEL", "FORTUNE SUNLITE", "ARIS DEO"].includes(firstTwo)) {
      return firstTwo;
    }
    return words[0];
  }
  return "Generic";
}

// ─── Row Mapper ───────────────────────────────────────────────────────────────

function generateDeterministicId(name: string, brand: string, rowIndex: number): string {
  const base = `${name}-${brand}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `mp-${base.substring(0, 32)}-${rowIndex}`;
}

export function mapRowToProduct(row: Record<string, any>, rowIndex: number) {
  // Resolve product name (PrintName from Excel or name/product_name)
  const name = resolve(
    row,
    "printname",
    "print_name",
    "product_name",
    "item_name",
    "product",
    "item",
    "title",
    "name",
    "productname"
  );
  if (!name) return null;

  // Resolve category (from Category column or Sheet tab name fallback)
  let category = resolve(
    row,
    "category",
    "cat",
    "type",
    "department",
    "section",
    "categoryname"
  );
  if (!category || ["unknown", "sheet1"].includes(category.toLowerCase())) {
    const sheetTab = row.__sheetName || "";
    if (sheetTab && !["unknown", "sheet1"].includes(sheetTab.toLowerCase())) {
      category = sheetTab;
    } else {
      category = category || "General";
    }
  }

  // Resolve brand or auto-extract from product name
  const brand =
    resolve(row, "brand", "brand_name", "manufacturer", "company", "make") ||
    extractBrandFromName(name);

  // Resolve unit or auto-extract from product name (e.g. 50ml, 200ml, 1kg)
  const unit =
    resolve(row, "unit", "unit_type", "measure", "weight", "size", "pack_size", "packsize", "qty") ||
    extractUnitFromName(name);

  // Resolve base price / MRP
  const basePriceStr = resolve(
    row,
    "mrp",
    "base_price",
    "price",
    "cost",
    "rate",
    "selling_price",
    "baseprice"
  );
  const basePrice = parseFloat(basePriceStr.replace(/[^0-9.]/g, "")) || 0;

  // Resolve barcode / code (Code or Barcode column)
  const barcode = resolve(row, "code", "barcode", "ean", "upc", "sku", "ptc") || null;

  // Resolve image URL (link column or image_url)
  const imageUrl =
    resolve(
      row,
      "link",
      "image_url",
      "image",
      "img_url",
      "photo",
      "picture",
      "thumbnail",
      "imageurl",
      "img_link"
    ) || null;

  const isActiveStr = resolve(row, "is_active", "active", "status", "available", "in_stock", "isactive");
  const isActive =
    !isActiveStr || ["true", "yes", "1", "active", "y"].includes(isActiveStr.toLowerCase());

  const emoji = resolve(row, "emoji", "icon") || "📦";
  const description =
    resolve(row, "description", "desc", "details", "about") ||
    `${brand} ${name} - ${category}`;

  const productId =
    barcode ||
    resolve(row, "product_id", "id", "productid", "item_code", "ptc") ||
    generateDeterministicId(name, brand, rowIndex);

  return {
    product_id: productId,
    name,
    category,
    brand,
    unit,
    base_price: basePrice,
    barcode,
    is_active: isActive,
    image_url: imageUrl,
    emoji: imageUrl ? "📦" : emoji,
    description,
  };
}

// ─── Batch Upsert into Supabase ───────────────────────────────────────────────

export async function upsertProductsToSupabase(
  rows: Record<string, any>[]
): Promise<SheetSyncResult> {
  const result: SheetSyncResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    lastSyncAt: new Date().toISOString(),
  };

  const records = rows
    .map((row, idx) => mapRowToProduct(row, idx + 1))
    .filter(Boolean) as NonNullable<ReturnType<typeof mapRowToProduct>>[];

  result.skipped = rows.length - records.length;

  if (records.length === 0) {
    result.errors.push('No valid rows found. Ensure your sheet has a "Product Name" or "Name" column.');
    return result;
  }

  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase
      .from("master_product")
      .upsert(batch, { onConflict: "product_id", ignoreDuplicates: false });

    if (error) {
      result.errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
    } else {
      result.inserted += batch.length;
    }
  }

  return result;
}

// ─── Sync From File (.xlsx, .xls, .csv) ───────────────────────────────────────

export async function syncSpreadsheetFileToSupabase(file: File): Promise<SheetSyncResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const rows = parseSpreadsheetBuffer(arrayBuffer);
    if (rows.length === 0) {
      return {
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: ["File is empty or contains no data rows."],
        lastSyncAt: new Date().toISOString(),
      };
    }
    return await upsertProductsToSupabase(rows);
  } catch (err: any) {
    return {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [`Failed to parse file "${file.name}": ${err.message}`],
      lastSyncAt: new Date().toISOString(),
    };
  }
}

// ─── Sync From URL (Google Sheets, OneDrive, direct link) ──────────────────────

export async function syncGoogleSheetToSupabase(sheetUrl: string): Promise<SheetSyncResult> {
  const result: SheetSyncResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    lastSyncAt: new Date().toISOString(),
  };

  let resolved: { fetchUrl: string; isDirectBinary: boolean };
  try {
    resolved = resolveSpreadsheetFetchUrl(sheetUrl);
  } catch (err: any) {
    result.errors.push(err.message);
    return result;
  }

  let rows: Record<string, any>[] = [];

  // Try direct fetch first; if blocked by CORS, fallback to internal /api/fetch-sheet
  const attemptFetch = async (targetUrl: string, useProxy = false) => {
    const finalUrl = useProxy ? `/api/fetch-sheet?url=${encodeURIComponent(targetUrl)}` : targetUrl;
    return await fetch(finalUrl, { cache: "no-store" });
  };

  try {
    let res: Response;
    try {
      res = await attemptFetch(resolved.fetchUrl, false);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // CORS or network failure: fallback to our Next.js API proxy
      res = await attemptFetch(resolved.fetchUrl, true);
    }

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          "Access denied (HTTP 403). Make sure your sheet is shared with 'Anyone with the link can view' or use 'Upload Excel File' directly."
        );
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    if (resolved.isDirectBinary) {
      const buffer = await res.arrayBuffer();
      rows = parseSpreadsheetBuffer(buffer);
    } else {
      const text = await res.text();
      rows = parseCsvText(text);
    }
  } catch (err: any) {
    result.errors.push(`Failed to fetch spreadsheet: ${err.message}`);
    return result;
  }

  if (rows.length === 0) {
    result.errors.push("Spreadsheet returned no rows or headers could not be parsed.");
    return result;
  }

  return await upsertProductsToSupabase(rows);
}

// ─── Excel Template Generator ─────────────────────────────────────────────────

export function downloadProductsExcelTemplate(): void {
  const templateData = [
    {
      "Product Name": "Aashirvaad Superior MP Atta",
      Category: "Staples",
      Brand: "Aashirvaad",
      Unit: "5kg",
      Price: 245,
      Barcode: "8901030383701",
      Status: "active",
      "Image URL": "",
      Description: "Premium 100% whole wheat flour",
    },
    {
      "Product Name": "Amul Taaza Homogenised Toned Milk",
      Category: "Dairy",
      Brand: "Amul",
      Unit: "1L",
      Price: 72,
      Barcode: "8901262010054",
      Status: "active",
      "Image URL": "",
      Description: "Fresh pasteurized toned milk",
    },
    {
      "Product Name": "Fortune Sunlite Refined Sunflower Oil",
      Category: "Staples",
      Brand: "Fortune",
      Unit: "1L",
      Price: 145,
      Barcode: "8906007280014",
      Status: "active",
      "Image URL": "",
      Description: "Refined sunflower cooking oil with vitamins A & D",
    },
    {
      "Product Name": "Fresh Farm Red Onion",
      Category: "Vegetables & Fruits",
      Brand: "Fresh",
      Unit: "1kg",
      Price: 35,
      Barcode: "",
      Status: "active",
      "Image URL": "",
      Description: "Selected farm fresh quality red onions",
    },
    {
      "Product Name": "Tata Salt Vacuum Evaporated",
      Category: "Staples",
      Brand: "Tata",
      Unit: "1kg",
      Price: 28,
      Barcode: "8901058852272",
      Status: "active",
      "Image URL": "",
      Description: "Iodized vacuum evaporated salt",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set nice column widths
  ws["!cols"] = [
    { wch: 35 }, // Product Name
    { wch: 20 }, // Category
    { wch: 18 }, // Brand
    { wch: 10 }, // Unit
    { wch: 10 }, // Price
    { wch: 16 }, // Barcode
    { wch: 10 }, // Status
    { wch: 25 }, // Image URL
    { wch: 40 }, // Description
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Catalogue");

  XLSX.writeFile(wb, "GrabU_Master_Catalogue_Template.xlsx");
}

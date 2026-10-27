/**
 * Google Sheets → Master Catalogue Sync Service
 *
 * Converts a Google Sheets share URL to its CSV export URL,
 * fetches the CSV, parses every row, and upserts each product
 * into the Supabase `master_product` table.
 *
 * Expected sheet columns (case-insensitive, flexible order):
 *   product_id | name | category | brand | unit | base_price | barcode | is_active | image_url | emoji | description
 *
 * If product_id is missing a deterministic ID is generated from
 * name + brand + row index, so re-syncing the same data is idempotent.
 */

import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SheetSyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  lastSyncAt: string;
}

// ─── URL Helper ───────────────────────────────────────────────────────────────

/**
 * Converts any Google Sheets share URL to a direct CSV export URL.
 * Handles edit URLs, pubhtml URLs and raw CSV export URLs (returned as-is).
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

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().trim().replace(/\s+/g, "_")
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v.trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (ch === "," && !insideQuote) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Column Aliases ───────────────────────────────────────────────────────────

function resolve(row: Record<string, string>, ...aliases: string[]): string {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return "";
}

// ─── Row Mapper ───────────────────────────────────────────────────────────────

function generateDeterministicId(name: string, brand: string, rowIndex: number): string {
  const base = `${name}-${brand}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `gs-${base.substring(0, 32)}-${rowIndex}`;
}

function mapRowToProduct(row: Record<string, string>, rowIndex: number) {
  const name = resolve(row, "name", "product_name", "item_name", "product");
  if (!name) return null;

  const category = resolve(row, "category", "cat", "type") || "Uncategorized";
  const brand = resolve(row, "brand", "brand_name", "manufacturer") || "Generic";
  const unit = resolve(row, "unit", "unit_type", "measure") || "unit";
  const basePriceStr = resolve(row, "base_price", "price", "mrp", "cost", "base_price");
  const barcode = resolve(row, "barcode", "ean", "upc", "sku") || null;
  const isActiveStr = resolve(row, "is_active", "active", "status", "available");
  const imageUrl = resolve(row, "image_url", "image", "img_url", "photo", "thumbnail") || null;
  const emoji = resolve(row, "emoji", "icon") || "📦";
  const description = resolve(row, "description", "desc", "details") || "Imported from Google Sheets";
  const productId =
    resolve(row, "product_id", "id", "product_id") ||
    generateDeterministicId(name, brand, rowIndex);

  const basePrice = parseFloat(basePriceStr.replace(/[^0-9.]/g, "")) || 0;
  const isActive =
    !isActiveStr || ["true", "yes", "1", "active"].includes(isActiveStr.toLowerCase());

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

// ─── Main Sync Function ───────────────────────────────────────────────────────

export async function syncGoogleSheetToSupabase(sheetUrl: string): Promise<SheetSyncResult> {
  const result: SheetSyncResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    lastSyncAt: new Date().toISOString(),
  };

  // 1. Build CSV URL
  let csvUrl: string;
  try {
    csvUrl = toGoogleSheetsCsvUrl(sheetUrl);
  } catch (e: any) {
    result.errors.push(e.message);
    return result;
  }

  // 2. Fetch CSV (via proxy if CORS is an issue in production)
  let csvText: string;
  try {
    const response = await fetch(csvUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    csvText = await response.text();
  } catch (e: any) {
    result.errors.push(`Failed to fetch sheet: ${e.message}. Make sure the sheet is shared as "Anyone with the link can view".`);
    return result;
  }

  // 3. Parse rows
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    result.errors.push("Sheet appears to be empty or only has a header row.");
    return result;
  }

  // 4. Map rows → records
  const records = rows
    .map((row, idx) => mapRowToProduct(row, idx + 1))
    .filter(Boolean) as NonNullable<ReturnType<typeof mapRowToProduct>>[];

  result.skipped = rows.length - records.length;

  if (records.length === 0) {
    result.errors.push('No valid rows found. Ensure your sheet has a "name" column.');
    return result;
  }

  // 5. Upsert in batches of 50
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

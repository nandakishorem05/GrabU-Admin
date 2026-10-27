"use client";
import { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Download,
  Info,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import {
  syncGoogleSheetToSupabase,
  syncSpreadsheetFileToSupabase,
  downloadProductsExcelTemplate,
  isOneDriveEditorUrl,
  SheetSyncResult,
} from "@/lib/googleSheetSync";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "All Categories",
  "Vegetables & Fruits",
  "Staples",
  "Dairy",
  "Bakery",
  "Snacks",
  "Beverages",
  "Cleaning",
  "Personal Care",
  "Instant Food",
];

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const {
    products,
    deleteProduct,
    setProducts,
    googleSheetsUrl,
    setGoogleSheetsUrl,
    sheetSyncRunning,
    setSheetSyncRunning,
    sheetSyncResult,
    setSheetSyncResult,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetPanelOpen, setSheetPanelOpen] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetsUrl);
  const [fileUploading, setFileUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInputOneDriveEditor = useMemo(
    () => isOneDriveEditorUrl(sheetUrlInput),
    [sheetUrlInput]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || p.category === category;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, category, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refreshProductsFromDb = async () => {
    try {
      const { data: dbMP } = await supabase
        .from("master_product")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbMP) {
        setProducts(
          dbMP.map((mp: any) => ({
            id: mp.product_id,
            name: mp.name,
            category: mp.category,
            brand: mp.brand,
            unit: (mp.unit || "kg") as any,
            basePrice: Number(mp.base_price),
            offerPrice: Number(mp.base_price),
            barcode: mp.barcode || "",
            sku: mp.product_id,
            stockQuantity: 100,
            status: mp.is_active ? ("active" as const) : ("inactive" as const),
            images: [mp.image_url || mp.emoji || "📦"],
            createdAt: mp.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to refresh products:", err);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
      toast(`"${name}" removed from catalogue`, "error");
    }
  };

  const handleSaveSheetUrl = async () => {
    const trimmed = sheetUrlInput.trim();
    if (!trimmed) return;
    setGoogleSheetsUrl(trimmed);
    toast("Spreadsheet link saved — syncing now…", "info");
    await performSync(trimmed);
  };

  const performSync = async (url: string) => {
    setSheetSyncRunning(true);
    try {
      const result: SheetSyncResult = await syncGoogleSheetToSupabase(url);
      setSheetSyncResult(result);
      if (result.errors.length > 0) {
        toast(`Sync completed with error: ${result.errors[0]}`, "error");
      } else {
        toast(`✅ ${result.inserted} products synced to master catalogue!`, "success");
        await refreshProductsFromDb();
      }
    } catch (err: any) {
      toast(`Sync failed: ${err.message}`, "error");
    } finally {
      setSheetSyncRunning(false);
    }
  };

  const handleManualSync = async () => {
    const url = googleSheetsUrl || sheetUrlInput.trim();
    if (!url) {
      toast("Paste your online sheet link first", "error");
      return;
    }
    await performSync(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be picked again if desired
    e.target.value = "";

    setFileUploading(true);
    toast(`Reading "${file.name}"…`, "info");

    try {
      const result = await syncSpreadsheetFileToSupabase(file);
      setSheetSyncResult(result);

      if (result.errors.length > 0) {
        toast(`Import error: ${result.errors[0]}`, "error");
      } else {
        toast(`✅ Successfully imported ${result.inserted} products from "${file.name}"!`, "success");
        await refreshProductsFromDb();
      }
    } catch (err: any) {
      toast(`Failed to process file: ${err.message}`, "error");
    } finally {
      setFileUploading(false);
    }
  };

  const syncStatus = sheetSyncRunning || fileUploading
    ? "syncing"
    : sheetSyncResult && sheetSyncResult.errors.length > 0
    ? "error"
    : sheetSyncResult
    ? "ok"
    : googleSheetsUrl
    ? "idle"
    : "none";

  return (
    <div className="space-y-4">
      {/* Hidden file input for Excel / CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* ─── Spreadsheet & Excel Live Sync Banner ───────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f38 0%, #12162a 100%)",
          border: "1px solid",
          borderColor:
            syncStatus === "error"
              ? "#ef444430"
              : syncStatus === "ok"
              ? "#22c55e30"
              : "#3b82f630",
          borderRadius: "14px",
          padding: "16px 20px",
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Icon + label */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #22c55e20, #16a34a20)",
                border: "1px solid #22c55e30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={20} className="text-green-400" />
            </div>
            <div>
              <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                Live Spreadsheet & Excel Catalogue Sync
              </p>
              <p style={{ color: "#8b94b2", fontSize: 12 }}>
                Upload an Excel file (.xlsx / .csv) directly, or connect a Google Sheet / OneDrive link.
              </p>
            </div>
          </div>

          {/* Status pill */}
          {syncStatus !== "none" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                background:
                  syncStatus === "syncing"
                    ? "#3b82f615"
                    : syncStatus === "error"
                    ? "#ef444415"
                    : "#22c55e15",
                border: `1px solid ${
                  syncStatus === "syncing"
                    ? "#3b82f640"
                    : syncStatus === "error"
                    ? "#ef444440"
                    : "#22c55e40"
                }`,
                fontSize: 12,
                color:
                  syncStatus === "syncing"
                    ? "#93c5fd"
                    : syncStatus === "error"
                    ? "#fca5a5"
                    : "#86efac",
              }}
            >
              {syncStatus === "syncing" && <Loader2 size={12} className="animate-spin" />}
              {syncStatus === "ok" && <CheckCircle2 size={12} />}
              {syncStatus === "error" && <AlertCircle size={12} />}
              {syncStatus === "idle" && <CheckCircle2 size={12} />}
              {syncStatus === "syncing"
                ? fileUploading
                  ? "Importing file…"
                  : "Syncing…"
                : syncStatus === "error"
                ? "Sync error"
                : syncStatus === "ok"
                ? `${sheetSyncResult?.inserted ?? 0} products synced`
                : "Connected"}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Direct Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploading || sheetSyncRunning}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#ffffff",
                border: "none",
                cursor: fileUploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 6px rgba(34,197,94,0.3)",
              }}
            >
              {fileUploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              Upload Excel / CSV
            </button>

            {/* Template Download Button */}
            <button
              onClick={() => downloadProductsExcelTemplate()}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                background: "#22263a",
                border: "1px solid #3b4262",
                color: "#cbd5e1",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Download Excel template with sample products and column names"
            >
              <Download size={13} />
              Template
            </button>

            {/* Expand / collapse Link panel */}
            <button
              onClick={() => setSheetPanelOpen((v) => !v)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                background: sheetPanelOpen ? "#3b82f625" : "#22263a",
                border: "1px solid #3b82f650",
                color: "#93c5fd",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Link2 size={13} />
              {sheetPanelOpen ? "Close" : googleSheetsUrl ? "Edit Link" : "Connect Online Link"}
            </button>
          </div>
        </div>

        {/* Expandable panel for Online Links */}
        <AnimatePresence>
          {sheetPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: 16, borderTop: "1px solid #2e3454", marginTop: 14 }}>
                <p style={{ color: "#9aa0c0", fontSize: 12, marginBottom: 10 }}>
                  Paste a <strong style={{ color: "#e2e8f0" }}>Google Sheets</strong> share link (set to <em>Anyone with link can view</em>) or a <strong style={{ color: "#e2e8f0" }}>OneDrive public share link</strong> (1drv.ms).
                </p>

                {/* URL input row */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7290",
                      }}
                    >
                      <Link2 size={14} />
                    </span>
                    <input
                      value={sheetUrlInput}
                      onChange={(e) => setSheetUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/... or https://1drv.ms/x/s!..."
                      style={{
                        width: "100%",
                        paddingLeft: 36,
                        paddingRight: 12,
                        paddingTop: 9,
                        paddingBottom: 9,
                        background: "#12162a",
                        border: isInputOneDriveEditor ? "1px solid #f59e0b" : "1px solid #2e3454",
                        borderRadius: 10,
                        color: "#e2e8f0",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSaveSheetUrl}
                    disabled={
                      !sheetUrlInput.trim() ||
                      (sheetUrlInput.trim() === googleSheetsUrl && !sheetSyncRunning) ||
                      isInputOneDriveEditor
                    }
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor:
                        sheetUrlInput.trim() && !isInputOneDriveEditor
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        sheetUrlInput.trim() && !isInputOneDriveEditor ? 1 : 0.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Save & Sync
                  </button>
                  <button
                    onClick={handleManualSync}
                    disabled={sheetSyncRunning || isInputOneDriveEditor}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      background: "#22263a",
                      color: "#9aa0c0",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "1px solid #2e3454",
                      cursor:
                        sheetSyncRunning || isInputOneDriveEditor
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sheetSyncRunning ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    Sync Now
                  </button>
                </div>

                {/* Helpful callout if user pasted a private OneDrive web-editor link */}
                {isInputOneDriveEditor && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "#f59e0b15",
                      border: "1px solid #f59e0b40",
                      fontSize: 12,
                      color: "#fef3c7",
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-amber-300 block mb-1">
                          Private OneDrive Web Editor URL detected
                        </strong>
                        <p className="text-amber-100/90 leading-relaxed mb-2">
                          The URL you pasted is from your personal browser session (<code>...Doc.aspx?action=edit...</code>), which Microsoft restricts from external automated downloads.
                        </p>
                        <div className="flex items-center gap-3 flex-wrap mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Upload size={13} />
                            Upload Excel File Directly (Recommended)
                          </button>
                          <span className="text-amber-200/80 text-xs">
                            In Excel Online: click <strong>File → Save As → Download a Copy</strong> and upload here!
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Last sync result */}
                {sheetSyncResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background:
                        sheetSyncResult.errors.length > 0 ? "#ef444410" : "#22c55e10",
                      border: `1px solid ${
                        sheetSyncResult.errors.length > 0 ? "#ef444430" : "#22c55e30"
                      }`,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: "#9aa0c0" }}>
                      <span>
                        🕒 Last sync:{" "}
                        <strong style={{ color: "#e2e8f0" }}>
                          {new Date(sheetSyncResult.lastSyncAt).toLocaleTimeString()}
                        </strong>
                      </span>
                      <span>
                        ✅ Synced:{" "}
                        <strong style={{ color: "#86efac" }}>{sheetSyncResult.inserted}</strong>
                      </span>
                      <span>
                        ⏭ Skipped:{" "}
                        <strong style={{ color: "#fbbf24" }}>{sheetSyncResult.skipped}</strong>
                      </span>
                      {sheetSyncResult.errors.length > 0 && (
                        <span style={{ color: "#fca5a5" }}>
                          ❌ {sheetSyncResult.errors[0]}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Column guide */}
                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: "pointer", color: "#8b94b2", fontSize: 11 }}>
                    📋 Expected spreadsheet columns (click to expand)
                  </summary>
                  <div
                    style={{
                      marginTop: 8,
                      padding: "10px 12px",
                      background: "#0d1020",
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#9aa0c0",
                      overflowX: "auto",
                      lineHeight: "1.6",
                    }}
                  >
                    <strong style={{ color: "#e2e8f0" }}>Required:</strong> Product Name (or name)<br />
                    <strong style={{ color: "#e2e8f0" }}>Optional:</strong> Category, Brand, Unit, Price (or base_price / mrp), Barcode, Status (active/inactive), Image URL, Description
                    <br /><br />
                    <span style={{ color: "#6b7290" }}>
                      Column names are completely flexible — &quot;Price&quot;, &quot;MRP&quot;, &quot;Cost&quot; all work. Click <strong>&quot;Template&quot;</strong> button above to download an exact Excel template!
                    </span>
                  </div>
                </details>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Toolbar ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products, SKU, brand..."
            className="input-base w-full pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="input-base min-w-[180px]"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-base"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUploading}
            className="btn-ghost flex items-center gap-2 text-sm text-green-400 border border-green-500/20 hover:bg-green-500/10"
          >
            <Upload size={14} /> Upload Excel / CSV
          </button>
          <button
            onClick={() => downloadProductsExcelTemplate()}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Download size={14} /> Template
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-2">
        {[
          { label: "Total Products", value: products.length, color: "text-white" },
          {
            label: "Active",
            value: products.filter((p) => p.status === "active").length,
            color: "text-green-400",
          },
        ].map((s) => (
          <div key={s.label} className="card-sm">
            <p className="text-xs text-[#6b7290] mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Unit</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                        {product.images?.[0] && product.images[0].startsWith("http") ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          product.images?.[0] || "📦"
                        )}
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.unit}</td>
                  <td>
                    <code className="text-xs bg-[#22263a] px-2 py-0.5 rounded text-[#9aa0c0]">
                      {product.sku}
                    </code>
                  </td>
                  <td>
                    <code className="text-xs text-[#6b7290]">{product.barcode || "—"}</code>
                  </td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast(`Edit "${product.name}"`)}
                        className="p-1.5 rounded-lg hover:bg-[#22263a] text-[#9aa0c0] hover:text-blue-400 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#9aa0c0] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#6b7290]">
                    No products found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2e3454]">
          <span className="text-xs text-[#6b7290]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded-lg font-medium ${
                  page === p ? "bg-blue-600 text-white" : "btn-ghost"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

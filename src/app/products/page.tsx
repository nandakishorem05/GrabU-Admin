"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Upload, Edit2, Trash2, Link2, RefreshCw, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import { syncGoogleSheetToSupabase } from "@/lib/googleSheetSync";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "All Categories", "Vegetables & Fruits", "Staples", "Dairy", "Bakery", "Snacks", "Beverages", "Cleaning", "Personal Care", "Instant Food",
];

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const {
    products, deleteProduct, setProducts,
    googleSheetsUrl, setGoogleSheetsUrl,
    sheetSyncRunning, setSheetSyncRunning,
    sheetSyncResult, setSheetSyncResult,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetPanelOpen, setSheetPanelOpen] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetsUrl);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || p.category === category;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, category, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
      toast(`"${name}" removed from catalogue`, "error");
    }
  };

  const handleSaveSheetUrl = () => {
    setGoogleSheetsUrl(sheetUrlInput.trim());
    toast("Google Sheets URL saved â€” syncing nowâ€¦", "info");
  };

  const handleManualSync = async () => {
    const url = googleSheetsUrl || sheetUrlInput.trim();
    if (!url) {
      toast("Paste your Google Sheets link first", "error");
      return;
    }
    setSheetSyncRunning(true);
    try {
      const result = await syncGoogleSheetToSupabase(url);
      setSheetSyncResult(result);
      if (result.errors.length > 0) {
        toast(`Sync completed with errors: ${result.errors[0]}`, "error");
      } else {
        toast(`âœ… ${result.inserted} products synced to master catalogue!`, "success");
        // Refresh product list from Supabase
        const { data: dbMP } = await supabase.from("master_product").select("*");
        if (dbMP) {
          setProducts(dbMP.map((mp: any) => ({
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
            images: [mp.image_url || mp.emoji || "ðŸ“¦"],
            createdAt: mp.created_at,
          })));
        }
      }
    } finally {
      setSheetSyncRunning(false);
    }
  };

  const syncStatus = sheetSyncRunning
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
      {/* â”€â”€ Google Sheets Live Sync Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f38 0%, #12162a 100%)",
          border: "1px solid",
          borderColor: syncStatus === "error" ? "#ef444430" : syncStatus === "ok" ? "#22c55e30" : "#3b82f630",
          borderRadius: "14px",
          padding: "16px 20px",
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Icon + label */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #22c55e20, #16a34a20)",
                border: "1px solid #22c55e30",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18 }}>ðŸ“Š</span>
            </div>
            <div>
              <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, marginBottom: 1 }}>
                Google Sheets Live Sync
              </p>
              <p style={{ color: "#6b7290", fontSize: 11 }}>
                Auto-syncs every 5 min Â· Products added directly to master catalogue
              </p>
            </div>
          </div>

          {/* Status pill */}
          {syncStatus !== "none" && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 20,
                background: syncStatus === "syncing" ? "#3b82f615" : syncStatus === "error" ? "#ef444415" : "#22c55e15",
                border: `1px solid ${syncStatus === "syncing" ? "#3b82f640" : syncStatus === "error" ? "#ef444440" : "#22c55e40"}`,
                fontSize: 11, color: syncStatus === "syncing" ? "#93c5fd" : syncStatus === "error" ? "#fca5a5" : "#86efac",
              }}
            >
              {syncStatus === "syncing" && <Loader2 size={11} className="animate-spin" />}
              {syncStatus === "ok" && <CheckCircle2 size={11} />}
              {syncStatus === "error" && <AlertCircle size={11} />}
              {syncStatus === "idle" && <CheckCircle2 size={11} />}
              {syncStatus === "syncing" ? "Syncingâ€¦" : syncStatus === "error" ? "Sync error" : syncStatus === "ok" ? `${sheetSyncResult?.inserted ?? 0} products synced` : "Connected"}
            </div>
          )}

          {/* Expand / collapse */}
          <button
            onClick={() => setSheetPanelOpen((v) => !v)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: sheetPanelOpen ? "#3b82f620" : "#22263a",
              border: "1px solid #3b82f640",
              color: "#93c5fd",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            <Link2 size={12} />
            {sheetPanelOpen ? "Close" : googleSheetsUrl ? "Edit Link" : "Connect Sheet"}
          </button>
        </div>

        {/* Expandable panel */}
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
                  Paste your Google Sheets share link below. Make sure the sheet is set to{" "}
                  <strong style={{ color: "#e2e8f0" }}>"Anyone with the link can view"</strong>.
                </p>

                {/* URL input row */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7290" }}>
                      <Link2 size={13} />
                    </span>
                    <input
                      value={sheetUrlInput}
                      onChange={(e) => setSheetUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      style={{
                        width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                        background: "#12162a", border: "1px solid #2e3454", borderRadius: 10,
                        color: "#e2e8f0", fontSize: 13, outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSaveSheetUrl}
                    disabled={!sheetUrlInput.trim() || sheetUrlInput.trim() === googleSheetsUrl}
                    style={{
                      padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "#fff", fontSize: 13, fontWeight: 600, border: "none",
                      cursor: sheetUrlInput.trim() && sheetUrlInput.trim() !== googleSheetsUrl ? "pointer" : "not-allowed",
                      opacity: sheetUrlInput.trim() && sheetUrlInput.trim() !== googleSheetsUrl ? 1 : 0.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Save & Sync
                  </button>
                  <button
                    onClick={handleManualSync}
                    disabled={sheetSyncRunning}
                    style={{
                      padding: "9px 16px", borderRadius: 10, background: "#22263a",
                      color: "#9aa0c0", fontSize: 13, fontWeight: 600, border: "1px solid #2e3454",
                      cursor: sheetSyncRunning ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sheetSyncRunning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Sync Now
                  </button>
                </div>

                {/* Last sync result */}
                {sheetSyncResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12, padding: "10px 14px", borderRadius: 10,
                      background: sheetSyncResult.errors.length > 0 ? "#ef444410" : "#22c55e10",
                      border: `1px solid ${sheetSyncResult.errors.length > 0 ? "#ef444430" : "#22c55e30"}`,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: "#9aa0c0" }}>
                      <span>ðŸ• Last sync: <strong style={{ color: "#e2e8f0" }}>{new Date(sheetSyncResult.lastSyncAt).toLocaleTimeString()}</strong></span>
                      <span>âœ… Synced: <strong style={{ color: "#86efac" }}>{sheetSyncResult.inserted}</strong></span>
                      <span>â­ Skipped: <strong style={{ color: "#fbbf24" }}>{sheetSyncResult.skipped}</strong></span>
                      {sheetSyncResult.errors.length > 0 && (
                        <span style={{ color: "#fca5a5" }}>
                          âŒ {sheetSyncResult.errors[0]}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Column guide */}
                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: "pointer", color: "#6b7290", fontSize: 11 }}>
                    ðŸ“‹ Expected sheet columns (click to expand)
                  </summary>
                  <div style={{
                    marginTop: 8, padding: "10px 12px", background: "#0d1020", borderRadius: 8,
                    fontFamily: "monospace", fontSize: 11, color: "#9aa0c0", overflowX: "auto"
                  }}>
                    <strong style={{ color: "#e2e8f0" }}>Required:</strong> name<br />
                    <strong style={{ color: "#e2e8f0" }}>Optional:</strong> product_id, category, brand, unit, base_price (or price / mrp), barcode, is_active (yes/no), image_url, emoji, description
                    <br /><br />
                    <span style={{ color: "#6b7290" }}>Column names are flexible â€” "price", "mrp", "cost" all work for base_price.</span>
                  </div>
                </details>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* â”€â”€ Toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products, SKU, brand..."
            className="input-base w-full pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-base min-w-[180px]"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-base"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => toast("CSV import coming soon", "info")}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Upload size={14} /> Import CSV
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
          { label: "Active", value: products.filter((p) => p.status === "active").length, color: "text-green-400" },
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
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                        {product.images?.[0] && product.images[0].startsWith("http") ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          product.images?.[0] || "ðŸ“¦"
                        )}
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap">{product.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.unit}</td>
                  <td><code className="text-xs bg-[#22263a] px-2 py-0.5 rounded text-[#9aa0c0]">{product.sku}</code></td>
                  <td><code className="text-xs text-[#6b7290]">{product.barcode}</code></td>
                  <td><StatusBadge status={product.status} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast(`Edit "${product.name}" â€” connect to edit modal`)}
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}â€“{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40">â† Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-medium ${page === p ? "bg-blue-600 text-white" : "btn-ghost"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40">Next â†’</button>
          </div>
        </div>
      </div>

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

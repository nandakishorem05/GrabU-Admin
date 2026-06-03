"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Upload, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion } from "framer-motion";

const CATEGORIES = [
  "All Categories", "Dairy & Eggs", "Cooking Oil", "Beverages",
  "Snacks", "Staples & Grains", "Personal Care", "Home Care", "Instant Food",
];

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { products, deleteProduct } = useAppStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || p.category === category;
      const matchStatus = statusFilter === "all" || p.status === statusFilter ||
        (statusFilter === "low_stock" && p.stockQuantity > 0 && p.stockQuantity <= 10) ||
        (statusFilter === "out_of_stock" && p.stockQuantity === 0);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, category, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStockBadge = (qty: number) => {
    if (qty === 0) return <StatusBadge status="inactive" label="Out of Stock" />;
    if (qty <= 10) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-current" />Low Stock</span>;
    return <StatusBadge status="active" label={`${qty} units`} />;
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
      toast(`"${name}" removed from catalogue`, "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
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
      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        {[
          { label: "Total Products", value: products.length, color: "text-white" },
          { label: "Active", value: products.filter((p) => p.status === "active").length, color: "text-green-400" },
          { label: "Low Stock", value: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10).length, color: "text-amber-400" },
          { label: "Out of Stock", value: products.filter((p) => p.stockQuantity === 0).length, color: "text-red-400" },
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
                <th>Base Price</th>
                <th>Offer Price</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Stock</th>
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
                          product.images?.[0] || "📦"
                        )}
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap">{product.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.unit}</td>
                  <td>
                    <span className={product.offerPrice < product.basePrice ? "line-through text-[#6b7290]" : "text-white font-medium"}>
                      ₹{product.basePrice}
                    </span>
                  </td>
                  <td><span className="font-semibold text-white">₹{product.offerPrice}</span></td>
                  <td><code className="text-xs bg-[#22263a] px-2 py-0.5 rounded text-[#9aa0c0]">{product.sku}</code></td>
                  <td><code className="text-xs text-[#6b7290]">{product.barcode}</code></td>
                  <td>{getStockBadge(product.stockQuantity)}</td>
                  <td><StatusBadge status={product.status} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast(`Edit "${product.name}" — connect to edit modal`)}
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
                  <td colSpan={11} className="text-center py-12 text-[#6b7290]">
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40">← Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-medium ${page === p ? "bg-blue-600 text-white" : "btn-ghost"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40">Next →</button>
          </div>
        </div>
      </div>

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

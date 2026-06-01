"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Ticket, DollarSign, Calendar, RefreshCcw, Trash2, Percent, Calculator, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import type { PromoCode } from "@/types";

const PAGE_SIZE = 10;

export default function PromosPage() {
  const { promoCodes, addPromoCode, togglePromoCodeStatus, deletePromoCode } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Code Form State
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const filtered = useMemo(() => {
    return promoCodes.filter((p) => {
      const matchSearch = !search || p.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [promoCodes, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusToggle = (id: string, code: string) => {
    togglePromoCodeStatus(id);
    toast(`Promo code "${code}" status toggled`, "success");
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      deletePromoCode(id);
      toast(`Promo code "${code}" deleted`, "error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return toast("Please enter a coupon code", "error");
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      return toast("Please enter a valid discount value", "error");
    }

    const codeExists = promoCodes.some((p) => p.code.toUpperCase() === newCode.trim().toUpperCase());
    if (codeExists) return toast(`Coupon code "${newCode.toUpperCase()}" already exists`, "error");

    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(expiresInDays));

    const promo: PromoCode = {
      id: `PC${Math.floor(100 + Math.random() * 900)}`,
      code: newCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageCount: 0,
      totalSavings: 0,
      status: "active",
      startsAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
    };

    addPromoCode(promo);
    toast(`Coupon "${promo.code}" created successfully!`, "success");
    setShowAddModal(false);

    // Reset Form
    setNewCode("");
    setDiscountValue("");
    setMinOrder("");
    setMaxDiscount("");
    setUsageLimit("");
    setExpiresInDays("30");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search promo codes..."
            className="input-base w-full pl-9"
          />
        </div>
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
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-sm ml-auto"
        >
          <Plus size={14} /> Create Promo Code
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        {[
          { label: "Active Offers", value: promoCodes.filter((p) => p.status === "active").length, color: "text-green-400", icon: Ticket },
          { label: "Expired/Ended", value: promoCodes.filter((p) => p.status === "expired").length, color: "text-[#6b7290]", icon: Calendar },
          {
            label: "Total Redemptions",
            value: promoCodes.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString(),
            color: "text-white",
            icon: Calculator,
          },
          {
            label: "Total Savings Given",
            value: `₹${promoCodes.reduce((sum, p) => sum + p.totalSavings, 0).toLocaleString()}`,
            color: "text-blue-400",
            icon: DollarSign,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6b7290] mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-[#9aa0c0]">
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Details</th>
                <th>Limits</th>
                <th>Validity</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((promo) => (
                <motion.tr key={promo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm select-none">
                        🎟️
                      </div>
                      <div>
                        <span className="font-bold text-[14px] text-blue-400 font-mono tracking-wider whitespace-nowrap block">
                          {promo.code}
                        </span>
                        <span className="text-[9px] text-[#6b7290]">ID: {promo.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <p className="font-semibold text-white">
                        {promo.discountType === "percentage" ? `${promo.discountValue}% Off` : `₹${promo.discountValue} Flat Off`}
                      </p>
                      <p className="text-[#6b7290] mt-0.5">Min Order: ₹{promo.minOrderAmount}</p>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-[#9aa0c0] space-y-0.5">
                      {promo.maxDiscount && <p>Max Discount: ₹{promo.maxDiscount}</p>}
                      <p>Usage Cap: {promo.usageLimit ? `${promo.usageLimit} users` : "Unlimited"}</p>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-[#6b7290] space-y-0.5">
                      <p>
                        Starts:{" "}
                        {new Date(promo.startsAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p>
                        Expires:{" "}
                        {new Date(promo.expiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <p className="text-white font-medium">Used: <b>{promo.usageCount} times</b></p>
                      <p className="text-green-400 mt-0.5">Saved: ₹{promo.totalSavings.toLocaleString()}</p>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={promo.status === "active" ? "active" : "inactive"} label={promo.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusToggle(promo.id, promo.code)}
                        className="p-1.5 rounded-lg hover:bg-[#22263a] text-[#9aa0c0] hover:text-blue-400 transition-colors"
                        title="Toggle Status (Active/Expired)"
                      >
                        <RefreshCcw size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#9aa0c0] hover:text-red-400 transition-colors"
                        title="Delete Promo Code"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#6b7290]">
                    No promo codes found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2e3454]">
          <span className="text-xs text-[#6b7290]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} promo codes
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
                className={`w-7 h-7 text-xs rounded-lg font-medium ${page === p ? "bg-blue-600 text-white" : "btn-ghost"}`}
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#1a1d27] border border-[#2e3454] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3454]">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Create New Promo Code</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-[#22263a] text-[#9aa0c0] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
                <div>
                  <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Coupon Code</label>
                  <input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. GRABU50, FESTIVE100"
                    className="input-base w-full uppercase font-mono tracking-wider"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Discount Type</label>
                    <div className="grid grid-cols-2 bg-[#0f1117] rounded-lg p-0.5 border border-[#2e3454]">
                      <button
                        type="button"
                        onClick={() => setDiscountType("percentage")}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          discountType === "percentage" ? "bg-blue-600 text-white" : "text-[#9aa0c0] hover:text-white"
                        }`}
                      >
                        % Percent
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("flat")}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          discountType === "flat" ? "bg-blue-600 text-white" : "text-[#9aa0c0] hover:text-white"
                        }`}
                      >
                        ₹ Flat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">
                      {discountType === "percentage" ? "Discount Percentage" : "Discount Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
                      className="input-base w-full"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      placeholder="e.g. 199"
                      className="input-base w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">
                      Max Discount {discountType === "flat" ? "(Disabled)" : "Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      placeholder="e.g. 100"
                      className="input-base w-full"
                      disabled={discountType === "flat"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Usage Limit (Users)</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="Unlimited if empty"
                      className="input-base w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(e.target.value)}
                      placeholder="e.g. 30"
                      className="input-base w-full"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2e3454] flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Create Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

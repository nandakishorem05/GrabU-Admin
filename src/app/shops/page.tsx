"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, Star, TrendingUp, Plus, PauseCircle, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { formatCurrency } from "@/lib/utils";
import type { Shop, ShopStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { AddShopModal } from "@/components/modals/AddShopModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

const TABS: { key: ShopStatus; label: string }[] = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function ShopCard({ shop, onApprove, onReject, onCommissionChange, onUpdatePassword, onSuspendClick, onDeleteClick }: {
  shop: Shop;
  onApprove: (id: string, rate: number) => void;
  onReject:  (id: string) => void;
  onCommissionChange: (id: string, rate: number) => void;
  onUpdatePassword: (id: string, password: string) => void;
  onSuspendClick: (shop: Shop) => void;
  onDeleteClick: (shop: Shop) => void;
}) {
  const [commission, setCommission] = useState(shop.commissionRate);
  const [localPassword, setLocalPassword] = useState(shop.password || "partner123");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalPassword(shop.password || "partner123");
    }
  }, [shop.password, isFocused]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {shop.shopName[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-white">{shop.shopName}</h3>
            <StatusBadge status={shop.status} />
            {shop.status === "approved" && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${shop.isLive ? "bg-green-500/15 text-green-400" : "bg-[#6b7290]/15 text-[#9aa0c0]"}`}>
                {shop.isLive ? "🟢 Live" : "⚫ Offline"}
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs text-[#9aa0c0] mb-3 max-sm:grid-cols-2">
            <span>Owner: <b className="text-[#d0d4f0]">{shop.ownerName}</b></span>
            <span>Phone: <b className="text-[#d0d4f0]">{shop.phone}</b></span>
            <span>Email: <b className="text-[#d0d4f0]">{shop.email}</b></span>
            <span className="col-span-2">Address: <b className="text-[#d0d4f0]">{shop.address}</b></span>
            <span>GST: <code className="text-[#d0d4f0] bg-[#22263a] px-1 rounded">{shop.gstNumber}</code></span>
            {shop.fssaiNumber && (
              <span>FSSAI: <code className="text-[#d0d4f0] bg-[#22263a] px-1 rounded">{shop.fssaiNumber}</code></span>
            )}
          </div>

          {/* Credentials section */}
          <div className="bg-[#1b1f32] rounded-lg p-3 border border-[#2e3454] my-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">🔑 Portal Credentials</span>
              <button
                onClick={() => {
                  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
                  let pass = "";
                  for (let i = 0; i < 10; i++) {
                    pass += chars.charAt(Math.floor(Math.random() * chars.length));
                  }
                  onUpdatePassword(shop.id, pass);
                  toast("New password generated!");
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded transition-all"
              >
                ⚡ Generate Random Password
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6b7290]">Login Username / Email</span>
                <span className="text-white font-medium select-all select-text">{shop.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6b7290]">Login Password</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={localPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setIsFocused(false);
                      if (localPassword !== (shop.password || "partner123")) {
                        onUpdatePassword(shop.id, localPassword);
                        toast("Password updated!");
                      }
                    }}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="bg-[#22263a] border border-[#2e3454] text-white rounded px-2 py-0.5 text-xs w-full focus:outline-none focus:border-blue-500 font-mono pr-12"
                  />
                  {localPassword !== (shop.password || "partner123") && (
                    <button
                      onClick={() => {
                        onUpdatePassword(shop.id, localPassword);
                        toast("Password updated!");
                      }}
                      className="absolute right-1 text-[10px] text-green-400 hover:text-green-300 font-bold bg-green-500/10 px-1.5 py-0.5 rounded transition-all"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Approved shop metrics */}
          {shop.status === "approved" && shop.totalOrders > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: "Total Orders", value: shop.totalOrders.toLocaleString(), icon: TrendingUp },
                { label: "Revenue",      value: formatCurrency(shop.totalRevenue),  icon: TrendingUp },
                { label: "Rating",       value: `⭐ ${shop.rating}`,               icon: Star },
              ].map((m) => (
                <div key={m.label} className="bg-[#22263a] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#6b7290] mb-0.5">{m.label}</p>
                  <p className="text-sm font-bold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Commission input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7290]">Commission:</span>
              <input
                type="number"
                value={commission}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCommission(val);
                  onCommissionChange(shop.id, val);
                }}
                min="0" max="30"
                className="input-base w-16 text-center text-sm py-1"
              />
              <span className="text-xs text-[#6b7290]">%</span>
            </div>

            <button
              onClick={() => toast(`Viewing documents for ${shop.shopName}`, "info")}
              className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <FileText size={13} /> View Docs
            </button>

            {shop.status === "pending" && (
              <>
                <button
                  onClick={() => { onApprove(shop.id, commission); toast(`${shop.shopName} approved!`); }}
                  className="btn-success flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={() => { onReject(shop.id); toast(`${shop.shopName} rejected`, "error"); }}
                  className="btn-danger flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}

            {shop.status === "approved" && (
              <>
                <button
                  onClick={() => onSuspendClick(shop)}
                  className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border border-amber-500/35 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold transition-all"
                >
                  <PauseCircle size={13} /> Suspend
                </button>
                <button
                  onClick={() => onDeleteClick(shop)}
                  className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border border-red-500/35 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}

            {shop.status === "rejected" && (
              <>
                <button
                  onClick={() => { onApprove(shop.id, commission); toast(`${shop.shopName} reactivated!`); }}
                  className="btn-success flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <CheckCircle size={13} /> Reactivate
                </button>
                <button
                  onClick={() => onDeleteClick(shop)}
                  className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border border-red-500/35 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopsPage() {
  const { shops, approveShop, rejectShop, deleteShop, updateCommission, updateShopPassword } = useAppStore();
  const [activeTab, setActiveTab] = useState<ShopStatus>("pending");
  const [modalOpen, setModalOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    variant: "danger" | "warning";
    onConfirm: () => void;
  } | null>(null);

  const handleOpenConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const handleSuspend = (shop: Shop) => {
    handleOpenConfirm({
      title: "Suspend Supermarket",
      message: `Are you sure you want to suspend "${shop.shopName}"? They will no longer be able to accept orders, and their store status will be set to inactive.`,
      confirmText: "Suspend Store",
      variant: "warning",
      onConfirm: () => {
        rejectShop(shop.id);
        toast(`🏪 "${shop.shopName}" suspended successfully.`);
      },
    });
  };

  const handleDelete = (shop: Shop) => {
    handleOpenConfirm({
      title: "Permanently Delete Supermarket",
      message: `Are you sure you want to permanently delete "${shop.shopName}"? This action CANNOT be undone and will delete all associated products, orders, and shop history.`,
      confirmText: "Delete Store",
      variant: "danger",
      onConfirm: () => {
        deleteShop(shop.id);
        toast(`🗑️ "${shop.shopName}" has been deleted.`);
      },
    });
  };

  const filtered = shops.filter((s) => s.status === activeTab);
  const counts = {
    pending:  shops.filter((s) => s.status === "pending").length,
    approved: shops.filter((s) => s.status === "approved").length,
    rejected: shops.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Header / Tabs / Actions */}
      <div className="flex items-center justify-between border-b border-[#2e3454] flex-wrap gap-3 pb-0">
        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-[#9aa0c0] hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                tab.key === "pending" && counts.pending > 0
                  ? "bg-amber-500/20 text-amber-400"
                  : activeTab === tab.key
                    ? "bg-blue-500/20"
                    : "bg-[#22263a]"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Onboard Supermarket button */}
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg font-bold mb-2"
        >
          <Plus size={14} /> Onboard Supermarket
        </button>
      </div>

      {/* Shop cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-16 text-[#6b7290]"
            >
              <p className="text-4xl mb-3">🏪</p>
              <p className="text-sm">No {activeTab} applications</p>
            </motion.div>
          ) : (
            filtered.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onApprove={approveShop}
                onReject={rejectShop}
                onCommissionChange={updateCommission}
                onUpdatePassword={updateShopPassword}
                onSuspendClick={handleSuspend}
                onDeleteClick={handleDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Onboarding Modal */}
      <AddShopModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Confirm Action Modal */}
      {confirmConfig && (
        <ConfirmModal
          open={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

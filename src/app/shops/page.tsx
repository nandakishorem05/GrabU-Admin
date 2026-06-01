"use client";
import { useState } from "react";
import { CheckCircle, XCircle, FileText, Star, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { formatCurrency } from "@/lib/utils";
import type { Shop, ShopStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const TABS: { key: ShopStatus; label: string }[] = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function ShopCard({ shop, onApprove, onReject, onCommissionChange, onUpdatePassword }: {
  shop: Shop;
  onApprove: (id: string, rate: number) => void;
  onReject:  (id: string) => void;
  onCommissionChange: (id: string, rate: number) => void;
  onUpdatePassword: (id: string, password: string) => void;
}) {
  const [commission, setCommission] = useState(shop.commissionRate);

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
                <input
                  type="text"
                  value={shop.password || "partner123"}
                  onChange={(e) => onUpdatePassword(shop.id, e.target.value)}
                  className="bg-[#22263a] border border-[#2e3454] text-white rounded px-2 py-0.5 text-xs w-full focus:outline-none focus:border-blue-500 font-mono"
                />
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopsPage() {
  const { shops, approveShop, rejectShop, updateCommission, updateShopPassword } = useAppStore();
  const [activeTab, setActiveTab] = useState<ShopStatus>("pending");

  const filtered = shops.filter((s) => s.status === activeTab);
  const counts = {
    pending:  shops.filter((s) => s.status === "pending").length,
    approved: shops.filter((s) => s.status === "approved").length,
    rejected: shops.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#2e3454]">
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
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

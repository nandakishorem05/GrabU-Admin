"use client";
import { useState } from "react";
import { Download, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { formatCurrencyFull, formatCurrency } from "@/lib/utils";
import { DollarSign, Store, TrendingUp, Wallet } from "lucide-react";

export default function SettlementsPage() {
  const { settlements, settings } = useAppStore();
  const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed" | "all">("all");

  const filtered = activeTab === "all" ? settlements : settlements.filter((s) => s.status === activeTab);

  const totals = {
    settled:    settlements.filter((s) => s.status === "completed").reduce((a, s) => a + s.netPayout, 0),
    pending:    settlements.filter((s) => s.status !== "completed").reduce((a, s) => a + s.netPayout, 0),
    commission: settlements.reduce((a, s) => a + s.commissionAmount, 0),
    delivery:   settlements.reduce((a, s) => a + s.deliveryFees, 0),
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2">
        <KpiCard label="Total Settled This Week"    value={formatCurrency(totals.settled)}    icon={CheckCircle} color="green"  sub={`${settlements.filter(s=>s.status==="completed").length} shops`} />
        <KpiCard label="Pending Payouts"            value={formatCurrency(totals.pending)}    icon={Clock}       color="amber"  sub={`${settlements.filter(s=>s.status!=="completed").length} shops`} />
        <KpiCard label="Commission Earned"          value={formatCurrency(totals.commission)} icon={TrendingUp}  color="blue"   sub={`${settings.defaultCommission}% avg rate`} />
        <KpiCard label="Delivery Fees Passed"       value={formatCurrency(totals.delivery)}   icon={Wallet}      color="purple" sub={`₹${settings.deliveryFee} × orders`} />
      </div>

      {/* Global commission + download */}
      <div className="flex gap-3 items-stretch flex-wrap">
        <div className="card flex-1 flex items-center justify-between py-3 min-w-[240px]">
          <div>
            <p className="text-xs text-[#6b7290] mb-0.5">Global Default Commission</p>
            <p className="text-2xl font-bold text-white">{settings.defaultCommission}%</p>
          </div>
          <button
            onClick={() => toast("Commission rate updated")}
            className="btn-ghost text-sm py-1.5"
          >
            Edit Rate
          </button>
        </div>
        <button
          onClick={() => toast("Settlement report downloaded")}
          className="btn-primary flex items-center gap-2 text-sm px-5"
        >
          <Download size={14} /> Download Report (PDF)
        </button>
        <button
          onClick={() => toast("CSV exported")}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#2e3454]">
        {(["all", "pending", "processing", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition-all ${
              activeTab === t ? "border-blue-500 text-blue-400" : "border-transparent text-[#9aa0c0] hover:text-white"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Period</th>
                <th>Orders</th>
                <th>Gross Revenue</th>
                <th>Commission</th>
                <th>Delivery Fees</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-semibold text-white whitespace-nowrap">{s.shopName}</div>
                    <div className="text-[11px] text-[#6b7290]">{s.commissionRate}% commission</div>
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {s.weekStart} → {s.weekEnd}
                  </td>
                  <td>{s.totalOrders.toLocaleString()}</td>
                  <td><span className="text-white font-medium">₹{s.grossRevenue.toLocaleString("en-IN")}</span></td>
                  <td><span className="text-red-400 font-medium">-₹{s.commissionAmount.toLocaleString("en-IN")}</span></td>
                  <td><span className="text-green-400 font-medium">+₹{s.deliveryFees.toLocaleString("en-IN")}</span></td>
                  <td>
                    <span className={`font-bold ${s.status === "completed" ? "text-green-400" : "text-amber-400"}`}>
                      ₹{s.netPayout.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast(`Viewing settlement for ${s.shopName}`)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        View <ArrowRight size={11} />
                      </button>
                      {s.status !== "completed" && (
                        <button
                          onClick={() => toast(`₹${s.netPayout.toLocaleString("en-IN")} marked for ${s.shopName}`)}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2e3454] bg-[#22263a]/40">
          <span className="text-xs text-[#6b7290]">{filtered.length} settlements</span>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-[#9aa0c0]">Total Net: <span className="text-white font-bold">₹{filtered.reduce((a, s) => a + s.netPayout, 0).toLocaleString("en-IN")}</span></span>
            <span className="text-[#9aa0c0]">Total Commission: <span className="text-red-400 font-bold">₹{filtered.reduce((a, s) => a + s.commissionAmount, 0).toLocaleString("en-IN")}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

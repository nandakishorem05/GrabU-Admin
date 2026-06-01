"use client";
import { useState, useMemo } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderDrawer } from "@/components/modals/OrderDrawer";
import { useAppStore } from "@/store/app-store";
import { timeAgo, formatCurrencyFull } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all",              label: "All Orders" },
  { key: "pending",          label: "Pending" },
  { key: "accepted",         label: "Accepted" },
  { key: "packing",          label: "Packing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
  { key: "cancelled",        label: "Cancelled" },
];

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const { orders, setActiveOrderId } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [page, setPage] = useState(1);

  const shops = useMemo(() => [...new Set(orders.map((o) => o.shopName))], [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = activeTab === "all" || o.status === activeTab;
      const matchSearch = !search || [o.id, o.customerName, o.shopName].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      );
      const matchShop = shopFilter === "all" || o.shopName === shopFilter;
      return matchStatus && matchSearch && matchShop;
    });
  }, [orders, activeTab, search, shopFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex gap-0 border-b border-[#2e3454]">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === "all" ? orders.length : orders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-[#9aa0c0] hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? "bg-blue-500/20" : "bg-[#22263a]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-3 flex-wrap py-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID, customer, shop..."
            className="input-base w-full pl-9"
          />
        </div>
        <select
          value={shopFilter}
          onChange={(e) => { setShopFilter(e.target.value); setPage(1); }}
          className="input-base min-w-[180px]"
        >
          <option value="all">All Shops</option>
          {shops.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-base">
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => (
                <tr key={order.id}>
                  <td><span className="font-semibold text-white">#{order.id}</span></td>
                  <td>{order.customerName}</td>
                  <td className="max-w-[140px] truncate">{order.shopName}</td>
                  <td>{order.itemCount} items</td>
                  <td><span className="font-bold text-white">₹{order.total}</span></td>
                  <td><span className="text-xs uppercase bg-[#22263a] px-2 py-0.5 rounded">{order.paymentMethod}</span></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-[#6b7290] text-xs whitespace-nowrap">{timeAgo(order.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => setActiveOrderId(order.id)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#6b7290]">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2e3454]">
          <span className="text-xs text-[#6b7290]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
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
                className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${page === p ? "bg-blue-600 text-white" : "btn-ghost"}`}
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

      <OrderDrawer />
    </div>
  );
}

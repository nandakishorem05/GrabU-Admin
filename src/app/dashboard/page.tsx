"use client";
import { ShoppingCart, DollarSign, Store, AlertCircle, Clock } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrdersBarChart, RevenueAreaChart } from "@/components/charts/Charts";
import { mockKpi, mockDailyMetrics, mockOrders, mockShops } from "@/data/mock";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { OrderDrawer } from "@/components/modals/OrderDrawer";
import { motion } from "framer-motion";

const last7 = mockDailyMetrics.slice(-7);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { orders, shops, setActiveOrderId } = useAppStore();
  
  const recent = orders.slice(0, 5);
  
  // Compute dynamic stats
  const dynamicTotalOrders = orders.length;
  const dynamicTotalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total), 0);
  const dynamicActiveShops = shops.filter((s) => s.status === "approved").length;
  const dynamicPendingApps = shops.filter((s) => s.status === "pending").length;

  const displayOrdersToday = dynamicTotalOrders > 0 ? dynamicTotalOrders : mockKpi.totalOrdersToday;
  const displayRevenueToday = dynamicTotalRevenue > 0 ? dynamicTotalRevenue : mockKpi.totalRevenueToday;
  const displayActiveShops = dynamicActiveShops > 0 ? dynamicActiveShops : mockKpi.activeShops;
  const displayPendingApplications = dynamicPendingApps > 0 ? dynamicPendingApps : mockKpi.pendingApplications;

  const topShops = shops.filter((s) => s.status === "approved").slice(0, 5);
  const displayShops = topShops.length > 0 ? topShops : mockShops.filter((s) => s.status === "approved").slice(0, 5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* KPI Grid */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <KpiCard label="Total Orders Today" value={displayOrdersToday.toLocaleString()} change={mockKpi.ordersChange} sub="vs yesterday" icon={ShoppingCart} color="blue" />
        <KpiCard label="Total Revenue" value={formatCurrency(displayRevenueToday)} change={mockKpi.revenueChange} sub="vs yesterday" icon={DollarSign} color="green" />
        <KpiCard label="Active Shops" value={displayActiveShops} change={mockKpi.shopsChange} sub="new this week" icon={Store} color="amber" />
        <KpiCard label="Pending Applications" value={displayPendingApplications} sub="awaiting review" icon={AlertCircle} color="purple" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-[1.6fr_1fr] gap-4 max-lg:grid-cols-1">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Orders — Last 7 Days</h3>
              <p className="text-xs text-[#6b7290] mt-0.5">Platform-wide order volume</p>
            </div>
            <div className="flex gap-2">
              {["7D", "30D"].map((t, i) => (
                <button key={t} className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${i === 0 ? "bg-blue-600 border-blue-600 text-white" : "border-[#2e3454] text-[#9aa0c0] hover:text-white"}`}>{t}</button>
              ))}
            </div>
          </div>
          <OrdersBarChart data={last7} />
        </div>
        <div className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
            <p className="text-xs text-[#6b7290] mt-0.5">₹ in lakhs, last 7 days</p>
          </div>
          <RevenueAreaChart data={last7} />
        </div>
      </motion.div>

      {/* Tables Row */}
      <motion.div variants={item} className="grid grid-cols-[1.2fr_1fr] gap-4 max-lg:grid-cols-1">
        {/* Top Shops */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Performing Shops</h3>
            <a href="/shops" className="text-xs text-blue-400 hover:text-blue-300">View All →</a>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr><th>Shop</th><th>Orders</th><th>Revenue</th><th>Rating</th><th>Status</th></tr>
            </thead>
            <tbody>
              {displayShops.map((shop) => (
                <tr key={shop.id}>
                  <td><span className="font-semibold text-white">{shop.shopName}</span></td>
                  <td>{shop.totalOrders.toLocaleString()}</td>
                  <td>{formatCurrency(shop.totalRevenue)}</td>
                  <td>⭐ {shop.rating}</td>
                  <td><StatusBadge status={shop.isLive ? "approved" : "inactive"} label={shop.isLive ? "Live" : "Offline"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            <a href="/orders" className="text-xs text-blue-400 hover:text-blue-300">Live View →</a>
          </div>
          <div className="space-y-0.5">
            {recent.map((order) => (
              <button
                key={order.id}
                onClick={() => setActiveOrderId(order.id)}
                className="w-full flex items-center gap-3 py-2.5 border-b border-[#2e3454]/50 last:border-0 hover:bg-[#22263a] rounded-lg px-2 -mx-2 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#22263a] flex items-center justify-center text-base flex-shrink-0 group-hover:bg-[#2a2f45]">
                  🛒
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">#{order.id} · {order.customerName}</p>
                  <p className="text-xs text-[#6b7290] truncate">{order.shopName} · {order.itemCount} items · {timeAgo(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-white">₹{order.total}</span>
                  <StatusBadge status={order.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <OrderDrawer />
    </motion.div>
  );
}

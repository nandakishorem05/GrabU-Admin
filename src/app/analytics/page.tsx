"use client";
import { useState } from "react";
import { Download, TrendingUp, ShoppingCart, Users, BarChart2 } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { DualAxisChart, HourlyBarChart, CategoryDonutChart } from "@/components/charts/Charts";
import { mockDailyMetrics, mockHourlyOrders, mockCategoryRevenue, bestSellingProducts } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

const DATE_FILTERS = ["Today", "7 Days", "30 Days", "Custom"] as const;

export default function AnalyticsPage() {
  const [dateFilter, setDateFilter] = useState<typeof DATE_FILTERS[number]>("30 Days");

  const sliceData = () => {
    if (dateFilter === "Today")   return mockDailyMetrics.slice(-1);
    if (dateFilter === "7 Days")  return mockDailyMetrics.slice(-7);
    return mockDailyMetrics.slice(-30);
  };

  const data = sliceData();
  const totalOrders  = data.reduce((a, d) => a + d.orders, 0);
  const grossRevenue = data.reduce((a, d) => a + d.revenue, 0);
  const aov          = Math.round(grossRevenue / totalOrders);
  const netRevenue   = Math.round(grossRevenue * 0.92); // after 8% commission

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 p-1 bg-[#1a1d27] border border-[#2e3454] rounded-lg">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => f !== "Custom" ? setDateFilter(f) : toast("Date picker coming soon", "info")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                dateFilter === f ? "bg-blue-600 text-white" : "text-[#9aa0c0] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => toast("Analytics report exported")}
          className="btn-ghost flex items-center gap-2 text-sm ml-auto"
        >
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <KpiCard label="Total Orders"    value={totalOrders.toLocaleString()} change={22} sub="vs prev period" icon={ShoppingCart} color="blue"   />
        <KpiCard label="Gross Revenue"   value={formatCurrency(grossRevenue)} change={31} sub="vs prev period" icon={TrendingUp}   color="green"  />
        <KpiCard label="Avg Order Value" value={`₹${aov}`}                   change={8}  sub="vs prev period" icon={BarChart2}    color="amber"  />
        <KpiCard label="Repeat Customers" value="68%"                         change={5}  sub="vs prev period" icon={Users}        color="purple" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {[
          { label: "Gross Revenue",    value: formatCurrency(grossRevenue),  sub: "Before commission", color: "text-white" },
          { label: "Net Revenue",      value: formatCurrency(netRevenue),    sub: "After 8% commission", color: "text-green-400" },
          { label: "Commission Earned", value: formatCurrency(grossRevenue - netRevenue), sub: "Platform earnings", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-[#6b7290] mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#6b7290] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Revenue & Orders ({dateFilter})</h3>
            <p className="text-xs text-[#6b7290] mt-0.5">
              <span className="inline-block w-3 h-0.5 bg-blue-500 mr-1 align-middle" />Orders
              <span className="inline-block w-3 border-t-2 border-dashed border-amber-400 ml-3 mr-1 align-middle" />Revenue
            </p>
          </div>
          <DualAxisChart data={data} />
        </div>
        <div className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Peak Order Hours</h3>
            <p className="text-xs text-[#6b7290] mt-0.5">
              <span className="text-red-400">Red</span> = peak · <span className="text-amber-400">Amber</span> = busy · <span className="text-blue-400">Blue</span> = normal
            </p>
          </div>
          <HourlyBarChart data={mockHourlyOrders} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-lg:grid-cols-1">
        {/* Best sellers */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Best Selling Products</h3>
          <div className="space-y-4">
            {bestSellingProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span className="text-xs font-bold text-green-400">{p.sold.toLocaleString()} sold</span>
                  </div>
                  <div className="h-1.5 bg-[#22263a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.percentage}%`,
                        background: ["#3b82f6","#f59e0b","#10b981","#8b5cf6","#ef4444"][i],
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[#6b7290] w-8 text-right">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Category</h3>
          <CategoryDonutChart data={mockCategoryRevenue} />
          <div className="mt-4 pt-3 border-t border-[#2e3454]">
            <div className="flex justify-between text-xs">
              <span className="text-[#6b7290]">Total Category Revenue</span>
              <span className="font-bold text-white">
                {formatCurrency(mockCategoryRevenue.reduce((a, c) => a + c.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top shops table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Top Shops — {dateFilter}</h3>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Shop Name</th>
              <th>Orders</th>
              <th>Gross Revenue</th>
              <th>Commission</th>
              <th>Net Payout</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {[
              { rank: 1, name: "Fresh Mart Calicut",    orders: 2840, revenue: 892400, commission: 8, rating: 4.8 },
              { rank: 2, name: "Green Valley Store",    orders: 2310, revenue: 724000, commission: 7, rating: 4.6 },
              { rank: 3, name: "Perinthalmanna Bazaar", orders: 1980, revenue: 618000, commission: 8, rating: 4.7 },
              { rank: 4, name: "Daily Needs Store",     orders: 1760, revenue: 543000, commission: 8, rating: 4.5 },
              { rank: 5, name: "Quick Pick Supermart",  orders: 1540, revenue: 481000, commission: 9, rating: 4.3 },
            ].map((s) => {
              const commission = Math.round(s.revenue * s.commission / 100);
              return (
                <tr key={s.rank}>
                  <td>
                    <span className={`font-bold text-sm ${s.rank === 1 ? "text-amber-400" : s.rank === 2 ? "text-[#9aa0c0]" : s.rank === 3 ? "text-amber-700" : "text-[#6b7290]"}`}>
                      #{s.rank}
                    </span>
                  </td>
                  <td><span className="font-semibold text-white">{s.name}</span></td>
                  <td>{s.orders.toLocaleString()}</td>
                  <td><span className="text-white font-medium">₹{s.revenue.toLocaleString("en-IN")}</span></td>
                  <td><span className="text-red-400">-₹{commission.toLocaleString("en-IN")}</span></td>
                  <td><span className="text-green-400 font-semibold">₹{(s.revenue - commission).toLocaleString("en-IN")}</span></td>
                  <td>⭐ {s.rating}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

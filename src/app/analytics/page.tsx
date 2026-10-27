"use client";
import { useState, useMemo } from "react";
import { Download, TrendingUp, ShoppingCart, Users, BarChart2 } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { DualAxisChart, HourlyBarChart, CategoryDonutChart } from "@/components/charts/Charts";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import { useAppStore } from "@/store/app-store";

const DATE_FILTERS = ["Today", "7 Days", "30 Days", "Custom"] as const;

export default function AnalyticsPage() {
  const [dateFilter, setDateFilter] = useState<typeof DATE_FILTERS[number]>("30 Days");
  const { orders, products, shops, customers } = useAppStore();

  const data = useMemo(() => {
    const numDays = dateFilter === "Today" ? 1 : dateFilter === "7 Days" ? 7 : 30;
    const metrics: { date: string; orders: number; revenue: number }[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const dayOrders = orders.filter((o) => (o.createdAt || "").startsWith(dStr));
      const dayRev = dayOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      metrics.push({ date: label, orders: dayOrders.length, revenue: dayRev });
    }
    return metrics;
  }, [orders, dateFilter]);

  const totalOrders = data.reduce((a, d) => a + d.orders, 0);
  const grossRevenue = data.reduce((a, d) => a + d.revenue, 0);
  const aov = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;
  const netRevenue = Math.round(grossRevenue * 0.92); // after 8% commission

  const hourlyOrders = useMemo(() => {
    const hours = [
      { hour: 6, orders: 0 },
      { hour: 8, orders: 0 },
      { hour: 10, orders: 0 },
      { hour: 12, orders: 0 },
      { hour: 14, orders: 0 },
      { hour: 16, orders: 0 },
      { hour: 18, orders: 0 },
      { hour: 20, orders: 0 },
      { hour: 22, orders: 0 },
    ];
    orders.forEach((o) => {
      if (!o.createdAt) return;
      const h = new Date(o.createdAt).getHours();
      if (h >= 6 && h < 8) hours[0].orders++;
      else if (h >= 8 && h < 10) hours[1].orders++;
      else if (h >= 10 && h < 12) hours[2].orders++;
      else if (h >= 12 && h < 14) hours[3].orders++;
      else if (h >= 14 && h < 16) hours[4].orders++;
      else if (h >= 16 && h < 18) hours[5].orders++;
      else if (h >= 18 && h < 20) hours[6].orders++;
      else if (h >= 20 && h < 22) hours[7].orders++;
      else if (h >= 22 || h < 6) hours[8].orders++;
    });
    return hours;
  }, [orders]);

  const categoryRevenue = useMemo(() => {
    const catMap: Record<string, number> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const prod = products.find((p) => p.name.toLowerCase() === item.productName.toLowerCase());
        const cat = prod?.category || "General";
        catMap[cat] = (catMap[cat] || 0) + (item.totalPrice || item.unitPrice * item.quantity || 0);
      });
    });
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    const entries = Object.entries(catMap);
    if (entries.length === 0) {
      return [{ category: "General", revenue: 0, percentage: 100, color: colors[0] }];
    }
    const totalCatRev = entries.reduce((acc, [, rev]) => acc + rev, 0);
    return entries.map(([category, revenue], i) => ({
      category,
      revenue,
      percentage: totalCatRev > 0 ? Math.round((revenue / totalCatRev) * 100) : 0,
      color: colors[i % colors.length],
    }));
  }, [orders, products]);

  const bestSellingProducts = useMemo(() => {
    const itemCounts: Record<string, number> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        itemCounts[item.productName] = (itemCounts[item.productName] || 0) + item.quantity;
      });
    });
    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalSold = sorted.reduce((acc, [, qty]) => acc + qty, 0);
    return sorted.map(([name, sold]) => {
      const prod = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        sold,
        percentage: totalSold > 0 ? Math.round((sold / totalSold) * 100) : 0,
        icon: prod?.images?.[0] && !prod.images[0].startsWith("http") ? prod.images[0] : "📦",
      };
    });
  }, [orders, products]);

  const topShops = useMemo(() => {
    return [...shops]
      .filter((s) => s.status === "approved")
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5)
      .map((s, idx) => ({
        rank: idx + 1,
        name: s.shopName,
        orders: s.totalOrders,
        revenue: s.totalRevenue,
        commission: s.commissionRate || 8,
        rating: s.rating,
      }));
  }, [shops]);

  // Repeat customers percentage
  const repeatPercentage = useMemo(() => {
    if (customers.length === 0) return 0;
    const repeats = customers.filter((c) => c.totalOrders > 1).length;
    return Math.round((repeats / customers.length) * 100);
  }, [customers]);

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
        <KpiCard label="Total Orders" value={totalOrders.toLocaleString()} change={0} sub={`in ${dateFilter}`} icon={ShoppingCart} color="blue" />
        <KpiCard label="Gross Revenue" value={formatCurrency(grossRevenue)} change={0} sub={`in ${dateFilter}`} icon={TrendingUp} color="green" />
        <KpiCard label="Avg Order Value" value={`₹${aov}`} change={0} sub="per order" icon={BarChart2} color="amber" />
        <KpiCard label="Repeat Customers" value={`${repeatPercentage}%`} change={0} sub="more than 1 order" icon={Users} color="purple" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {[
          { label: "Gross Revenue", value: formatCurrency(grossRevenue), sub: "Before commission", color: "text-white" },
          { label: "Net Revenue", value: formatCurrency(netRevenue), sub: "After 8% commission", color: "text-green-400" },
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
          <HourlyBarChart data={hourlyOrders} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-lg:grid-cols-1">
        {/* Best sellers */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Best Selling Products</h3>
          {bestSellingProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6b7290]">No product sales recorded yet</div>
          ) : (
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
                          background: ["#3b82f6","#f59e0b","#10b981","#8b5cf6","#ef4444"][i % 5],
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#6b7290] w-8 text-right">{p.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Category</h3>
          <CategoryDonutChart data={categoryRevenue} />
          <div className="mt-4 pt-3 border-t border-[#2e3454]">
            <div className="flex justify-between text-xs">
              <span className="text-[#6b7290]">Total Category Revenue</span>
              <span className="font-bold text-white">
                {formatCurrency(categoryRevenue.reduce((a, c) => a + c.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top shops table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Top Shops — {dateFilter}</h3>
        {topShops.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6b7290]">No shop data available</div>
        ) : (
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
              {topShops.map((s) => {
                const commission = Math.round((s.revenue * s.commission) / 100);
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
        )}
      </div>
    </div>
  );
}

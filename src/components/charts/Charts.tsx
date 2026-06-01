"use client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

interface OrdersBarChartProps {
  data: { date: string; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2436] border border-[#2e3454] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#9aa0c0] text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue")
            ? `₹${p.value.toLocaleString("en-IN")}`
            : p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

export function OrdersBarChart({ data }: OrdersBarChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3454" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#6b7290", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6b7290", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RevenueAreaChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
    revenueL: +(d.revenue / 100000).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3454" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#6b7290", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#6b7290", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => `₹${v}L`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2e3454" }} />
        <Area
          type="monotone"
          dataKey="revenueL"
          name="Revenue"
          stroke="#10b981"
          fill="url(#revenueGrad)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#10b981" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface DualAxisChartProps {
  data: { date: string; orders: number; revenue: number }[];
}

export function DualAxisChart({ data }: DualAxisChartProps) {
  const formatted = data.slice(-30).map((d, i) => ({
    label: `D${i + 1}`,
    orders: d.orders,
    revenueK: +(d.revenue / 1000).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3454" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#6b7290", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fill: "#6b7290", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="revenueK" name="Revenue (K)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface HourlyBarChartProps {
  data: { hour: number; orders: number }[];
}

export function HourlyBarChart({ data }: HourlyBarChartProps) {
  const max = Math.max(...data.map((d) => d.orders));
  const formatted = data.map((d) => ({
    ...d,
    label: `${d.hour}h`,
    fill: d.orders > max * 0.75 ? "#ef4444" : d.orders > max * 0.5 ? "#f59e0b" : "#3b82f6",
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3454" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#6b7290", fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
        <YAxis tick={{ fill: "#6b7290", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="orders" name="Orders" radius={[3, 3, 0, 0]}>
          {formatted.map((entry, index) => (
            <rect key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { category: string; revenue: number; percentage: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7290"];

export function CategoryDonutChart({ data }: DonutChartProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: COLORS[i] }}
            />
            <span className="text-xs text-[#9aa0c0] flex-1 truncate">{d.category}</span>
            <div className="w-24 h-1.5 bg-[#22263a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${d.percentage}%`, background: COLORS[i] }}
              />
            </div>
            <span className="text-xs font-semibold text-white w-8 text-right">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

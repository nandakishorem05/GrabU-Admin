import { cn, formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  change?: number;
  icon: LucideIcon;
  color: "blue" | "green" | "amber" | "purple";
}

const colorMap = {
  blue:   { top: "bg-blue-500",   icon: "bg-blue-500/15 text-blue-400",   change: "bg-blue-500/10 text-blue-400" },
  green:  { top: "bg-green-500",  icon: "bg-green-500/15 text-green-400",  change: "bg-green-500/10 text-green-400" },
  amber:  { top: "bg-amber-500",  icon: "bg-amber-500/15 text-amber-400",  change: "bg-amber-500/10 text-amber-400" },
  purple: { top: "bg-purple-500", icon: "bg-purple-500/15 text-purple-400", change: "bg-purple-500/10 text-purple-400" },
};

export function KpiCard({ label, value, sub, change, icon: Icon, color }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className="relative bg-[#1a1d27] border border-[#2e3454] rounded-xl p-5 overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", c.top)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#6b7290] font-medium mb-2">{label}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {(sub || change !== undefined) && (
            <div className="mt-2 flex items-center gap-2">
              {change !== undefined && (
                <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full", c.change)}>
                  {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
                </span>
              )}
              {sub && <span className="text-[11px] text-[#6b7290]">{sub}</span>}
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", c.icon)}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

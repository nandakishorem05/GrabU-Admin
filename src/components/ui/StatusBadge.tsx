import { cn } from "@/lib/utils";
import type { OrderStatus, ShopStatus, SettlementStatus } from "@/types";

type BadgeVariant = "green" | "amber" | "red" | "blue" | "purple" | "gray";

const variantMap: Record<string, BadgeVariant> = {
  // order statuses
  pending:          "gray",
  accepted:         "purple",
  packing:          "amber",
  out_for_delivery: "blue",
  delivered:        "green",
  cancelled:        "red",
  // shop statuses
  approved:         "green",
  rejected:         "red",
  // settlement statuses
  processing:       "blue",
  completed:        "green",
  // product statuses
  active:           "green",
  inactive:         "gray",
  // live status
  live:             "green",
  busy:             "amber",
  closed:           "red",
};

const labelMap: Record<string, string> = {
  pending:          "Pending",
  accepted:         "Accepted",
  packing:          "Packing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  approved:         "Approved",
  rejected:         "Rejected",
  processing:       "Processing",
  completed:        "Completed",
  active:           "Active",
  inactive:         "Inactive",
};

const classMap: Record<BadgeVariant, string> = {
  green:  "bg-green-500/15 text-green-400",
  amber:  "bg-amber-500/15 text-amber-400",
  red:    "bg-red-500/15 text-red-400",
  blue:   "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  gray:   "bg-[#6b7290]/15 text-[#9aa0c0]",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = variantMap[status] ?? "gray";
  const displayLabel = label ?? labelMap[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        classMap[variant],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Store, Wallet,
  BarChart3, Settings, ChevronLeft, ChevronRight, Bell,
  Users, Ticket, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { section: "Main" },
  { href: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/orders",      label: "Orders",            icon: ShoppingCart,  badge: 12 },
  { href: "/customers",   label: "Customers",         icon: Users },
  { section: "Catalogue" },
  { href: "/products",    label: "Master Catalogue",  icon: Package },
  { section: "Marketing" },
  { href: "/promos",      label: "Promo Codes",       icon: Ticket },
  { href: "/ads",         label: "Promotional Banners",        icon: Image },
  { section: "Partners" },
  { href: "/shops",       icon: Store, label: "Shop Onboarding", badge: 5 },
  { section: "Finance" },
  { href: "/settlements", label: "Settlements",        icon: Wallet },
  { section: "Insights" },
  { href: "/analytics",   label: "Analytics",          icon: BarChart3 },
  { section: "System" },
  { href: "/settings",    label: "Settings",           icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 220 : 64 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col bg-[#1a1d27] border-r border-[#2e3454] overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#2e3454]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          GU
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="font-bold text-[15px] text-white leading-none">GrabU</div>
              <div className="text-[10px] text-[#6b7290] mt-0.5">Admin Panel v2.0</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, i) => {
          if ("section" in item) {
            return sidebarOpen ? (
              <div key={i} className="text-[9px] text-[#6b7290] font-bold uppercase tracking-widest px-3 pt-4 pb-1.5">
                {item.section}
              </div>
            ) : (
              <div key={i} className="border-t border-[#2e3454]/50 my-2 mx-2" />
            );
          }

          const Icon = item.icon!;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group relative",
                active
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-[#9aa0c0] hover:bg-[#22263a] hover:text-white"
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={16} className={cn("flex-shrink-0", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-medium whitespace-nowrap flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {sidebarOpen && item.badge && (
                <span className="bg-red-500 text-white rounded-full text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2e3454] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
            SA
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <div className="text-sm font-semibold text-white truncate">Super Admin</div>
                <div className="text-[11px] text-[#6b7290]">GrabU HQ</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {sidebarOpen && (
          <button
            onClick={() => {
              localStorage.removeItem("grabu_admin_logged_in");
              window.location.href = "/login";
            }}
            className="w-full text-center text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 py-1.5 rounded-lg transition-colors mt-1"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-[72px] -right-3 w-6 h-6 bg-[#22263a] border border-[#2e3454] rounded-full flex items-center justify-center text-[#9aa0c0] hover:text-white hover:bg-[#2a2f45] transition-colors z-10"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </motion.aside>
  );
}

"use client";
import { Search, Bell, Plus, Sun, Moon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/orders":      "Orders Monitoring",
  "/products":    "Master Product Catalogue",
  "/shops":       "Shop Onboarding",
  "/settlements": "Commission & Settlements",
  "/analytics":   "Analytics",
  "/settings":    "Admin Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);
  const title = pageTitles[pathname] ?? "QuickBasket Admin";

  return (
    <header className="h-14 bg-[#1a1d27] border-b border-[#2e3454] flex items-center gap-4 px-6 flex-shrink-0">
      <h1 className="text-[15px] font-bold text-white flex-1">{title}</h1>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
        <input
          type="text"
          placeholder="Search orders, shops, products..."
          className="bg-[#22263a] border border-[#2e3454] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-[#6b7290] w-56 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg bg-[#22263a] border border-[#2e3454] text-[#9aa0c0] hover:text-white hover:bg-[#2a2f45] transition-colors">
        <Bell size={15} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1d27]" />
      </button>

      {/* Theme */}
      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded-lg bg-[#22263a] border border-[#2e3454] text-[#9aa0c0] hover:text-white hover:bg-[#2a2f45] transition-colors"
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Quick Add */}
      <Link
        href="/products?action=add"
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Plus size={14} />
        Quick Add
      </Link>
    </header>
  );
}

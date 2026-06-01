"use client";
import { Search, Bell, Plus, Sun, Moon, CheckCircle, X, ShoppingCart, Package, Truck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/app-store";

const pageTitles: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/orders":      "Orders Monitoring",
  "/products":    "Master Product Catalogue",
  "/shops":       "Shop Onboarding",
  "/settlements": "Commission & Settlements",
  "/analytics":   "Analytics",
  "/settings":    "Admin Settings",
};

interface NotifItem {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  type: "new_order" | "status_change" | "payment";
  read: boolean;
}

export function Topbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);
  const title = pageTitles[pathname] ?? "QuickBasket Admin";
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const orders = useAppStore((s) => s.orders);
  const prevOrdersRef = useRef<string[]>([]);

  // Build in-app notifications from order state changes
  useEffect(() => {
    const currentIds = orders.map((o) => o.id);
    const prevIds = prevOrdersRef.current;
    const brandNew = currentIds.filter((id) => !prevIds.includes(id));

    if (brandNew.length > 0 && prevIds.length > 0) {
      const newNotifs: NotifItem[] = brandNew.map((id) => {
        const order = orders.find((o) => o.id === id)!;
        return {
          id: `notif-${id}-${Date.now()}`,
          title: "🛒 New Order",
          body: `${order.customerName} • ₹${order.total.toFixed(0)} — ${order.shopName || ""}`,
          timestamp: new Date(),
          type: "new_order",
          read: false,
        };
      });
      setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
    }

    prevOrdersRef.current = currentIds;
  }, [orders]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const removeNotif = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatRelative = (d: Date) => {
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 60) return "just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  const typeIcon = (type: NotifItem["type"]) => {
    if (type === "new_order") return <ShoppingCart size={14} className="text-blue-400" />;
    if (type === "status_change") return <Package size={14} className="text-amber-400" />;
    return <Truck size={14} className="text-green-400" />;
  };

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

      {/* Notifications Bell */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => {
            setShowNotifs(!showNotifs);
            if (!showNotifs) markAllRead();
          }}
          className="relative p-2 rounded-lg bg-[#22263a] border border-[#2e3454] text-[#9aa0c0] hover:text-white hover:bg-[#2a2f45] transition-colors"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#1a1d27] animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e2235] border border-[#2e3454] rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3454]">
              <span className="text-sm font-bold text-white">Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <CheckCircle size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notif List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Bell size={24} className="text-[#3e4462]" />
                  <p className="text-xs text-[#6b7290]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[#252840] hover:bg-[#252840] transition-colors ${
                      !notif.read ? "bg-[#20233a]" : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2e3454] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {typeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{notif.title}</p>
                      <p className="text-[11px] text-[#9aa0c0] mt-0.5 leading-relaxed">{notif.body}</p>
                      <p className="text-[10px] text-[#6b7290] mt-1">{formatRelative(notif.timestamp)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                    <button
                      onClick={() => removeNotif(notif.id)}
                      className="text-[#3e4462] hover:text-[#9aa0c0] transition-colors flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#2e3454]">
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-[#6b7290] hover:text-[#9aa0c0] transition-colors w-full text-center"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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

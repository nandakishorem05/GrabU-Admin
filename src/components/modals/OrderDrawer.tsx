"use client";
import { X, Phone, MapPin, Package, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

const statusFlow = ["pending", "accepted", "packing", "out_for_delivery", "delivered"] as const;

export function OrderDrawer() {
  const { orders, activeOrderId, setActiveOrderId, updateOrderStatus } = useAppStore();
  const order = orders.find((o) => o.id === activeOrderId);

  const advanceStatus = () => {
    if (!order) return;
    const idx = statusFlow.indexOf(order.status as any);
    if (idx < statusFlow.length - 1) {
      updateOrderStatus(order.id, statusFlow[idx + 1]);
      toast(`Order ${order.id} updated to ${statusFlow[idx + 1].replace(/_/g, " ")}`);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setActiveOrderId(null)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-[#1a1d27] border-l border-[#2e3454] z-50 overflow-y-auto p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Order #{order.id}</h2>
                <p className="text-xs text-[#6b7290] mt-0.5">{timeAgo(order.createdAt)}</p>
              </div>
              <button
                onClick={() => setActiveOrderId(null)}
                className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-[#9aa0c0] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status */}
            <div className="bg-[#22263a] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#6b7290] mb-2">Current Status</p>
              <StatusBadge status={order.status} className="text-sm px-3 py-1" />
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <button
                  onClick={advanceStatus}
                  className="mt-3 w-full btn-primary py-2 rounded-lg text-sm"
                >
                  Advance to Next Step →
                </button>
              )}
            </div>

            {/* Customer */}
            <div className="bg-[#22263a] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#6b7290] mb-3 flex items-center gap-1.5">
                <Package size={12} /> Customer
              </p>
              <p className="font-semibold text-white">{order.customerName}</p>
              <p className="text-sm text-blue-400 mt-1 flex items-center gap-1.5">
                <Phone size={12} /> {order.customerPhone}
              </p>
              <p className="text-xs text-[#9aa0c0] mt-2 flex items-start gap-1.5">
                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                <span>{order.deliveryAddress}</span>
              </p>
              <p className="text-xs text-[#6b7290] mt-1 ml-[18px]">Landmark: {order.landmark}</p>
            </div>

            {/* Shop */}
            <div className="bg-[#22263a] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#6b7290] mb-1">Shop</p>
              <p className="font-semibold text-white">{order.shopName}</p>
              <p className="text-xs text-[#9aa0c0] mt-0.5">Payment: {order.paymentMethod.toUpperCase()}</p>
            </div>

            {/* Items */}
            <div className="bg-[#22263a] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#6b7290] mb-3">{order.itemCount} Items</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#9aa0c0]">{item.productName} × {item.quantity}</span>
                    <span className="text-white font-medium">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2e3454] mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-[#9aa0c0]">
                  <span>Subtotal</span><span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-[#9aa0c0]">
                  <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm text-[#9aa0c0]">
                  <span>Platform Fee</span><span>₹{order.platformFee}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-[#2e3454] pt-2 mt-2">
                  <span>Total Paid</span>
                  <span className="text-green-400">{formatCurrencyFull(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Settlement preview */}
            <div className="bg-[#22263a] rounded-xl p-4">
              <p className="text-xs text-[#6b7290] mb-3">Settlement Preview</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#9aa0c0]">
                  <span>Product Subtotal</span><span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#9aa0c0]">
                  <span>Commission (8%)</span>
                  <span className="text-red-400">-₹{Math.round(order.subtotal * 0.08)}</span>
                </div>
                <div className="flex justify-between text-[#9aa0c0]">
                  <span>Delivery Fee</span>
                  <span className="text-green-400">+₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-[#2e3454] pt-2 mt-1">
                  <span>Shop Receives</span>
                  <span className="text-green-400">
                    ₹{order.subtotal - Math.round(order.subtotal * 0.08) + order.deliveryFee}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

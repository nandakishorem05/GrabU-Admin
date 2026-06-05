"use client";
import { X, Phone, MapPin, Package, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyFull, timeAgo } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

const statusFlow = ["pending", "accepted", "packing", "out_for_delivery", "delivered"] as const;

interface StructuredAddress {
  house: string;
  area: string;
  city: string;
  pincode: string;
  landmark: string;
  label: string;
  name: string;
  phone: string;
}

function parseStructuredAddress(addressStr: string, fallbackLandmark: string): StructuredAddress {
  const trimmed = addressStr.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const data = JSON.parse(trimmed);
      return {
        house: data.house || "",
        area: data.area || "",
        city: data.city || "",
        pincode: data.pincode || "",
        landmark: data.landmark || "",
        label: data.label || "Home",
        name: data.name || "",
        phone: data.phone || "",
      };
    } catch (e) {}
  }

  // Fallback parsing for old address string format: 'House, Area, City – Pincode'
  const parts = addressStr.split(",");
  let house = "";
  let area = "";
  let city = "";
  let pincode = "";

  if (parts.length > 0) house = parts[0].trim();
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    const pincodeMatch = lastPart.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      pincode = pincodeMatch[0];
      city = lastPart.replace(pincode, "").replace(/–|-/g, "").trim();
    } else {
      city = lastPart;
    }

    if (parts.length > 2) {
      area = parts.slice(1, parts.length - 1).join(", ").trim();
    }
  }

  // Strip coordinates from fallback landmark if needed
  let cleanLandmark = fallbackLandmark;
  if (fallbackLandmark.includes(" | Coords:")) {
    cleanLandmark = fallbackLandmark.split(" | Coords:")[0].trim();
  } else if (fallbackLandmark.includes("Coords:")) {
    cleanLandmark = fallbackLandmark.split("Coords:")[0].trim();
  }

  return {
    house: house || addressStr,
    area: area,
    city: city,
    pincode: pincode,
    landmark: cleanLandmark,
    label: "Address",
    name: "",
    phone: "",
  };
}

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
            {(() => {
              const addr = parseStructuredAddress(order.deliveryAddress, order.landmark);
              return (
                <div className="bg-[#22263a] rounded-xl p-4 mb-4 border border-[#2e3454] shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#6b7290] flex items-center gap-1.5 font-bold tracking-wider uppercase">
                      <Package size={12} /> Delivery Address
                    </p>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                      {addr.label}
                    </span>
                  </div>
                  
                  {/* Customer Details */}
                  <div className="mb-3 pb-3 border-b border-[#2e3454]">
                    <p className="font-semibold text-white text-sm">{addr.name || order.customerName}</p>
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1.5">
                      <Phone size={12} /> {addr.phone || order.customerPhone}
                    </p>
                  </div>

                  {/* Structured Address Fields */}
                  <div className="space-y-2 text-xs">
                    {addr.house && (
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-white min-w-[50px]">House:</span>
                        <span className="text-[#e2e8f0] font-medium">{addr.house}</span>
                      </div>
                    )}
                    {addr.area && (
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-gray-400 min-w-[50px]">Area:</span>
                        <span className="text-[#9aa0c0]">{addr.area}</span>
                      </div>
                    )}
                    {(addr.city || addr.pincode) && (
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-gray-400 min-w-[50px]">City:</span>
                        <span className="text-[#9aa0c0]">
                          {addr.city} {addr.pincode ? `- ${addr.pincode}` : ""}
                        </span>
                      </div>
                    )}
                    {addr.landmark && (
                      <div className="flex items-start gap-2 mt-1 bg-[#1a1d27]/50 p-2 rounded border border-[#2e3454]">
                        <span className="text-yellow-500 font-bold">📍 Landmark:</span>
                        <span className="text-[#9aa0c0]">{addr.landmark}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

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

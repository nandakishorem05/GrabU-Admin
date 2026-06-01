"use client";
import { create } from "zustand";
import type { Order, Product, Shop, Settlement, PlatformSettings, Customer, PromoCode } from "@/types";
import { mockOrders, mockProducts, mockShops, mockSettlements, mockSettings, mockCustomers, mockPromoCodes } from "@/data/mock";

interface AppState {
  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;

  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Shops
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  approveShop: (id: string, commissionRate: number) => void;
  rejectShop: (id: string) => void;
  updateCommission: (id: string, rate: number) => void;

  // Settlements
  settlements: Settlement[];

  // Settings
  settings: PlatformSettings;
  updateSettings: (settings: Partial<PlatformSettings>) => void;

  // Customers
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  banCustomer: (id: string) => void;
  unbanCustomer: (id: string) => void;

  // Promo Codes
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCodeStatus: (id: string) => void;
  deletePromoCode: (id: string) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  orders: mockOrders,
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) => {
    let statusStr = "placed";
    if (status === "pending") statusStr = "placed";
    else if (status === "accepted") statusStr = "accepted";
    else if (status === "packing") statusStr = "packing";
    else if (status === "out_for_delivery") statusStr = "outForDelivery";
    else if (status === "delivered") statusStr = "delivered";
    else if (status === "cancelled") statusStr = "rejected";

    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("order")
        .update({ status: statusStr })
        .eq("order_id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating order status in Supabase:", error);
        });
    });

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    }));
  },

  products: mockProducts,
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((s) => ({ products: [product, ...s.products] })),
  updateProduct: (id, updates) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProduct: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  shops: mockShops,
  setShops: (shops) => set({ shops }),
  approveShop: (id, commissionRate) =>
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, status: "approved", commissionRate } : sh
      ),
    })),
  rejectShop: (id) =>
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, status: "rejected" } : sh
      ),
    })),
  updateCommission: (id, rate) =>
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, commissionRate: rate } : sh
      ),
    })),

  settlements: mockSettlements,

  settings: mockSettings,
  updateSettings: (updates) =>
    set((s) => ({ settings: { ...s.settings, ...updates } })),

  customers: mockCustomers,
  setCustomers: (customers) => set({ customers }),
  banCustomer: (id) =>
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, status: "banned" } : c)),
    })),
  unbanCustomer: (id) =>
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, status: "active" } : c)),
    })),

  promoCodes: mockPromoCodes,
  addPromoCode: (promo) =>
    set((s) => ({ promoCodes: [promo, ...s.promoCodes] })),
  togglePromoCodeStatus: (id) =>
    set((s) => ({
      promoCodes: s.promoCodes.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "expired" : "active" } : p
      ),
    })),
  deletePromoCode: (id) =>
    set((s) => ({ promoCodes: s.promoCodes.filter((p) => p.id !== id) })),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeOrderId: null,
  setActiveOrderId: (id) => set({ activeOrderId: id }),
}));

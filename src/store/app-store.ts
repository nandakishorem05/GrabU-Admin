"use client";
import { create } from "zustand";
import type { Order, Product, Shop, Settlement, PlatformSettings, Customer, PromoCode, AdPoster } from "@/types";
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
  updateShopPassword: (id: string, password: string) => void;
  addShop: (shop: Shop) => void;

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

  // Ad Posters
  adPosters: AdPoster[];
  setAdPosters: (ads: AdPoster[]) => void;
  addAdPoster: (ad: AdPoster) => void;
  toggleAdPosterStatus: (id: string) => void;
  deleteAdPoster: (id: string) => void;

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
  addProduct: (product) => {
    const isUrl = product.images?.[0]?.startsWith("http");
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("master_product")
        .insert({
          product_id: product.id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          unit: product.unit,
          base_price: product.basePrice,
          barcode: product.barcode,
          is_active: product.status === "active",
          image_url: isUrl ? product.images[0] : null,
          emoji: isUrl ? "📦" : (product.images?.[0] || "📦"),
          description: `Brand: ${product.brand}`,
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting product to Supabase:", error);
        });
    });
    set((s) => ({ products: [product, ...s.products] }));
  },
  updateProduct: (id, updates) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProduct: (id) => {
    // Delete from Supabase — shop_product first (FK), then master_product
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_product")
        .delete()
        .eq("product_id", id) // Foreign key in shop_product table is product_id, not master_product_id!
        .then(() => {
          supabase
            .from("master_product")
            .delete()
            .eq("product_id", id)
            .then(({ error }) => {
              if (error) console.error("Error deleting product from Supabase:", error);
            });
        });
    });
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  shops: mockShops,
  setShops: (shops) => set({ shops }),
  approveShop: (id, commissionRate) => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_owner")
        .update({ status: "active", commission_rate: commissionRate })
        .eq("owner_id", id)
        .then(({ error }) => {
          if (error) console.error("Error approving shop in Supabase:", error);
        });
    });
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, status: "approved", commissionRate } : sh
      ),
    }));
  },
  rejectShop: (id) => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_owner")
        .update({ status: "inactive" })
        .eq("owner_id", id)
        .then(({ error }) => {
          if (error) console.error("Error rejecting shop in Supabase:", error);
        });
    });
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, status: "rejected" } : sh
      ),
    }));
  },
  updateCommission: (id, rate) => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_owner")
        .update({ commission_rate: rate })
        .eq("owner_id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating commission in Supabase:", error);
        });
    });
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, commissionRate: rate } : sh
      ),
    }));
  },
  updateShopPassword: (id, password) => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_owner")
        .update({ password })
        .eq("owner_id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating shop password in Supabase:", error);
        });
    });
    set((s) => ({
      shops: s.shops.map((sh) =>
        sh.id === id ? { ...sh, password } : sh
      ),
    }));
  },
  addShop: (shop) => {
    // Persist to Supabase shop_owner table
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("shop_owner")
        .insert({
          owner_id: shop.id,
          shop_name: shop.shopName,
          owner_name: shop.ownerName,
          phone: shop.phone,
          email: shop.email,
          address: shop.address,
          latitude: 12.9716,
          longitude: 77.5946,
          commission_rate: shop.commissionRate,
          opening_time: "08:00",
          closing_time: "22:00",
          status: shop.status === "approved" ? "active" : "inactive",
          password: shop.password || "partner123",
          emoji: "🏪",
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting shop to Supabase:", error);
        });
    });
    set((s) => ({ shops: [shop, ...s.shops] }));
  },

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

  // Ad Posters implementation
  adPosters: [
    {
      id: "ad-1",
      title: "Fresh Vegetables 20% Off!",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  ],
  setAdPosters: (adPosters) => set({ adPosters }),
  addAdPoster: (ad) => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("ad_poster")
        .insert({
          ad_id: ad.id,
          title: ad.title,
          image_url: ad.imageUrl,
          is_active: ad.isActive,
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting ad poster to Supabase:", error);
        });
    });
    set((s) => ({ adPosters: [ad, ...s.adPosters] }));
  },
  toggleAdPosterStatus: (id) => {
    set((s) => {
      const updated = s.adPosters.map((p) => {
        if (p.id === id) {
          const nextActive = !p.isActive;
          import("@/lib/supabase").then(({ supabase }) => {
            supabase
              .from("ad_poster")
              .update({ is_active: nextActive })
              .eq("ad_id", id)
              .then(({ error }) => {
                if (error) console.error("Error updating ad status in Supabase:", error);
              });
          });
          return { ...p, isActive: nextActive };
        }
        return p;
      });
      return { adPosters: updated };
    });
  },
  deleteAdPoster: (id) => {
    // 1. Delete from Supabase Database and Storage
    set((s) => {
      const target = s.adPosters.find((p) => p.id === id);
      if (target) {
        import("@/lib/supabase").then(({ supabase }) => {
          // Extract filename from URL
          const urlParts = target.imageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          
          // Delete storage file (only if it was uploaded to our bucket)
          if (target.imageUrl.includes("/storage/v1/object/public/posters")) {
            supabase.storage
              .from("posters")
              .remove([fileName])
              .then(({ error }) => {
                if (error) console.error("Error deleting poster file from storage:", error);
              });
          }

          // Delete DB row
          supabase
            .from("ad_poster")
            .delete()
            .eq("ad_id", id)
            .then(({ error }) => {
              if (error) console.error("Error deleting ad poster from Supabase:", error);
            });
        });
      }
      return { adPosters: s.adPosters.filter((p) => p.id !== id) };
    });
  },

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeOrderId: null,
  setActiveOrderId: (id) => set({ activeOrderId: id }),
}));

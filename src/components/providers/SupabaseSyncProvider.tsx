"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";
import type { Order, OrderStatus } from "@/types";

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncData = async () => {
      try {
        // 1. Fetch & Sync Shops
        const { data: dbShops } = await supabase.from("shop_owner").select("*");
        if (dbShops) {
          const mappedShops = dbShops.map((s: any) => ({
            id: s.owner_id,
            shopName: s.shop_name,
            ownerName: s.owner_name,
            phone: s.phone,
            email: s.email,
            address: s.address,
            gstNumber: "32GSTIN" + s.owner_id.toUpperCase(),
            commissionRate: Number(s.commission_rate),
            status: s.status === "active" ? ("approved" as const) : ("rejected" as const),
            totalOrders: s.total_orders || 0,
            totalRevenue: (s.total_orders || 0) * 350,
            rating: Number(s.rating),
            isLive: s.status === "active",
            joinedAt: s.created_at,
            password: s.password || "partner123"
          }));
          useAppStore.getState().setShops(mappedShops);
        }

        // 2. Fetch & Sync Products
        const { data: dbSP } = await supabase.from("shop_product").select("*, master_product(*)");
        if (dbSP) {
          const mappedProducts = dbSP.map((sp: any) => ({
            id: sp.shop_product_id,
            name: sp.master_product?.name || "Product",
            category: sp.master_product?.category || "Staples",
            brand: sp.master_product?.brand || "Brand",
            unit: (sp.master_product?.unit || "kg") as any,
            basePrice: Number(sp.master_product?.base_price || sp.selling_price),
            offerPrice: Number(sp.selling_price),
            barcode: sp.master_product?.barcode || "",
            sku: sp.shop_product_id,
            stockQuantity: sp.stock_quantity || 0,
            status: sp.is_listed ? ("active" as const) : ("inactive" as const),
            images: [sp.master_product?.emoji || "📦"],
            createdAt: sp.created_at
          }));
          useAppStore.getState().setProducts(mappedProducts);
        }

        // 3. Fetch & Sync Customers
        const { data: dbCust } = await supabase.from("customer").select("*, customer_address(*), order(*)");
        if (dbCust) {
          const mappedCustomers = dbCust.map((c: any) => {
            const addresses = (c.customer_address || []).map((a: any) => 
              `${a.house_flat_no || ""}, ${a.area || ""}, ${a.city || ""} – ${a.pincode || ""}`
            );
            const orders = c.order || [];
            const totalSpent = orders.reduce((acc: number, curr: any) => acc + Number(curr.total), 0);
            return {
              id: c.customer_id,
              name: c.name,
              email: c.email,
              phone: c.phone,
              status: "active" as const,
              totalOrders: orders.length,
              totalSpent,
              joinedAt: c.created_at,
              addresses
            };
          });
          useAppStore.getState().setCustomers(mappedCustomers);
        }

        // 4. Fetch & Sync Orders
        await syncOrders();
      } catch (err) {
        console.error("Initial data load error:", err);
      }
    };

    const syncOrders = async () => {
      try {
        const { data: dbOrders } = await supabase
          .from("order")
          .select("*, order_item(*), customer(*)")
          .order("placed_at", { ascending: false });

        if (dbOrders) {
          const mappedOrders = dbOrders.map((o: any) => {
            const items = (o.order_item || []).map((item: any) => ({
              id: item.item_id || Math.random().toString(),
              productName: item.name,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              totalPrice: Number(item.total_price)
            }));

            let orderStatus: OrderStatus = "pending";
            if (o.status === "placed") orderStatus = "pending";
            else if (o.status === "accepted") orderStatus = "accepted";
            else if (o.status === "packing") orderStatus = "packing";
            else if (o.status === "outForDelivery") orderStatus = "out_for_delivery";
            else if (o.status === "delivered") orderStatus = "delivered";
            else if (o.status === "rejected") orderStatus = "cancelled";

            return {
              id: o.order_id,
              customerId: o.customer_id,
              customerName: o.customer?.name || "Ananya Nair",
              customerPhone: o.customer?.phone || "9123456780",
              shopId: o.owner_id,
              shopName: o.shop_name,
              items,
              itemCount: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
              subtotal: Number(o.product_subtotal),
              deliveryFee: Number(o.delivery_fee),
              platformFee: Number(o.platform_fee),
              total: Number(o.total),
              status: orderStatus,
              paymentMethod: o.payment_method?.toLowerCase() === "cod" ? ("cod" as const) : ("upi" as const),
              deliveryAddress: o.delivery_address,
              landmark: o.landmark || "",
              createdAt: o.placed_at,
              updatedAt: o.placed_at
            };
          });
          useAppStore.getState().setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Order sync error:", err);
      }
    };

    // Trigger initial loading
    syncData();

    // Setup Real-time Postgres changes channels for orders
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order" },
        () => {
          syncOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
}

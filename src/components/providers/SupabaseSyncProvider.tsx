"use client";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";
import { syncGoogleSheetToSupabase } from "@/lib/googleSheetSync";
import type { Order, OrderStatus } from "@/types";

// ─── Browser Notification Helper ────────────────────────────────────────────
async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

function sendBrowserNotification(title: string, body: string, icon = "/favicon.ico") {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const notif = new Notification(title, { body, icon, badge: "/favicon.ico" });
  // Auto-close after 6 seconds
  setTimeout(() => notif.close(), 6000);
}

function playNotificationSound() {
  try {
    // Generate a short chime using Web Audio API (no external file needed)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

// ─── Component ───────────────────────────────────────────────────────────────
export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  // Track order IDs we've already notified about to avoid duplicate alerts
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Request browser notification permission on mount
    requestNotificationPermission();

    const syncShops = async () => {
      try {
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
      } catch (err) {
        console.error("Shop sync error:", err);
      }
    };

    const syncProducts = async () => {
      try {
        const { data: dbMP } = await supabase.from("master_product").select("*");
        if (dbMP) {
          const mappedProducts = dbMP.map((mp: any) => ({
            id: mp.product_id,
            name: mp.name,
            category: mp.category,
            brand: mp.brand,
            unit: (mp.unit || "kg") as any,
            basePrice: Number(mp.base_price),
            offerPrice: Number(mp.base_price),
            barcode: mp.barcode || "",
            sku: mp.product_id,
            stockQuantity: 100, // Master catalogue default
            status: mp.is_active ? ("active" as const) : ("inactive" as const),
            images: [mp.image_url || mp.emoji || "📦"],
            createdAt: mp.created_at
          }));
          useAppStore.getState().setProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Product sync error:", err);
      }
    };

    const syncCustomers = async () => {
      try {
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
      } catch (err) {
        console.error("Customer sync error:", err);
      }
    };

    const syncOrders = async (isRealTimeUpdate = false) => {
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
              customerName: o.customer?.name || "Customer",
              customerPhone: o.customer?.phone || "",
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

          // 🔔 Fire browser notifications for new or changed orders
          if (!isFirstLoad.current || isRealTimeUpdate) {
            for (const order of mappedOrders) {
              if (!knownOrderIds.current.has(order.id) && order.status === "pending") {
                knownOrderIds.current.add(order.id);
                playNotificationSound();
                sendBrowserNotification(
                  "🛒 New Order Received!",
                  `${order.customerName} placed an order • ₹${order.total.toFixed(0)}`
                );
              } else {
                knownOrderIds.current.add(order.id);
              }
            }
          } else {
            // Seed known IDs on first load so we don't re-notify for existing orders
            mappedOrders.forEach((o) => knownOrderIds.current.add(o.id));
            isFirstLoad.current = false;
          }
        }
      } catch (err) {
        console.error("Order sync error:", err);
      }
    };

    const syncAdPosters = async () => {
      try {
        const { data: dbAds } = await supabase.from("ad_poster").select("*");
        if (dbAds) {
          const mappedAds = dbAds.map((a: any) => ({
            id: a.ad_id,
            title: a.title,
            imageUrl: a.image_url,
            isActive: a.is_active,
            targetLocation: a.target_location || "All",
            expiresAt: a.expires_at || null,
            createdAt: a.created_at
          }));
          useAppStore.getState().setAdPosters(mappedAds);
        }
      } catch (err) {
        console.error("Ad posters sync error:", err);
      }
    };

    const syncSettlements = async () => {
      try {
        const { data: dbSettlements } = await supabase.from("settlement").select("*");
        if (dbSettlements) {
          const mappedSettlements = dbSettlements.map((s: any) => ({
            id: s.settlement_id,
            shopId: s.owner_id || "",
            shopName: s.shop_name || "",
            weekStart: s.week_start || "",
            weekEnd: s.week_end || "",
            totalOrders: s.total_orders || 0,
            grossRevenue: Number(s.gross_revenue) || 0,
            commissionRate: Number(s.commission_rate) || 8,
            commissionAmount: Number(s.commission_amount) || 0,
            deliveryFees: Number(s.delivery_fees) || 0,
            platformFees: Number(s.platform_fees) || 0,
            netPayout: Number(s.net_payout) || 0,
            status: (s.status || "pending") as any,
            processedAt: s.processed_at || s.created_at || undefined,
          }));
          useAppStore.getState().setSettlements(mappedSettlements);
        }
      } catch (err) {
        console.error("Settlement sync error:", err);
      }
    };

    const syncData = async () => {
      await syncShops();
      await syncProducts();
      await syncCustomers();
      await syncOrders();
      await syncAdPosters();
      await syncSettlements();
    };

    // Trigger initial loading
    syncData();

    // Setup Real-time Postgres changes channels
    const ordersChannel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order" },
        () => {
          syncOrders(true);
        }
      )
      .subscribe();

    const shopsChannel = supabase
      .channel("realtime-shops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shop_owner" },
        () => {
          syncShops();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel("realtime-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "master_product" },
        () => {
          syncProducts();
        }
      )
      .subscribe();

    const adsChannel = supabase
      .channel("realtime-ads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ad_poster" },
        () => {
          syncAdPosters();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(shopsChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(adsChannel);
    };
  }, []);

  const {setGoogleSheetsUrl, setSheetSyncRunning, setSheetSyncResult, googleSheetsUrl } = useAppStore();
  const sheetSyncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Google Sheets Auto-sync ──────────────────────────────────────────────
  useEffect(() => {
    // Restore saved URL from localStorage on first load
    const savedUrl = localStorage.getItem("grabu_sheet_url") || "";
    if (savedUrl) setGoogleSheetsUrl(savedUrl);

    const runSheetSync = async (url: string) => {
      if (!url) return;
      setSheetSyncRunning(true);
      try {
        const result = await syncGoogleSheetToSupabase(url);
        setSheetSyncResult(result);
        // After a successful sync, also refresh the products in the store
        if (result.inserted > 0) {
          const { data: dbMP } = await supabase.from("master_product").select("*");
          if (dbMP) {
            const mappedProducts = dbMP.map((mp: any) => ({
              id: mp.product_id,
              name: mp.name,
              category: mp.category,
              brand: mp.brand,
              unit: (mp.unit || "kg") as any,
              basePrice: Number(mp.base_price),
              offerPrice: Number(mp.base_price),
              barcode: mp.barcode || "",
              sku: mp.product_id,
              stockQuantity: 100,
              status: mp.is_active ? ("active" as const) : ("inactive" as const),
              images: [mp.image_url || mp.emoji || "📦"],
              createdAt: mp.created_at,
            }));
            useAppStore.getState().setProducts(mappedProducts);
          }
        }
      } finally {
        setSheetSyncRunning(false);
      }
    };

    // Watch for URL changes and persist to localStorage
    const unsubscribe = useAppStore.subscribe((state, prevState) => {
      if (state.googleSheetsUrl !== prevState.googleSheetsUrl) {
        localStorage.setItem("grabu_sheet_url", state.googleSheetsUrl);
        // Clear old interval and restart with new URL
        if (sheetSyncRef.current) clearInterval(sheetSyncRef.current);
        if (state.googleSheetsUrl) {
          runSheetSync(state.googleSheetsUrl);
          sheetSyncRef.current = setInterval(
            () => runSheetSync(state.googleSheetsUrl),
            5 * 60 * 1000 // every 5 minutes
          );
        }
      }
    });

    // Initial run if URL was already saved
    const initialUrl = localStorage.getItem("grabu_sheet_url") || "";
    if (initialUrl) {
      runSheetSync(initialUrl);
      sheetSyncRef.current = setInterval(
        () => runSheetSync(useAppStore.getState().googleSheetsUrl),
        5 * 60 * 1000
      );
    }

    return () => {
      unsubscribe();
      if (sheetSyncRef.current) clearInterval(sheetSyncRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

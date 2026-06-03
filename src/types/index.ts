// ─── Order Types ───────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "accepted"
  | "packing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "upi" | "card" | "wallet" | "cod";
  deliveryAddress: string;
  landmark: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Product Types ──────────────────────────────────────────────
export type ProductUnit = "kg" | "g" | "litre" | "ml" | "pack" | "piece" | "500g" | "250g" | "1L" | "75cl";
export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: ProductUnit;
  basePrice: number;
  offerPrice: number;
  barcode: string;
  sku: string;
  stockQuantity: number;
  status: ProductStatus;
  images: string[];
  createdAt: string;
}

// ─── Shop Types ─────────────────────────────────────────────────
export type ShopStatus = "pending" | "approved" | "rejected";

export interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  fssaiNumber?: string;
  commissionRate: number;
  status: ShopStatus;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  isLive: boolean;
  joinedAt: string;
  password?: string;
}

// ─── Settlement Types ───────────────────────────────────────────
export type SettlementStatus = "pending" | "processing" | "completed";

export interface Settlement {
  id: string;
  shopId: string;
  shopName: string;
  weekStart: string;
  weekEnd: string;
  totalOrders: number;
  grossRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  deliveryFees: number;
  platformFees: number;
  netPayout: number;
  status: SettlementStatus;
  processedAt?: string;
}

// ─── Analytics Types ────────────────────────────────────────────
export interface DailyMetric {
  date: string;
  orders: number;
  revenue: number;
  aov: number;
}

export interface HourlyOrders {
  hour: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

// ─── KPI Types ──────────────────────────────────────────────────
export interface KpiData {
  totalOrdersToday: number;
  totalRevenueToday: number;
  activeShops: number;
  pendingApplications: number;
  ordersChange: number;
  revenueChange: number;
  shopsChange: number;
}

// ─── Settings Types ─────────────────────────────────────────────
export interface PlatformSettings {
  deliveryRadius: number;
  minimumOrderAmount: number;
  platformFee: number;
  deliveryFee: number;
  defaultCommission: number;
  platformName: string;
  supportEmail: string;
  partnerEmail: string;
  supportPhone: string;
  notifyNewOrder: boolean;
  notifyNewShop: boolean;
  notifySettlement: boolean;
  notifyLowStock: boolean;
}

// ─── Customer Types ─────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "banned";
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  addresses: string[];
}

// ─── Promo Code Types ───────────────────────────────────────────
export interface PromoCode {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  totalSavings: number;
  status: "active" | "expired";
  startsAt: string;
  expiresAt: string;
}

// ─── Ad Poster Types ──────────────────────────────────────────────
export interface AdPoster {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  targetLocation: string;
  expiresAt: string | null;
  createdAt: string;
}



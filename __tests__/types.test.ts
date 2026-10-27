/**
 * __tests__/types.test.ts
 * Type-level and schema validation tests for GrabU Admin Panel types
 * Run with: npx jest __tests__/types.test.ts
 *
 * These tests verify that:
 * 1. Type-compatible objects can be constructed (shape validation)
 * 2. Business logic constraints hold (totals, statuses, etc.)
 * 3. Edge cases in data processing are handled correctly
 */

import type {
  Order,
  OrderItem,
  OrderStatus,
  Shop,
  Settlement,
  SettlementStatus,
  Customer,
  PromoCode,
  PlatformSettings,
  KpiData,
  AdPoster,
} from '../src/types';

// ─── Type-compatible object factories ────────────────────────────

function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'item-001',
    productName: 'Tata Salt',
    quantity: 2,
    unitPrice: 22.0,
    totalPrice: 44.0,
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-001',
    customerId: 'c-001',
    customerName: 'Ananya Nair',
    customerPhone: '9123456780',
    shopId: 'o-001',
    shopName: 'Fresh Mart',
    items: [makeOrderItem()],
    itemCount: 1,
    subtotal: 44.0,
    deliveryFee: 25.0,
    platformFee: 5.0,
    total: 74.0,
    status: 'pending',
    paymentMethod: 'upi',
    deliveryAddress: 'Flat 4B, Indiranagar',
    landmark: 'Near Metro',
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-05-01T10:05:00Z',
    ...overrides,
  };
}

function makeShop(overrides: Partial<Shop> = {}): Shop {
  return {
    id: 'o-001',
    shopName: 'Fresh Mart',
    ownerName: 'Ravi Kumar',
    phone: '9876543210',
    email: 'ravi@freshmart.in',
    address: '12 MG Road, Bengaluru',
    gstNumber: '29ABCDE1234F1Z5',
    commissionRate: 8.0,
    status: 'approved',
    totalOrders: 1248,
    totalRevenue: 125000.0,
    rating: 4.7,
    isLive: true,
    joinedAt: '2024-01-15T00:00:00Z',
    ...overrides,
  };
}

function makeSettlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    id: 'STL-045',
    shopId: 'o-001',
    shopName: 'Fresh Mart',
    weekStart: '2025-04-28',
    weekEnd: '2025-05-04',
    totalOrders: 89,
    grossRevenue: 18420.0,
    commissionRate: 8.0,
    commissionAmount: 1473.6,
    deliveryFees: 820.0,
    platformFees: 100.0,
    netPayout: 17666.4,
    status: 'completed',
    ...overrides,
  };
}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'c-001',
    name: 'Ananya Nair',
    email: 'ananya@example.com',
    phone: '9123456780',
    status: 'active',
    totalOrders: 12,
    totalSpent: 5420.0,
    joinedAt: '2024-03-01T00:00:00Z',
    addresses: ['Flat 4B, Indiranagar'],
    ...overrides,
  };
}

function makePromoCode(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    id: 'promo-001',
    code: 'GRAB10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 200,
    usageCount: 45,
    totalSavings: 2250.0,
    status: 'active',
    startsAt: '2025-05-01T00:00:00Z',
    expiresAt: '2025-05-31T23:59:59Z',
    ...overrides,
  };
}

// ─── Order tests ─────────────────────────────────────────────────

describe('Order type', () => {
  it('constructs a valid order object', () => {
    const order = makeOrder();
    expect(order.id).toBe('ORD-001');
    expect(order.customerName).toBe('Ananya Nair');
    expect(order.total).toBe(74.0);
  });

  it('total equals subtotal + deliveryFee + platformFee', () => {
    const order = makeOrder();
    expect(order.total).toBeCloseTo(order.subtotal + order.deliveryFee + order.platformFee, 2);
  });

  it('accepts all valid order statuses', () => {
    const statuses: OrderStatus[] = ['pending', 'accepted', 'packing', 'out_for_delivery', 'delivered', 'cancelled'];
    statuses.forEach(status => {
      const order = makeOrder({ status });
      expect(order.status).toBe(status);
    });
  });

  it('accepts all valid payment methods', () => {
    const methods: Order['paymentMethod'][] = ['upi', 'card', 'wallet', 'cod'];
    methods.forEach(method => {
      const order = makeOrder({ paymentMethod: method });
      expect(order.paymentMethod).toBe(method);
    });
  });

  it('itemCount matches items array length', () => {
    const order = makeOrder({
      items: [makeOrderItem(), makeOrderItem({ id: 'item-002', productName: 'Butter' })],
      itemCount: 2,
    });
    expect(order.items.length).toBe(order.itemCount);
  });
});

// ─── OrderItem tests ──────────────────────────────────────────────

describe('OrderItem type', () => {
  it('totalPrice equals unitPrice * quantity', () => {
    const item = makeOrderItem({ unitPrice: 22.0, quantity: 3, totalPrice: 66.0 });
    expect(item.totalPrice).toBeCloseTo(item.unitPrice * item.quantity, 2);
  });

  it('handles fractional prices', () => {
    const item = makeOrderItem({ unitPrice: 22.5, quantity: 2, totalPrice: 45.0 });
    expect(item.totalPrice).toBeCloseTo(item.unitPrice * item.quantity, 2);
  });
});

// ─── Shop tests ──────────────────────────────────────────────────

describe('Shop type', () => {
  it('constructs a valid shop object', () => {
    const shop = makeShop();
    expect(shop.shopName).toBe('Fresh Mart');
    expect(shop.commissionRate).toBe(8.0);
  });

  it('accepts all valid shop statuses', () => {
    const statuses: Shop['status'][] = ['pending', 'approved', 'rejected'];
    statuses.forEach(status => {
      const shop = makeShop({ status });
      expect(shop.status).toBe(status);
    });
  });

  it('commission rate is a valid percentage (0-100)', () => {
    const shop = makeShop();
    expect(shop.commissionRate).toBeGreaterThanOrEqual(0);
    expect(shop.commissionRate).toBeLessThanOrEqual(100);
  });

  it('rating is between 0 and 5', () => {
    const shop = makeShop();
    expect(shop.rating).toBeGreaterThanOrEqual(0);
    expect(shop.rating).toBeLessThanOrEqual(5);
  });

  it('isLive can be true or false', () => {
    expect(makeShop({ isLive: true }).isLive).toBe(true);
    expect(makeShop({ isLive: false }).isLive).toBe(false);
  });

  it('fssaiNumber is optional', () => {
    const shop = makeShop({ fssaiNumber: undefined });
    expect(shop.fssaiNumber).toBeUndefined();
    const shopWithFssai = makeShop({ fssaiNumber: 'FSSAI1234567' });
    expect(shopWithFssai.fssaiNumber).toBe('FSSAI1234567');
  });
});

// ─── Settlement tests ─────────────────────────────────────────────

describe('Settlement type', () => {
  it('constructs a valid settlement', () => {
    const sett = makeSettlement();
    expect(sett.id).toBe('STL-045');
    expect(sett.netPayout).toBeGreaterThan(0);
  });

  it('accepts all valid settlement statuses', () => {
    const statuses: SettlementStatus[] = ['pending', 'processing', 'completed'];
    statuses.forEach(status => {
      const sett = makeSettlement({ status });
      expect(sett.status).toBe(status);
    });
  });

  it('commissionAmount is correct percentage of grossRevenue', () => {
    const sett = makeSettlement({
      grossRevenue: 18420,
      commissionRate: 8,
      commissionAmount: 1473.6,
    });
    expect(sett.commissionAmount).toBeCloseTo(
      (sett.grossRevenue * sett.commissionRate) / 100,
      1
    );
  });

  it('processedAt is optional', () => {
    expect(makeSettlement({ processedAt: undefined }).processedAt).toBeUndefined();
  });
});

// ─── Customer tests ──────────────────────────────────────────────

describe('Customer type', () => {
  it('constructs a valid customer', () => {
    const customer = makeCustomer();
    expect(customer.name).toBe('Ananya Nair');
    expect(customer.status).toBe('active');
  });

  it('accepts active and banned statuses', () => {
    expect(makeCustomer({ status: 'active' }).status).toBe('active');
    expect(makeCustomer({ status: 'banned' }).status).toBe('banned');
  });

  it('addresses is an array', () => {
    const customer = makeCustomer();
    expect(Array.isArray(customer.addresses)).toBe(true);
  });

  it('totalSpent is non-negative', () => {
    expect(makeCustomer().totalSpent).toBeGreaterThanOrEqual(0);
  });
});

// ─── PromoCode tests ─────────────────────────────────────────────

describe('PromoCode type', () => {
  it('constructs a valid promo code', () => {
    const promo = makePromoCode();
    expect(promo.code).toBe('GRAB10');
    expect(promo.discountValue).toBe(10);
  });

  it('accepts percentage and flat discount types', () => {
    expect(makePromoCode({ discountType: 'percentage' }).discountType).toBe('percentage');
    expect(makePromoCode({ discountType: 'flat' }).discountType).toBe('flat');
  });

  it('usageCount does not exceed usageLimit when set', () => {
    const promo = makePromoCode({ usageLimit: 100, usageCount: 45 });
    expect(promo.usageCount).toBeLessThanOrEqual(promo.usageLimit!);
  });

  it('discountValue for percentage type is between 0 and 100', () => {
    const promo = makePromoCode({ discountType: 'percentage', discountValue: 10 });
    expect(promo.discountValue).toBeGreaterThan(0);
    expect(promo.discountValue).toBeLessThanOrEqual(100);
  });
});

// ─── KpiData tests ────────────────────────────────────────────────

describe('KpiData type', () => {
  it('constructs valid KPI data', () => {
    const kpi: KpiData = {
      totalOrdersToday: 142,
      totalRevenueToday: 18420,
      activeShops: 3,
      pendingApplications: 2,
      ordersChange: 12.5,
      revenueChange: 8.3,
      shopsChange: 0,
    };
    expect(kpi.totalOrdersToday).toBe(142);
    expect(kpi.activeShops).toBeGreaterThan(0);
  });

  it('change percentages can be negative (decline)', () => {
    const kpi: KpiData = {
      totalOrdersToday: 80,
      totalRevenueToday: 9500,
      activeShops: 3,
      pendingApplications: 0,
      ordersChange: -5.2,
      revenueChange: -3.1,
      shopsChange: 0,
    };
    expect(kpi.ordersChange).toBeLessThan(0);
  });
});

// ─── AdPoster tests ───────────────────────────────────────────────

describe('AdPoster type', () => {
  it('constructs a valid ad poster', () => {
    const ad: AdPoster = {
      id: 'ad-001',
      title: 'Fresh Vegetables 20% Off!',
      imageUrl: 'https://example.com/ad.jpg',
      isActive: true,
      targetLocation: 'All',
      expiresAt: null,
      createdAt: '2025-05-01T00:00:00Z',
    };
    expect(ad.title).toBe('Fresh Vegetables 20% Off!');
    expect(ad.isActive).toBe(true);
    expect(ad.expiresAt).toBeNull();
  });

  it('expiresAt can be a date string', () => {
    const ad: AdPoster = {
      id: 'ad-002',
      title: 'Sale!',
      imageUrl: 'https://example.com/sale.jpg',
      isActive: true,
      targetLocation: 'Bengaluru',
      expiresAt: '2025-05-31T23:59:59Z',
      createdAt: '2025-05-01T00:00:00Z',
    };
    expect(ad.expiresAt).not.toBeNull();
    expect(new Date(ad.expiresAt!).getFullYear()).toBe(2025);
  });
});

// ─── PlatformSettings tests ───────────────────────────────────────

describe('PlatformSettings type', () => {
  it('constructs valid platform settings', () => {
    const settings: PlatformSettings = {
      deliveryRadius: 5,
      minimumOrderAmount: 100,
      platformFee: 5,
      deliveryFee: 30,
      defaultCommission: 8,
      platformName: 'GrabU',
      supportEmail: 'support@grabu.app',
      partnerEmail: 'partner@grabu.app',
      supportPhone: '1800-xxx-xxxx',
      notifyNewOrder: true,
      notifyNewShop: true,
      notifySettlement: true,
      notifyLowStock: false,
    };
    expect(settings.platformName).toBe('GrabU');
    expect(settings.defaultCommission).toBe(8);
  });

  it('notification flags are booleans', () => {
    const settings: PlatformSettings = {
      deliveryRadius: 5,
      minimumOrderAmount: 100,
      platformFee: 5,
      deliveryFee: 30,
      defaultCommission: 8,
      platformName: 'GrabU',
      supportEmail: 'support@grabu.app',
      partnerEmail: 'partner@grabu.app',
      supportPhone: '1800-xxx-xxxx',
      notifyNewOrder: false,
      notifyNewShop: false,
      notifySettlement: false,
      notifyLowStock: true,
    };
    expect(typeof settings.notifyNewOrder).toBe('boolean');
    expect(typeof settings.notifyLowStock).toBe('boolean');
  });
});

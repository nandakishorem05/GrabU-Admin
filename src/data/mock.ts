import type {
  Order,
  Product,
  Shop,
  Settlement,
  DailyMetric,
  HourlyOrders,
  CategoryRevenue,
  KpiData,
  PlatformSettings,
  Customer,
  PromoCode,
} from "@/types";

// ─── Orders ─────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "QB-8821", customerId: "C001", customerName: "Ananya Nair",
    customerPhone: "9123456780", shopId: "S001", shopName: "Fresh Mart",
    items: [
      { id: "I1", productName: "Amul Butter", quantity: 2, unitPrice: 280, totalPrice: 560 },
      { id: "I2", productName: "Fortune Rice 5kg", quantity: 1, unitPrice: 320, totalPrice: 320 },
      { id: "I3", productName: "Mother Dairy Milk 1L", quantity: 3, unitPrice: 68, totalPrice: 204 },
    ],
    itemCount: 3, subtotal: 1084, deliveryFee: 25, platformFee: 5, total: 1114,
    status: "delivered", paymentMethod: "upi",
    deliveryAddress: "Flat 4B, Indiranagar, Bengaluru – 560038",
    landmark: "Near 100ft Road Metro",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: "QB-8820", customerId: "C002", customerName: "Ravi Kumar",
    customerPhone: "9876543210", shopId: "S002", shopName: "Green Basket",
    items: [
      { id: "I1", productName: "Red Label Tea 500g", quantity: 1, unitPrice: 245, totalPrice: 245 },
      { id: "I2", productName: "Ariel Pods 25pcs", quantity: 1, unitPrice: 510, totalPrice: 510 },
      { id: "I3", productName: "Harpic Cleaner 1L", quantity: 2, unitPrice: 145, totalPrice: 290 },
    ],
    itemCount: 3, subtotal: 1045, deliveryFee: 20, platformFee: 5, total: 1070,
    status: "packing", paymentMethod: "card",
    deliveryAddress: "14/B Railway Colony, Perinthalmanna, Malappuram 679322",
    landmark: "Near Blue Star Bakery",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: "QB-8819", customerId: "C003", customerName: "Arun Pillai",
    customerPhone: "+91 91481-11223", shopId: "S003", shopName: "Daily Needs Store",
    items: [
      { id: "I1", productName: "Sunsilk Shampoo 340ml", quantity: 1, unitPrice: 220, totalPrice: 220 },
      { id: "I2", productName: "Colgate MaxFresh 150g", quantity: 2, unitPrice: 99, totalPrice: 198 },
      { id: "I3", productName: "Surf Excel 1kg", quantity: 1, unitPrice: 268, totalPrice: 268 },
      { id: "I4", productName: "Dettol Handwash 220ml", quantity: 2, unitPrice: 85, totalPrice: 170 },
      { id: "I5", productName: "Vim Bar 200g", quantity: 3, unitPrice: 32, totalPrice: 96 },
      { id: "I6", productName: "Good Knight Refill", quantity: 1, unitPrice: 95, totalPrice: 95 },
      { id: "I7", productName: "Lizol 500ml", quantity: 1, unitPrice: 155, totalPrice: 155 },
      { id: "I8", productName: "Ariel Matic 500g", quantity: 1, unitPrice: 175, totalPrice: 175 },
    ],
    itemCount: 8, subtotal: 1377, deliveryFee: 20, platformFee: 5, total: 1402,
    status: "packing", paymentMethod: "cod",
    deliveryAddress: "Near Water Tank, NH Bypass, Kottakkal 676503",
    landmark: "Beside KSRTC Bus Stop",
    createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 60000).toISOString(),
  },
  {
    id: "QB-8818", customerId: "C004", customerName: "Meera Suresh",
    customerPhone: "+91 99471-33445", shopId: "S004", shopName: "QB Bazaar Manjeri",
    items: [
      { id: "I1", productName: "Amul Gold Milk 1L", quantity: 2, unitPrice: 55, totalPrice: 110 },
      { id: "I2", productName: "Britannia Bread 400g", quantity: 1, unitPrice: 48, totalPrice: 48 },
      { id: "I3", productName: "Maggi 2-min Noodles 12pk", quantity: 1, unitPrice: 168, totalPrice: 168 },
    ],
    itemCount: 3, subtotal: 326, deliveryFee: 20, platformFee: 5, total: 351,
    status: "accepted", paymentMethod: "upi",
    deliveryAddress: "Church Street, Manjeri, Malappuram 676121",
    landmark: "Near Catholic Church",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 60000).toISOString(),
  },
  {
    id: "QB-8817", customerId: "C005", customerName: "Suresh Nair",
    customerPhone: "+91 97471-55667", shopId: "S001", shopName: "Fresh Mart Calicut",
    items: [
      { id: "I1", productName: "Tata Salt 1kg", quantity: 3, unitPrice: 24, totalPrice: 72 },
      { id: "I2", productName: "Fortune Refined Oil 2L", quantity: 1, unitPrice: 275, totalPrice: 275 },
      { id: "I3", productName: "Aashirvaad Atta 5kg", quantity: 1, unitPrice: 265, totalPrice: 265 },
      { id: "I4", productName: "Amul Taaza 500ml", quantity: 2, unitPrice: 26, totalPrice: 52 },
      { id: "I5", productName: "Kurkure 90g", quantity: 3, unitPrice: 30, totalPrice: 90 },
    ],
    itemCount: 5, subtotal: 754, deliveryFee: 20, platformFee: 5, total: 779,
    status: "pending", paymentMethod: "wallet",
    deliveryAddress: "Pullarikundu Road, Tirur, Malappuram 676101",
    landmark: "Green gate house",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "QB-8816", customerId: "C006", customerName: "Anjali Das",
    customerPhone: "+91 94481-77889", shopId: "S002", shopName: "Green Valley Store",
    items: [
      { id: "I1", productName: "Amul Paneer 200g", quantity: 1, unitPrice: 88, totalPrice: 88 },
      { id: "I2", productName: "Tropicana Orange 1L", quantity: 1, unitPrice: 125, totalPrice: 125 },
    ],
    itemCount: 2, subtotal: 213, deliveryFee: 20, platformFee: 5, total: 238,
    status: "delivered", paymentMethod: "upi",
    deliveryAddress: "Arafa Complex, Main Bazar, Perinthalmanna 679322",
    landmark: "3rd floor, left side",
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "QB-8815", customerId: "C007", customerName: "Vinod Kumar",
    customerPhone: "+91 91481-99001", shopId: "S003", shopName: "Daily Needs Store",
    items: [
      { id: "I1", productName: "Whisper Ultra 15pc", quantity: 1, unitPrice: 175, totalPrice: 175 },
      { id: "I2", productName: "Baby Johnson Powder 200g", quantity: 1, unitPrice: 189, totalPrice: 189 },
      { id: "I3", productName: "Pampers S 40pc", quantity: 1, unitPrice: 649, totalPrice: 649 },
    ],
    itemCount: 3, subtotal: 1013, deliveryFee: 20, platformFee: 5, total: 1038,
    status: "cancelled", paymentMethod: "upi",
    deliveryAddress: "Veliyamcode, Tirur, Malappuram 676101",
    landmark: "Behind Post Office",
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "QB-8814", customerId: "C008", customerName: "Raji Mohan",
    customerPhone: "+91 98461-11223", shopId: "S004", shopName: "QB Bazaar Manjeri",
    items: [
      { id: "I1", productName: "MTR Rava Idli Mix 500g", quantity: 2, unitPrice: 110, totalPrice: 220 },
      { id: "I2", productName: "Coconut Oil 1L", quantity: 1, unitPrice: 195, totalPrice: 195 },
      { id: "I3", productName: "Red Label Tea 500g", quantity: 1, unitPrice: 190, totalPrice: 190 },
      { id: "I4", productName: "Britannia Good Day 200g", quantity: 2, unitPrice: 40, totalPrice: 80 },
    ],
    itemCount: 4, subtotal: 685, deliveryFee: 20, platformFee: 5, total: 710,
    status: "delivered", paymentMethod: "cod",
    deliveryAddress: "Block C, KPHB Colony, Manjeri 676121",
    landmark: "Opposite Malabar Bank",
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    id: "QB-8813", customerId: "C009", customerName: "Biju Thomas",
    customerPhone: "+91 97471-33445", shopId: "S001", shopName: "Fresh Mart Calicut",
    items: [
      { id: "I1", productName: "Aashirvaad Atta 10kg", quantity: 1, unitPrice: 520, totalPrice: 520 },
      { id: "I2", productName: "Saffola Gold Oil 5L", quantity: 1, unitPrice: 849, totalPrice: 849 },
      { id: "I3", productName: "Tata Tea Premium 500g", quantity: 2, unitPrice: 185, totalPrice: 370 },
      { id: "I4", productName: "Amul Milk 1L", quantity: 4, unitPrice: 55, totalPrice: 220 },
      { id: "I5", productName: "Act II Popcorn 85g", quantity: 5, unitPrice: 35, totalPrice: 175 },
      { id: "I6", productName: "Cadbury 5 Star 50g", quantity: 6, unitPrice: 20, totalPrice: 120 },
      { id: "I7", productName: "Kit Kat 4 Finger 41.5g", quantity: 4, unitPrice: 30, totalPrice: 120 },
      { id: "I8", productName: "Tropicana Mixed 1L", quantity: 2, unitPrice: 130, totalPrice: 260 },
      { id: "I9", productName: "Hide & Seek 100g", quantity: 3, unitPrice: 40, totalPrice: 120 },
    ],
    itemCount: 9, subtotal: 2754, deliveryFee: 20, platformFee: 5, total: 2779,
    status: "out_for_delivery", paymentMethod: "card",
    deliveryAddress: "TC 22/445 Plavil Lane, Calicut 673001",
    landmark: "Near AKG Centre",
    createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "QB-8812", customerId: "C010", customerName: "Lekha Raj",
    customerPhone: "+91 94471-55667", shopId: "S005", shopName: "Quick Pick Supermart",
    items: [
      { id: "I1", productName: "Pepsodent Germi Check 200g", quantity: 1, unitPrice: 88, totalPrice: 88 },
      { id: "I2", productName: "Lux Beauty Soap 100g × 3", quantity: 1, unitPrice: 110, totalPrice: 110 },
      { id: "I3", productName: "Himalaya Face Wash 100ml", quantity: 1, unitPrice: 110, totalPrice: 110 },
    ],
    itemCount: 3, subtotal: 308, deliveryFee: 20, platformFee: 5, total: 333,
    status: "delivered", paymentMethod: "upi",
    deliveryAddress: "Opp. Malabar Gold, Main Road, Tirur 676101",
    landmark: "Anjali Apartments, Ground Floor",
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

// ─── Products ────────────────────────────────────────────────────
export const mockProducts: Product[] = [
  { id: "P001", name: "Amul Gold Milk", category: "Dairy & Eggs", brand: "Amul", unit: "ml", basePrice: 32, offerPrice: 29, barcode: "8901063023582", sku: "AMG-500", stockQuantity: 240, status: "active", images: [], createdAt: "2024-01-10T09:00:00Z" },
  { id: "P002", name: "Fortune Rice Bran Oil", category: "Cooking Oil", brand: "Fortune", unit: "litre", basePrice: 148, offerPrice: 135, barcode: "8901396028091", sku: "FRO-1L", stockQuantity: 85, status: "active", images: [], createdAt: "2024-01-11T09:00:00Z" },
  { id: "P003", name: "Tata Tea Gold", category: "Beverages", brand: "Tata", unit: "g", basePrice: 110, offerPrice: 99, barcode: "8901018003773", sku: "TTG-250", stockQuantity: 120, status: "active", images: [], createdAt: "2024-01-12T09:00:00Z" },
  { id: "P004", name: "Lay's Classic Salted", category: "Snacks", brand: "Lay's", unit: "pack", basePrice: 20, offerPrice: 20, barcode: "8901491503320", sku: "LCS-26", stockQuantity: 300, status: "active", images: [], createdAt: "2024-01-13T09:00:00Z" },
  { id: "P005", name: "India Gate Basmati Rice", category: "Staples & Grains", brand: "India Gate", unit: "kg", basePrice: 499, offerPrice: 449, barcode: "8901072000502", sku: "IGB-5K", stockQuantity: 3, status: "active", images: [], createdAt: "2024-01-14T09:00:00Z" },
  { id: "P006", name: "Haldiram's Namkeen Mix", category: "Snacks", brand: "Haldiram's", unit: "g", basePrice: 80, offerPrice: 72, barcode: "8904004505076", sku: "HNM-200", stockQuantity: 0, status: "active", images: [], createdAt: "2024-01-15T09:00:00Z" },
  { id: "P007", name: "Dove Soap Bar", category: "Personal Care", brand: "Dove", unit: "pack", basePrice: 240, offerPrice: 210, barcode: "8718114960982", sku: "DVS-4PK", stockQuantity: 60, status: "active", images: [], createdAt: "2024-01-16T09:00:00Z" },
  { id: "P008", name: "Nescafé Classic", category: "Beverages", brand: "Nestlé", unit: "g", basePrice: 175, offerPrice: 160, barcode: "8901058825461", sku: "NCF-50", stockQuantity: 45, status: "inactive", images: [], createdAt: "2024-01-17T09:00:00Z" },
  { id: "P009", name: "Aashirvaad Whole Wheat Atta", category: "Staples & Grains", brand: "Aashirvaad", unit: "kg", basePrice: 265, offerPrice: 255, barcode: "8901030849381", sku: "AWA-5K", stockQuantity: 88, status: "active", images: [], createdAt: "2024-01-18T09:00:00Z" },
  { id: "P010", name: "Colgate MaxFresh", category: "Personal Care", brand: "Colgate", unit: "g", basePrice: 105, offerPrice: 99, barcode: "8901314000138", sku: "CMF-150", stockQuantity: 150, status: "active", images: [], createdAt: "2024-01-19T09:00:00Z" },
  { id: "P011", name: "Maggi 2-Minute Noodles", category: "Instant Food", brand: "Nestlé", unit: "pack", basePrice: 175, offerPrice: 168, barcode: "8901058825003", sku: "MGG-12", stockQuantity: 95, status: "active", images: [], createdAt: "2024-01-20T09:00:00Z" },
  { id: "P012", name: "Surf Excel Easy Wash", category: "Home Care", brand: "Surf Excel", unit: "kg", basePrice: 280, offerPrice: 268, barcode: "8710908568695", sku: "SEW-1K", stockQuantity: 70, status: "active", images: [], createdAt: "2024-01-21T09:00:00Z" },
];

// ─── Shops ───────────────────────────────────────────────────────
export const mockShops: Shop[] = [
  { id: "S001", shopName: "Fresh Mart Calicut", ownerName: "Mohammed Farouk", phone: "+91 94471-12345", email: "farouk@freshmart.in", address: "MG Road, Kozhikode, Kerala 673001", gstNumber: "32ABCDE1234F1Z5", fssaiNumber: "11224999000350", commissionRate: 8, status: "approved", totalOrders: 2840, totalRevenue: 892400, rating: 4.8, isLive: true, joinedAt: "2024-01-05T00:00:00Z", password: "fresh123" },
  { id: "S002", shopName: "Green Valley Store", ownerName: "Suresh Babu", phone: "+91 98461-54321", email: "suresh@greenvalley.in", address: "College Road, Malappuram, Kerala 676505", gstNumber: "32XYZAB5678G2H6", fssaiNumber: "11224999000351", commissionRate: 7, status: "approved", totalOrders: 2310, totalRevenue: 724000, rating: 4.6, isLive: true, joinedAt: "2024-01-08T00:00:00Z", password: "green123" },
  { id: "S003", shopName: "Daily Needs Store", ownerName: "Balachandran P", phone: "+91 91481-11223", email: "balan@dailyneeds.in", address: "Town Centre, Tirur, Malappuram 676101", gstNumber: "32PQRST9012I3J7", fssaiNumber: "11224999000352", commissionRate: 8, status: "approved", totalOrders: 1980, totalRevenue: 618000, rating: 4.7, isLive: false, joinedAt: "2024-01-12T00:00:00Z", password: "needs123" },
  { id: "S004", shopName: "QB Bazaar Manjeri", ownerName: "Mary Thomas", phone: "+91 99471-33445", email: "mary@qbbazaar.in", address: "Church Street, Manjeri, Malappuram 676121", gstNumber: "32UVWXY3456K4L8", fssaiNumber: "11224999000353", commissionRate: 9, status: "approved", totalOrders: 1760, totalRevenue: 543000, rating: 4.5, isLive: true, joinedAt: "2024-01-15T00:00:00Z", password: "qb123" },
  { id: "S005", shopName: "Quick Pick Supermart", ownerName: "Rahul Sharma", phone: "+91 97471-55667", email: "rahul@quickpick.in", address: "NH Bypass, Kottakkal, Malappuram 676503", gstNumber: "32MNOPQ7890M5N9", fssaiNumber: "11224999000354", commissionRate: 8, status: "approved", totalOrders: 1540, totalRevenue: 481000, rating: 4.3, isLive: true, joinedAt: "2024-01-18T00:00:00Z", password: "pick123" },
  // Pending
  { id: "S006", shopName: "Kerala Supermarket", ownerName: "Anil Raj", phone: "+91 94471-99001", email: "anil@kmart.in", address: "Main Road, Perinthalmanna 679322", gstNumber: "32ABFDE1234F1A5", commissionRate: 8, status: "pending", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-18T00:00:00Z", password: "partner123" },
  { id: "S007", shopName: "Fresh Picks Store", ownerName: "Rajan Nair", phone: "+91 98461-11234", email: "rajan@freshpicks.in", address: "College Road, Malappuram 676505", gstNumber: "32XYZCD5678G2A6", commissionRate: 8, status: "pending", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-19T00:00:00Z", password: "partner123" },
  { id: "S008", shopName: "City Grocery Hub", ownerName: "Sreejith M", phone: "+91 91481-22334", email: "sreejith@cityhub.in", address: "Town Centre, Tirur 676101", gstNumber: "32PQRTU9012I3A7", commissionRate: 8, status: "pending", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-19T00:00:00Z", password: "partner123" },
  { id: "S009", shopName: "Velankanni Stores", ownerName: "Basheer K", phone: "+91 99471-44556", email: "basheer@velankanni.in", address: "Market Road, Kottakkal 676503", gstNumber: "32UVWAB3456K4A8", commissionRate: 8, status: "pending", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-20T00:00:00Z", password: "partner123" },
  { id: "S010", shopName: "Daily Fresh Mart", ownerName: "Jose Mathew", phone: "+91 97471-66778", email: "jose@dfmart.in", address: "Near Railway Station, Manjeri 676121", gstNumber: "32MNOPZ7890M5A9", commissionRate: 8, status: "pending", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-20T00:00:00Z", password: "partner123" },
  // Rejected
  { id: "S011", shopName: "Old Town Grocery", ownerName: "Ravi Kumar", phone: "+91 94471-88990", email: "ravi@otg.in", address: "Old Town, Calicut 673001", gstNumber: "32ABCDE9999F1Z5", commissionRate: 0, status: "rejected", totalOrders: 0, totalRevenue: 0, rating: 0, isLive: false, joinedAt: "2024-04-10T00:00:00Z", password: "partner123" },
];

// ─── Settlements ─────────────────────────────────────────────────
export const mockSettlements: Settlement[] = [
  { id: "SET001", shopId: "S001", shopName: "Fresh Mart Calicut", weekStart: "2024-04-14", weekEnd: "2024-04-20", totalOrders: 284, grossRevenue: 89200, commissionRate: 8, commissionAmount: 7136, deliveryFees: 5680, platformFees: 1420, netPayout: 87744, status: "completed", processedAt: "2024-04-22T08:00:00Z" },
  { id: "SET002", shopId: "S002", shopName: "Green Valley Store", weekStart: "2024-04-14", weekEnd: "2024-04-20", totalOrders: 231, grossRevenue: 72400, commissionRate: 7, commissionAmount: 5068, deliveryFees: 4620, platformFees: 1155, netPayout: 71952, status: "completed", processedAt: "2024-04-22T08:00:00Z" },
  { id: "SET003", shopId: "S003", shopName: "Daily Needs Store", weekStart: "2024-04-14", weekEnd: "2024-04-20", totalOrders: 198, grossRevenue: 61800, commissionRate: 8, commissionAmount: 4944, deliveryFees: 3960, platformFees: 990, netPayout: 60816, status: "pending" },
  { id: "SET004", shopId: "S004", shopName: "QB Bazaar Manjeri", weekStart: "2024-04-14", weekEnd: "2024-04-20", totalOrders: 176, grossRevenue: 54300, commissionRate: 9, commissionAmount: 4887, deliveryFees: 3520, platformFees: 880, netPayout: 53433, status: "pending" },
  { id: "SET005", shopId: "S005", shopName: "Quick Pick Supermart", weekStart: "2024-04-14", weekEnd: "2024-04-20", totalOrders: 154, grossRevenue: 48100, commissionRate: 8, commissionAmount: 3848, deliveryFees: 3080, platformFees: 770, netPayout: 47332, status: "processing" },
];

// ─── Analytics ───────────────────────────────────────────────────
export const mockDailyMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  const orders = Math.round(700 + Math.random() * 700 + (i > 24 ? 200 : 0));
  const revenue = Math.round(orders * (280 + Math.random() * 60));
  return { date: d.toISOString().split("T")[0], orders, revenue, aov: Math.round(revenue / orders) };
});

export const mockHourlyOrders: HourlyOrders[] = [
  { hour: 0, orders: 2 }, { hour: 1, orders: 1 }, { hour: 2, orders: 0 },
  { hour: 3, orders: 0 }, { hour: 4, orders: 0 }, { hour: 5, orders: 4 },
  { hour: 6, orders: 18 }, { hour: 7, orders: 45 }, { hour: 8, orders: 72 },
  { hour: 9, orders: 88 }, { hour: 10, orders: 76 }, { hour: 11, orders: 65 },
  { hour: 12, orders: 70 }, { hour: 13, orders: 60 }, { hour: 14, orders: 55 },
  { hour: 15, orders: 48 }, { hour: 16, orders: 80 }, { hour: 17, orders: 110 },
  { hour: 18, orders: 130 }, { hour: 19, orders: 118 }, { hour: 20, orders: 90 },
  { hour: 21, orders: 65 }, { hour: 22, orders: 40 }, { hour: 23, orders: 18 },
];

export const mockCategoryRevenue: CategoryRevenue[] = [
  { category: "Dairy & Eggs", revenue: 485000, percentage: 28 },
  { category: "Staples & Grains", revenue: 380000, percentage: 22 },
  { category: "Beverages", revenue: 311000, percentage: 18 },
  { category: "Snacks", revenue: 259000, percentage: 15 },
  { category: "Personal Care", revenue: 173000, percentage: 10 },
  { category: "Home Care", revenue: 121000, percentage: 7 },
];

// ─── KPI ─────────────────────────────────────────────────────────
export const mockKpi: KpiData = {
  totalOrdersToday: 1284,
  totalRevenueToday: 380400,
  activeShops: 47,
  pendingApplications: 5,
  ordersChange: 18,
  revenueChange: 24,
  shopsChange: 3,
};

// ─── Settings ────────────────────────────────────────────────────
export const mockSettings: PlatformSettings = {
  deliveryRadius: 5,
  minimumOrderAmount: 99,
  platformFee: 5,
  deliveryFee: 20,
  defaultCommission: 8,
  platformName: "QuickBasket",
  supportEmail: "support@quickbasket.in",
  partnerEmail: "partners@quickbasket.in",
  supportPhone: "+91 XXXXX XXXXX",
  notifyNewOrder: true,
  notifyNewShop: true,
  notifySettlement: true,
  notifyLowStock: false,
};

// ─── Best Selling Products ────────────────────────────────────────
export const bestSellingProducts = [
  { name: "Amul Gold Milk 500ml", sold: 2840, category: "Dairy", percentage: 85, icon: "🥛" },
  { name: "Tata Tea Gold 250g", sold: 2120, category: "Beverages", percentage: 72, icon: "🍵" },
  { name: "Fortune Rice Bran Oil 1L", sold: 1840, category: "Cooking Oil", percentage: 61, icon: "🛢️" },
  { name: "Lay's Classic Salted 26g", sold: 1620, category: "Snacks", percentage: 54, icon: "🍟" },
  { name: "Aashirvaad Atta 5kg", sold: 1340, category: "Staples", percentage: 44, icon: "🌾" },
];

// ─── Customers ────────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  {
    id: "C001",
    name: "Ananya Nair",
    email: "ananya@example.com",
    phone: "9123456780",
    status: "active",
    totalOrders: 4,
    totalSpent: 2372,
    joinedAt: "2024-01-10T12:00:00Z",
    addresses: ["Flat 4B, Indiranagar, Bengaluru – 560038", "Tech Park, Block A, Whitefield, Bengaluru – 560066"],
  },
  {
    id: "C002",
    name: "Ravi Kumar",
    email: "ravi.kumar@gmail.com",
    phone: "9876543210",
    status: "active",
    totalOrders: 3,
    totalSpent: 3050,
    joinedAt: "2024-01-12T14:30:00Z",
    addresses: ["14/B Railway Colony, Perinthalmanna, Malappuram 679322"],
  },
  {
    id: "C003",
    name: "Priya Menon",
    email: "priya.menon@outlook.com",
    phone: "9988776655",
    status: "active",
    totalOrders: 2,
    totalSpent: 1477,
    joinedAt: "2024-01-15T09:15:00Z",
    addresses: ["Opp. Govt Hospital, College Road, Malappuram 676505"],
  },
  {
    id: "C004",
    name: "Arun Pillai",
    email: "arun.pillai@yahoo.com",
    phone: "9001234567",
    status: "active",
    totalOrders: 1,
    totalSpent: 771,
    joinedAt: "2024-01-18T10:45:00Z",
    addresses: ["Near Water Tank, NH Bypass, Kottakkal 676503"],
  },
  {
    id: "C005",
    name: "Suresh Nair",
    email: "suresh.nair@hotmail.com",
    phone: "+91 97471-55667",
    status: "active",
    totalOrders: 18,
    totalSpent: 9940,
    joinedAt: "2024-01-20T16:20:00Z",
    addresses: ["Pullarikundu Road, Tirur, Malappuram 676101"],
  },
  {
    id: "C006",
    name: "Anjali Das",
    email: "anjali.das@gmail.com",
    phone: "+91 94481-77889",
    status: "banned",
    totalOrders: 4,
    totalSpent: 1250,
    joinedAt: "2024-02-02T11:00:00Z",
    addresses: ["Arafa Complex, Main Bazar, Perinthalmanna 679322"],
  },
];

// ─── Promo Codes ──────────────────────────────────────────────────
export const mockPromoCodes: PromoCode[] = [
  {
    id: "PC001",
    code: "GRABU10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 199,
    maxDiscount: 100,
    usageLimit: 1000,
    usageCount: 245,
    totalSavings: 12250,
    status: "active",
    startsAt: "2024-01-01T00:00:00Z",
    expiresAt: "2024-12-31T23:59:59Z",
  },
  {
    id: "PC002",
    code: "FIRST50",
    discountType: "flat",
    discountValue: 50,
    minOrderAmount: 299,
    usageLimit: 500,
    usageCount: 189,
    totalSavings: 9450,
    status: "active",
    startsAt: "2024-01-01T00:00:00Z",
    expiresAt: "2024-06-30T23:59:59Z",
  },
  {
    id: "PC003",
    code: "FREEDELIVERY",
    discountType: "flat",
    discountValue: 20,
    minOrderAmount: 149,
    usageLimit: 2000,
    usageCount: 840,
    totalSavings: 16800,
    status: "active",
    startsAt: "2024-01-01T00:00:00Z",
    expiresAt: "2024-12-31T23:59:59Z",
  },
  {
    id: "PC004",
    code: "SUPER30",
    discountType: "percentage",
    discountValue: 30,
    minOrderAmount: 499,
    maxDiscount: 150,
    usageLimit: 200,
    usageCount: 200,
    totalSavings: 28400,
    status: "expired",
    startsAt: "2024-01-01T00:00:00Z",
    expiresAt: "2024-03-31T23:59:59Z",
  },
];

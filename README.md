# QuickBasket Admin Panel

> Production-ready multi-store grocery delivery admin panel built with Next.js 14, TypeScript, Tailwind CSS, Zustand, Recharts and Framer Motion.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 📁 Folder Structure

```
src/
├── app/                        # Next.js 14 App Router pages
│   ├── layout.tsx              # Root layout (sidebar + topbar)
│   ├── globals.css             # Global styles + Tailwind
│   ├── page.tsx                # Redirects → /dashboard
│   ├── dashboard/page.tsx      # Dashboard with KPIs + charts
│   ├── orders/page.tsx         # Live orders monitoring
│   ├── products/page.tsx       # Master product catalogue
│   ├── shops/page.tsx          # Shop onboarding & approval
│   ├── settlements/page.tsx    # Commission & settlement panel
│   ├── analytics/page.tsx      # Full analytics dashboard
│   └── settings/page.tsx       # Platform settings
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Collapsible sidebar nav
│   │   └── Topbar.tsx          # Header with search + actions
│   ├── charts/
│   │   └── Charts.tsx          # Recharts wrappers (bar, line, area, donut)
│   ├── modals/
│   │   ├── OrderDrawer.tsx     # Slide-in order detail drawer
│   │   └── AddProductModal.tsx # Add product form modal (RHF + Zod)
│   └── ui/
│       ├── KpiCard.tsx         # Metric KPI card component
│       ├── StatusBadge.tsx     # Order/shop/product status badge
│       └── Toaster.tsx         # Toast notification system
│
├── data/
│   └── mock.ts                 # All mock data (orders, products, shops, etc.)
│
├── store/
│   └── app-store.ts            # Zustand global state store
│
├── types/
│   └── index.ts                # TypeScript type definitions
│
└── lib/
    └── utils.ts                # Utilities: cn(), formatCurrency(), timeAgo()
```

---

## 🛠 Tech Stack

| Tool            | Purpose                          |
|-----------------|----------------------------------|
| Next.js 14      | App Router, server components    |
| TypeScript      | Type safety everywhere           |
| Tailwind CSS    | Utility-first styling            |
| Zustand         | Lightweight global state         |
| Recharts        | Charts (bar, line, area, donut)  |
| Framer Motion   | Page and component animations    |
| React Hook Form | Form management                  |
| Zod             | Form validation schemas          |
| Lucide React    | Icon library                     |

---

## 📄 Pages

| Route           | Description                                          |
|-----------------|------------------------------------------------------|
| `/dashboard`    | KPI cards, 7-day orders chart, revenue trend, top shops, recent orders |
| `/orders`       | All orders with status filters, search, pagination, detail drawer |
| `/products`     | Full product catalogue with CRUD, filters, add modal |
| `/shops`        | Shop applications: Pending / Approved / Rejected tabs, approve/reject actions |
| `/settlements`  | Weekly settlement table with net payout calculation per shop |
| `/analytics`    | Revenue + orders charts, peak hours, best sellers, category breakdown |
| `/settings`     | Platform fees, delivery config, notifications, roles & permissions |

---

## 🔌 Connecting to a Real Backend

All mock data lives in `src/data/mock.ts`. To connect your APIs:

1. Replace mock data imports with `fetch()` or `axios` calls in each page
2. The Zustand store in `src/store/app-store.ts` is ready to receive real data
3. All TypeScript types in `src/types/index.ts` match your backend models

Example:
```ts
// Instead of:
import { mockOrders } from "@/data/mock";

// Use:
const orders = await fetch("/api/orders").then(r => r.json());
```

---

## 💡 Platform Logic (from QuickBasket Partner Guide)

- **Delivery Fee**: ₹20 flat, passed to shop owner
- **Platform Fee**: ₹5 per order, kept by QuickBasket  
- **Commission**: 7–9% of product subtotal (configurable per shop)
- **Settlement**: Weekly (Monday), net = gross − commission + delivery fees
- **Minimum Order**: ₹99 default
- **Delivery Radius**: 5 km default

---

## 🎨 Design System

The UI uses a custom dark theme defined in `globals.css` with CSS variables:

```css
--bg:     #0f1117   /* Page background        */
--bg2:    #1a1d27   /* Card background         */
--bg3:    #22263a   /* Input / hover bg        */
--border: #2e3454   /* All borders             */
--accent: #3b82f6   /* Blue primary            */
--green:  #10b981   /* Success / live          */
--amber:  #f59e0b   /* Warning / pending       */
--red:    #ef4444   /* Error / cancelled       */
--purple: #8b5cf6   /* Purple accent           */
```

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

Built for QuickBasket — 10-minute grocery delivery platform serving Malappuram & Kozhikode, Kerala.

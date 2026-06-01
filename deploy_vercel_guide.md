# 🚀 GrabU Admin Panel — Vercel Deployment Guide

Follow these steps to host your **GrabU Next.js Admin Panel** on Vercel for free. This enables your entire team to test order flows, view customer accounts, and configure coupon codes from anywhere in the world!

---

## 📋 Prerequisites
1. A **GitHub** account (free).
2. A **Vercel** account (free) — sign up at [vercel.com](https://vercel.com) using your GitHub login.
3. Your **Supabase Project URL** and **Anon Public API Key** ready.

---

## 🛠️ Step 1 — Push Your Codebase to GitHub

If you haven't uploaded your repository to GitHub yet:

1. **Initialize Git** in your local GrabU project root folder:
   ```bash
   git init
   ```
2. **Add all files** to the staging area:
   ```bash
   git add .
   ```
3. **Commit your work**:
   ```bash
   git commit -m "feat: complete end-to-end Supabase syncing and Razorpay integration"
   ```
4. **Create a new repository** on [github.com](https://github.com) (e.g. `GrabU-App`).
5. **Link and push** to your new remote repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Step 2 — Import Project to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Add New...** button and select **Project**.
3. Under "Import Git Repository", locate your `GrabU-App` repository and click **Import**.

---

## ⚙️ Step 3 — Configure Vercel Project Settings

Because your project is a multi-app repository, we need to configure the **Root Directory** so Vercel builds only the Admin Panel folder:

1. **Root Directory**:
   - In the Vercel project configuration window, click **Edit** next to "Root Directory".
   - Select the **`GrabU_Admin`** folder and click **Save**.
2. **Build & Development Settings**:
   - Vercel automatically detects Next.js! Leave these settings at their defaults.

---

## 🔑 Step 4 — Set Up Environment Variables

To allow the Admin Panel to connect to your real Supabase cloud database, you **must** supply your API keys:

1. Expand the **Environment Variables** section.
2. Add the following key-value pairs matching your `.env.local` keys:

| Key | Value (Paste from your dashboard) |
|---|---|
| **`NEXT_PUBLIC_SUPABASE_URL`** | `https://ibophltufhguhnuybaaj.supabase.co` |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | `sb_publishable_5R0dtc7BcnTYG5A6m_iSjA__EFlOwVs` |

3. Click **Add** for each variable.

---

## 🚀 Step 5 — Deploy!

1. Click the blue **Deploy** button at the bottom!
2. Vercel will bundle and compile your Next.js app in under 2 minutes.
3. Once completed, you will receive a premium deployment link (e.g., `https://grabu-admin.vercel.app`)!

---

## ⚡ Real-Time Testing Verification

Once deployed:
1. Open the **Customer App** and purchase items using **Razorpay (Test Mode)**.
2. Open your live **Vercel Admin Link** in any browser.
3. Tap the **Orders** page — you will see your order instantly display with a `placed` / `pending` status badge without ever needing to refresh!

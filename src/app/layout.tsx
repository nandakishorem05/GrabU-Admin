import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { AdminAuthWrapper } from "@/components/layout/AdminAuthWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GrabU Admin",
  description: "GrabU Multi-Store Grocery Delivery Platform — Admin Panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#0f1117] text-white antialiased`}>
        <AdminAuthWrapper>{children}</AdminAuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SupabaseSyncProvider } from "@/components/providers/SupabaseSyncProvider";

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem("grabu_admin_logged_in") === "true";
    setIsAuthenticated(isLoggedIn);

    if (!isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    } else if (isLoggedIn && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  // Keep rendering matched server HTML on first load to prevent hydration mismatches
  if (!isMounted) {
    if (pathname === "/login") {
      return <>{children}</>;
    }
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Once mounted, check routes on the client side
  if (pathname === "/login") {
    // If user is already logged in, show spinner while redirecting to avoid a visible login screen flash
    if (isAuthenticated) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect shortly to /login
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          <SupabaseSyncProvider>{children}</SupabaseSyncProvider>
        </main>
      </div>
    </div>
  );
}

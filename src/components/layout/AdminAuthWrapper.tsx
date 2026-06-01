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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("grabu_admin_logged_in") === "true";
    setIsAuthenticated(isLoggedIn);

    if (!isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    } else if (isLoggedIn && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect shortly
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

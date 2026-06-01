"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Clean, robust credentials validation
      if (email.trim().toLowerCase() === "admin@grabu.in" && password === "admin123") {
        localStorage.setItem("grabu_admin_logged_in", "true");
        toast("Welcome Back Admin! 👋", "success");
        router.replace("/dashboard");
      } else {
        setLoading(false);
        toast("Invalid email or password. Please try again.", "error");
      }
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0c10] px-4">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[80px]" />

      <div className="relative w-full max-w-[430px] rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Logo & Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">GrabU Admin</h2>
          <p className="mt-1.5 text-xs text-[#6b7290]">
            Grocery platform management & metrics portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9aa0c0]" htmlFor="email">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7290]" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@grabu.in"
                className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-[#4b5563] outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9aa0c0]" htmlFor="password">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7290]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-3 pl-11 pr-11 text-sm text-white placeholder-[#4b5563] outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7290] hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-600/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating Session...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-[#4b5563]">
          Authorized Administrator Personnel Only · GrabU © 2026
        </div>
      </div>
    </div>
  );
}

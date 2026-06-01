"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import type { Shop } from "@/types";

const schema = z.object({
  shopName:       z.string().min(3, "Shop name must be at least 3 characters"),
  ownerName:      z.string().min(3, "Owner name must be at least 3 characters"),
  phone:          z.string().regex(/^\d{10}$/, "Must be a valid 10-digit mobile number"),
  email:          z.string().email("Must be a valid email address"),
  address:        z.string().min(10, "Please enter a detailed physical address"),
  commissionRate: z.coerce.number().min(0, "Cannot be negative").max(30, "Max 30% commission"),
  password:       z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

interface AddShopModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddShopModal({ open, onClose }: AddShopModalProps) {
  const addShop = useAppStore((s) => s.addShop);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { commissionRate: 8.0, password: "partner123" },
  });

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", pass, { shouldValidate: true });
    toast("Generated a secure random password!");
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    const shop: Shop = {
      id: `o-${Date.now().toString().slice(-4)}`,
      shopName: data.shopName,
      ownerName: data.ownerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      gstNumber: "29GST" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      commissionRate: data.commissionRate,
      status: "approved", // Directly approved when onboarding from admin
      totalOrders: 0,
      totalRevenue: 0,
      rating: 5.0,
      isLive: true,
      joinedAt: new Date().toISOString(),
      password: data.password,
    };

    addShop(shop);
    toast(`🏪 "${data.shopName}" onboarded successfully! ✓`);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-[600px] max-w-full max-h-[90vh] overflow-y-auto bg-[#13151f] border border-[#2e3454] rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2235] sticky top-0 bg-[#13151f] z-10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Store size={16} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Onboard New Supermarket</h2>
                <p className="text-[11px] text-[#6b7290]">Registers partner, generates portal password &amp; syncs to Supabase</p>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto w-8 h-8 rounded-lg bg-[#1e2235] flex items-center justify-center text-[#6b7290] hover:text-white hover:bg-[#2a2f45] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              
              {/* Shop Name & Owner Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Shop Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("shopName")}
                    placeholder="e.g. Fresh Mart Indiranagar"
                    className={`input-base w-full mt-1.5 ${errors.shopName ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.shopName && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.shopName.message}</p>}
                </div>
                <div>
                  <label className="form-label">Owner Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("ownerName")}
                    placeholder="e.g. Ravi Kumar"
                    className={`input-base w-full mt-1.5 ${errors.ownerName ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.ownerName && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.ownerName.message}</p>}
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Contact Phone <span className="text-red-400">*</span></label>
                  <input
                    {...register("phone")}
                    placeholder="10-digit number"
                    className={`input-base w-full mt-1.5 ${errors.phone ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.phone && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.phone.message}</p>}
                </div>
                <div>
                  <label className="form-label">Contact Email <span className="text-red-400">*</span></label>
                  <input
                    {...register("email")}
                    placeholder="e.g. contact@freshmart.in"
                    className={`input-base w-full mt-1.5 ${errors.email ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.email && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.email.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="form-label">Shop Address <span className="text-red-400">*</span></label>
                <textarea
                  {...register("address")}
                  rows={2}
                  placeholder="Full physical address..."
                  className={`input-base w-full mt-1.5 resize-none py-2 ${errors.address ? "border-red-500/60" : ""}`}
                />
                {errors.address && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.address.message}</p>}
              </div>

              {/* Commission Rate & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Commission Rate (%)</label>
                  <input
                    {...register("commissionRate")}
                    type="number" step="0.5"
                    className="input-base w-full mt-1.5 text-center font-bold"
                  />
                  {errors.commissionRate && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.commissionRate.message}</p>}
                </div>
                <div>
                  <label className="form-label">Portal Password <span className="text-red-400">*</span></label>
                  <div className="relative mt-1.5">
                    <input
                      {...register("password")}
                      type="text"
                      className={`input-base w-full pr-10 font-mono ${errors.password ? "border-red-500/60" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-[#1e2235] text-[#9aa0c0] hover:text-white flex items-center justify-center transition-colors"
                      title="Generate Secure Password"
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-[11px] mt-1">⚠ {errors.password.message}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-1 border-t border-[#1e2235]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-ghost px-5 py-2 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-6 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" />Onboarding...</>
                  ) : (
                    <><CheckCircle2 size={14} />Approve &amp; Onboard</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

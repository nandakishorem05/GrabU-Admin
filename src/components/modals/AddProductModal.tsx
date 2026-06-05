"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CheckCircle2, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

const schema = z.object({
  name:          z.string().min(2, "Product name is required"),
  category:      z.string().min(1, "Please select a category"),
  brand:         z.string().min(1, "Brand is required"),
  barcode:       z.string().optional(),
  sku:           z.string().optional(),
  status:        z.enum(["active", "inactive"]),
  emoji:         z.string().optional(),
  imageUrl:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Vegetables & Fruits", "Staples", "Dairy", "Bakery", "Snacks", "Beverages", "Cleaning", "Personal Care", "Instant Food",
];



const EMOJI_OPTIONS = ["🥛","🧀","🥚","🍚","🌾","🧴","🧼","🛢️","🥤","🍫","🥗","🧊","📦"];

export function AddProductModal({ open, onClose }: AddProductModalProps) {
  const addProduct = useAppStore((s) => s.addProduct);
  const [saving, setSaving] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("📦");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    const product: Product = {
      id: `mp-${Date.now()}`,
      name: data.name,
      category: data.category,
      brand: data.brand,
      unit: "piece",
      basePrice: 0.0,
      offerPrice: 0.0,
      barcode: data.barcode || `BAR${Date.now()}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      stockQuantity: 0,
      status: data.status,
      images: [data.imageUrl || selectedEmoji],
      createdAt: new Date().toISOString(),
    };
    addProduct(product);
    toast(`"${data.name}" added to Master Catalogue ✓`);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    reset();
    setSelectedEmoji("📦");
    onClose();
  };

  const handleClose = () => {
    reset();
    setSelectedEmoji("📦");
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
            className="relative z-10 w-[620px] max-w-full max-h-[88vh] overflow-y-auto bg-[#13151f] border border-[#2e3454] rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2235] sticky top-0 bg-[#13151f] z-10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Package size={16} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Add New Product</h2>
                <p className="text-[11px] text-[#6b7290]">Adds to Master Catalogue &amp; syncs to Supabase</p>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto w-8 h-8 rounded-lg bg-[#1e2235] flex items-center justify-center text-[#6b7290] hover:text-white hover:bg-[#2a2f45] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* Emoji picker */}
              <div>
                <label className="form-label">Product Icon</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setSelectedEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        selectedEmoji === e
                          ? "bg-blue-600/30 ring-2 ring-blue-500 scale-110"
                          : "bg-[#1e2235] hover:bg-[#2a2f45]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                  <div className="w-9 h-9 rounded-lg bg-[#1e2235] flex items-center justify-center text-xl ring-2 ring-blue-500/50">
                    {selectedEmoji}
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="form-label">Product Image URL (Optional)</label>
                <input
                  {...register("imageUrl")}
                  placeholder="https://example.com/product-image.webp"
                  className="input-base w-full mt-1.5"
                />
                <p className="text-[10px] text-[#6b7290] mt-1">
                  Provides a high-quality product photo (replaces icon on clients).
                </p>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Product Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Amul Gold Milk"
                    className={`input-base w-full mt-1.5 ${errors.name ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">⚠ {errors.name.message}</p>}
                </div>
                <div>
                  <label className="form-label">Brand <span className="text-red-400">*</span></label>
                  <input
                    {...register("brand")}
                    placeholder="e.g. Amul"
                    className={`input-base w-full mt-1.5 ${errors.brand ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                  {errors.brand && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">⚠ {errors.brand.message}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category <span className="text-red-400">*</span></label>
                <select
                  {...register("category")}
                  className={`input-base w-full mt-1.5 ${errors.category ? "border-red-500/60" : ""}`}
                >
                  <option value="">— Select category —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">⚠ {errors.category.message}</p>}
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">SKU</label>
                  <input
                    {...register("sku")}
                    placeholder="e.g. AMG-500"
                    className="input-base w-full mt-1.5"
                  />
                  <p className="text-[10px] text-[#6b7290] mt-1">Auto-generated if blank</p>
                </div>
                <div>
                  <label className="form-label">Barcode</label>
                  <input
                    {...register("barcode")}
                    placeholder="13-digit EAN"
                    className="input-base w-full mt-1.5"
                  />
                  <p className="text-[10px] text-[#6b7290] mt-1">Auto-generated if blank</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 bg-[#1e2235] rounded-xl border border-[#2e3454]">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Product Status</p>
                  <p className="text-[11px] text-[#6b7290] mt-0.5">Active products appear in partner product lists</p>
                </div>
                <select {...register("status")} className="input-base text-sm">
                  <option value="active">✅ Active</option>
                  <option value="inactive">⛔ Inactive</option>
                </select>
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
                    <><Loader2 size={14} className="animate-spin" />Saving...</>
                  ) : (
                    <><CheckCircle2 size={14} />Save to Catalogue</>
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

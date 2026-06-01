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
  unit:          z.enum(["kg", "g", "litre", "ml", "pack", "piece", "500g", "250g", "1L", "75cl"]),
  basePrice:     z.coerce.number().min(1, "Must be > 0"),
  offerPrice:    z.coerce.number().min(1, "Must be > 0"),
  barcode:       z.string().optional(),
  sku:           z.string().optional(),
  stockQuantity: z.coerce.number().min(0).default(0),
  status:        z.enum(["active", "inactive"]),
  emoji:         z.string().optional(),
}).refine((d) => d.offerPrice <= d.basePrice, {
  message: "Offer price must be ≤ base price",
  path: ["offerPrice"],
});

type FormValues = z.infer<typeof schema>;

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Dairy & Eggs", "Cooking Oil", "Beverages", "Snacks",
  "Staples & Grains", "Staples", "Personal Care", "Home Care",
  "Instant Food", "Fruits & Vegetables", "Frozen Foods",
];

const UNITS = [
  { value: "piece", label: "piece" },
  { value: "pack",  label: "pack" },
  { value: "kg",    label: "kg" },
  { value: "g",     label: "g" },
  { value: "500g",  label: "500g" },
  { value: "250g",  label: "250g" },
  { value: "litre", label: "litre" },
  { value: "1L",    label: "1L" },
  { value: "ml",    label: "ml" },
  { value: "75cl",  label: "75cl" },
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", unit: "piece", stockQuantity: 0, offerPrice: 0, basePrice: 0 },
  });

  const basePrice = watch("basePrice");
  const offerPrice = watch("offerPrice");
  const discount = basePrice > 0 && offerPrice > 0 && offerPrice < basePrice
    ? Math.round(((basePrice - offerPrice) / basePrice) * 100)
    : 0;

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    const product: Product = {
      id: `mp-${Date.now()}`,
      name: data.name,
      category: data.category,
      brand: data.brand,
      unit: data.unit as any,
      basePrice: data.basePrice,
      offerPrice: data.offerPrice,
      barcode: data.barcode || `BAR${Date.now()}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      stockQuantity: data.stockQuantity,
      status: data.status,
      images: [selectedEmoji],
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[620px] max-w-[96vw] max-h-[92vh] overflow-y-auto bg-[#13151f] border border-[#2e3454] rounded-2xl shadow-2xl"
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

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="form-label">Unit <span className="text-red-400">*</span></label>
                  <select {...register("unit")} className="input-base w-full mt-1.5">
                    {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="form-label mb-1.5 block">Pricing <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290] text-sm font-semibold">₹</span>
                      <input
                        {...register("basePrice")}
                        type="number" min="0" step="0.5"
                        placeholder="MRP / Base Price"
                        className={`input-base w-full pl-7 ${errors.basePrice ? "border-red-500/60" : ""}`}
                      />
                    </div>
                    <p className="text-[10px] text-[#6b7290] mt-1">Base / MRP</p>
                    {errors.basePrice && <p className="text-red-400 text-[11px]">⚠ {errors.basePrice.message}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290] text-sm font-semibold">₹</span>
                      <input
                        {...register("offerPrice")}
                        type="number" min="0" step="0.5"
                        placeholder="Selling Price"
                        className={`input-base w-full pl-7 ${errors.offerPrice ? "border-red-500/60" : ""}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-[#6b7290]">Offer / Selling Price</p>
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                          {discount}% off
                        </span>
                      )}
                    </div>
                    {errors.offerPrice && <p className="text-red-400 text-[11px]">⚠ {errors.offerPrice.message}</p>}
                  </div>
                </div>
              </div>

              {/* SKU, Barcode, Stock */}
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="form-label">Stock</label>
                  <input
                    {...register("stockQuantity")}
                    type="number" min="0"
                    placeholder="0"
                    className="input-base w-full mt-1.5"
                  />
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
        </>
      )}
    </AnimatePresence>
  );
}

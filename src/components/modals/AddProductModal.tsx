"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

const schema = z.object({
  name:          z.string().min(2, "Required"),
  category:      z.string().min(1, "Required"),
  brand:         z.string().min(1, "Required"),
  unit:          z.enum(["kg", "g", "litre", "ml", "pack", "piece"]),
  basePrice:     z.coerce.number().min(1, "Required"),
  offerPrice:    z.coerce.number().min(1, "Required"),
  barcode:       z.string().min(1, "Required"),
  sku:           z.string().min(1, "Required"),
  stockQuantity: z.coerce.number().min(0),
  status:        z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Dairy & Eggs", "Cooking Oil", "Beverages", "Snacks",
  "Staples & Grains", "Personal Care", "Home Care", "Instant Food",
  "Fruits & Vegetables", "Frozen Foods",
];

export function AddProductModal({ open, onClose }: AddProductModalProps) {
  const addProduct = useAppStore((s) => s.addProduct);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", unit: "piece", stockQuantity: 0 },
  });

  const onSubmit = (data: FormValues) => {
    const product: Product = {
      id: `P${Date.now()}`,
      ...data,
      images: [],
      createdAt: new Date().toISOString(),
    };
    addProduct(product);
    toast(`"${data.name}" added to catalogue`);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[580px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-[#1a1d27] border border-[#2e3454] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white">Add New Product</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-[#9aa0c0] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Product Name *</label>
                  <input {...register("name")} placeholder="e.g. Amul Gold Milk" className="input-base w-full" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Brand *</label>
                  <input {...register("brand")} placeholder="e.g. Amul" className="input-base w-full" />
                  {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand.message}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Category *</label>
                  <select {...register("category")} className="input-base w-full">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Unit *</label>
                  <select {...register("unit")} className="input-base w-full">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                    <option value="pack">pack</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Base Price (₹) *</label>
                  <input {...register("basePrice")} type="number" min="0" placeholder="0" className="input-base w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Offer Price (₹) *</label>
                  <input {...register("offerPrice")} type="number" min="0" placeholder="0" className="input-base w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">SKU *</label>
                  <input {...register("sku")} placeholder="e.g. AMG-500" className="input-base w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Barcode *</label>
                  <input {...register("barcode")} placeholder="13-digit barcode" className="input-base w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Stock Quantity</label>
                  <input {...register("stockQuantity")} type="number" min="0" placeholder="0" className="input-base w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Status</label>
                  <select {...register("status")} className="input-base w-full">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">Product Images</label>
                <div className="border-2 border-dashed border-[#2e3454] rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer group">
                  <Upload size={20} className="mx-auto text-[#6b7290] mb-2 group-hover:text-blue-400" />
                  <p className="text-sm text-[#9aa0c0]">Drop images here or <span className="text-blue-400">click to upload</span></p>
                  <p className="text-xs text-[#6b7290] mt-1">PNG, JPG, WEBP up to 5MB each</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={onClose} className="btn-ghost px-6 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-6 py-2 rounded-lg">Save Product</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Shield } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import type { PlatformSettings } from "@/types";

const schema = z.object({
  deliveryRadius:      z.coerce.number().min(1).max(50),
  minimumOrderAmount:  z.coerce.number().min(0),
  platformFee:         z.coerce.number().min(0),
  deliveryFee:         z.coerce.number().min(0),
  defaultCommission:   z.coerce.number().min(0).max(30),
  platformName:        z.string().min(1),
  supportEmail:        z.string().email(),
  partnerEmail:        z.string().email(),
  supportPhone:        z.string().min(5),
  notifyNewOrder:      z.boolean(),
  notifyNewShop:       z.boolean(),
  notifySettlement:    z.boolean(),
  notifyLowStock:      z.boolean(),
});

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-green-500" : "bg-[#2e3454]"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function SettingsRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#2e3454] last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-[#6b7290] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

const ROLES = [
  { role: "Super Admin",    orders: "Full",  products: "Full",  shops: "Full",  finance: "Full"  },
  { role: "Operations Mgr", orders: "Full",  products: "View",  shops: "View",  finance: "None"  },
  { role: "Catalogue Mgr",  orders: "None",  products: "Full",  shops: "None",  finance: "None"  },
  { role: "Finance",        orders: "View",  products: "None",  shops: "View",  finance: "Full"  },
];

const PermBadge = ({ level }: { level: string }) => {
  const cls = level === "Full" ? "bg-green-500/15 text-green-400" : level === "View" ? "bg-blue-500/15 text-blue-400" : "bg-[#6b7290]/10 text-[#6b7290]";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded ${cls}`}>{level}</span>;
};

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<PlatformSettings>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });

  const onSubmit = (data: PlatformSettings) => {
    updateSettings(data);
    toast("Settings saved successfully!");
  };

  const watchNotify = {
    newOrder:    watch("notifyNewOrder"),
    newShop:     watch("notifyNewShop"),
    settlement:  watch("notifySettlement"),
    lowStock:    watch("notifyLowStock"),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        {/* Left column */}
        <div className="space-y-5">
          {/* Platform Settings */}
          <div className="card">
            <h2 className="text-sm font-bold text-white mb-1">Platform Settings</h2>
            <p className="text-xs text-[#6b7290] mb-4">Core delivery and fee configuration</p>

            <SettingsRow label="Delivery Radius" desc="Maximum km from shop to customer">
              <div className="flex items-center gap-2">
                <input {...register("deliveryRadius")} type="number" min="1" max="50" className="input-base w-20 text-center" />
                <span className="text-xs text-[#6b7290]">km</span>
              </div>
            </SettingsRow>

            <SettingsRow label="Minimum Order Amount" desc="Below this, checkout is blocked">
              <div className="flex items-center gap-2">
                <span className="text-[#6b7290]">₹</span>
                <input {...register("minimumOrderAmount")} type="number" min="0" className="input-base w-24 text-center" />
              </div>
            </SettingsRow>

            <SettingsRow label="Platform Fee (per order)" desc="Charged to customer, kept by QB">
              <div className="flex items-center gap-2">
                <span className="text-[#6b7290]">₹</span>
                <input {...register("platformFee")} type="number" min="0" className="input-base w-24 text-center" />
              </div>
            </SettingsRow>

            <SettingsRow label="Delivery Fee (flat)" desc="Passed to shop owner per delivery">
              <div className="flex items-center gap-2">
                <span className="text-[#6b7290]">₹</span>
                <input {...register("deliveryFee")} type="number" min="0" className="input-base w-24 text-center" />
              </div>
            </SettingsRow>

            <SettingsRow label="Default Commission %" desc="Applied to all new shops">
              <div className="flex items-center gap-2">
                <input {...register("defaultCommission")} type="number" min="0" max="30" className="input-base w-20 text-center" />
                <span className="text-xs text-[#6b7290]">%</span>
              </div>
            </SettingsRow>
          </div>

          {/* General Info */}
          <div className="card">
            <h2 className="text-sm font-bold text-white mb-4">General Info</h2>
            <div className="space-y-4">
              {[
                { name: "platformName",  label: "Platform Name",      type: "text" },
                { name: "supportEmail",  label: "Support Email",       type: "email" },
                { name: "partnerEmail",  label: "Partner Email",       type: "email" },
                { name: "supportPhone",  label: "Support WhatsApp",    type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-[11px] font-semibold text-[#6b7290] uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input {...register(f.name as keyof PlatformSettings)} type={f.type} className="input-base w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Notifications */}
          <div className="card">
            <h2 className="text-sm font-bold text-white mb-1">Notification Settings</h2>
            <p className="text-xs text-[#6b7290] mb-4">Choose what triggers admin alerts</p>

            <SettingsRow label="New Order Alerts" desc="Push notification to admin">
              <Toggle checked={watchNotify.newOrder} onChange={(v) => setValue("notifyNewOrder", v)} />
            </SettingsRow>
            <SettingsRow label="New Shop Application" desc="Email to admin team">
              <Toggle checked={watchNotify.newShop} onChange={(v) => setValue("notifyNewShop", v)} />
            </SettingsRow>
            <SettingsRow label="Settlement Processed" desc="Auto-notify shop owner">
              <Toggle checked={watchNotify.settlement} onChange={(v) => setValue("notifySettlement", v)} />
            </SettingsRow>
            <SettingsRow label="Low Stock Alert" desc="When product stock ≤ 10 units">
              <Toggle checked={watchNotify.lowStock} onChange={(v) => setValue("notifyLowStock", v)} />
            </SettingsRow>
          </div>

          {/* Roles & Permissions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Roles & Permissions</h2>
                <p className="text-xs text-[#6b7290] mt-0.5">Module-level access control</p>
              </div>
              <button type="button" onClick={() => toast("Role editor coming soon", "info")} className="btn-ghost text-xs py-1.5 flex items-center gap-1.5">
                <Shield size={12} /> Add Role
              </button>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Products</th>
                  <th>Shops</th>
                  <th>Finance</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r) => (
                  <tr key={r.role}>
                    <td><span className="font-semibold text-white">{r.role}</span></td>
                    <td><PermBadge level={r.orders}   /></td>
                    <td><PermBadge level={r.products} /></td>
                    <td><PermBadge level={r.shops}    /></td>
                    <td><PermBadge level={r.finance}  /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Save size={16} /> Save All Settings
          </button>
        </div>
      </div>
    </form>
  );
}

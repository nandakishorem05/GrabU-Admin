"use client";
import { useState, useMemo } from "react";
import { Search, Ban, CheckCircle, ShieldAlert, ShoppingBag, DollarSign, Calendar, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { customers, banCustomer, unbanCustomer } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBanToggle = (id: string, name: string, isBanned: boolean) => {
    if (isBanned) {
      if (confirm(`Are you sure you want to unban customer "${name}"?`)) {
        unbanCustomer(id);
        toast(`"${name}" has been unbanned`, "success");
      }
    } else {
      if (confirm(`Are you sure you want to ban customer "${name}"? This will block their app access.`)) {
        banCustomer(id);
        toast(`"${name}" has been banned`, "error");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7290]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone..."
            className="input-base w-full pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-base min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        {[
          { label: "Total Customers", value: customers.length, color: "text-white", icon: UsersIcon },
          { label: "Active", value: customers.filter((c) => c.status === "active").length, color: "text-green-400", icon: CheckCircle },
          { label: "Banned", value: customers.filter((c) => c.status === "banned").length, color: "text-red-400", icon: ShieldAlert },
          {
            label: "Total Revenue Generated",
            value: `₹${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}`,
            color: "text-blue-400",
            icon: DollarSign,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6b7290] mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#22263a] flex items-center justify-center text-[#9aa0c0]">
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {/* Table Column */}
        <div className="col-span-2 card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Details</th>
                  <th>Joined Date</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((cust) => (
                  <motion.tr
                    key={cust.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`cursor-pointer transition-colors ${
                      selectedCustomer?.id === cust.id ? "bg-blue-500/5 border-l-2 border-l-blue-500" : "hover:bg-[#22263a]/35"
                    }`}
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                          {getInitials(cust.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-white whitespace-nowrap block">{cust.name}</span>
                          <span className="text-[10px] text-[#6b7290]">ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <p className="text-white">{cust.phone}</p>
                        <p className="text-[#6b7290]">{cust.email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-xs text-[#9aa0c0]">
                      {new Date(cust.joinedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-white font-medium">{cust.totalOrders}</td>
                    <td className="text-white font-semibold">₹{cust.totalSpent.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={cust.status === "active" ? "active" : "inactive"} label={cust.status} />
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBanToggle(cust.id, cust.name, cust.status === "banned");
                        }}
                        className={`p-1.5 rounded-lg hover:bg-red-500/10 transition-colors ${
                          cust.status === "banned" ? "text-green-400 hover:text-green-300" : "text-[#9aa0c0] hover:text-red-400"
                        }`}
                        title={cust.status === "banned" ? "Unban Customer" : "Ban Customer"}
                      >
                        {cust.status === "banned" ? <CheckCircle size={13} /> : <Ban size={13} />}
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#6b7290]">
                      No customers found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2e3454]">
            <span className="text-xs text-[#6b7290]">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} customers
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium ${page === p ? "bg-blue-600 text-white" : "btn-ghost"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Details Column */}
        <div className="card h-fit space-y-4">
          {selectedCustomer ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#2e3454]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-white leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-xs text-[#9aa0c0] mt-0.5">{selectedCustomer.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#22263a]/40 p-2.5 rounded-lg border border-[#2e3454]/40">
                  <div className="flex items-center gap-1.5 text-xs text-[#6b7290] mb-0.5">
                    <ShoppingBag size={11} /> Total Orders
                  </div>
                  <p className="font-bold text-white">{selectedCustomer.totalOrders} orders</p>
                </div>
                <div className="bg-[#22263a]/40 p-2.5 rounded-lg border border-[#2e3454]/40">
                  <div className="flex items-center gap-1.5 text-xs text-[#6b7290] mb-0.5">
                    <DollarSign size={11} /> Total Spent
                  </div>
                  <p className="font-bold text-white">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* General Info */}
              <div className="text-xs space-y-3">
                <div className="flex items-center gap-2 text-[#9aa0c0]">
                  <Calendar size={13} className="text-[#6b7290]" />
                  <span>
                    Joined:{" "}
                    {new Date(selectedCustomer.joinedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#9aa0c0]">
                  <CheckCircle size={13} className={selectedCustomer.status === "active" ? "text-green-400" : "text-red-400"} />
                  <span>Account Status: <b className="capitalize text-white">{selectedCustomer.status}</b></span>
                </div>
              </div>

              {/* Addresses List */}
              <div className="space-y-2 pt-2 border-t border-[#2e3454]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7290]">Saved Addresses</h4>
                {selectedCustomer.addresses.map((addr: string, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-[#22263a]/30 rounded-lg text-xs text-[#9aa0c0] border border-[#2e3454]/20">
                    <MapPin size={13} className="text-[#6b7290] flex-shrink-0 mt-0.5" />
                    <span>{addr}</span>
                  </div>
                ))}
                {selectedCustomer.addresses.length === 0 && (
                  <p className="text-xs text-[#6b7290] italic">No saved addresses</p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-[#6b7290] space-y-2">
              <UsersIcon width={24} height={24} className="mx-auto text-[#2e3454]" />
              <p className="text-sm font-semibold">No Customer Selected</p>
              <p className="text-xs max-w-[180px] mx-auto leading-normal">
                Click a customer in the list to view their saved addresses and profile analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

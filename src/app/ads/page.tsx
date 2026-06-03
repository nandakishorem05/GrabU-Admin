"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Image, Trash2, RefreshCcw, X, Upload } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/components/ui/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import type { AdPoster } from "@/types";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 8;

export default function AdsPage() {
  const { adPosters, addAdPoster, toggleAdPosterStatus, deleteAdPoster } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Ad Form State
  const [newTitle, setNewTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    return adPosters.filter((ad) => {
      const matchSearch = !search || ad.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ad.isActive) ||
        (statusFilter === "inactive" && !ad.isActive);
      return matchSearch && matchStatus;
    });
  }, [adPosters, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusToggle = (id: string, title: string) => {
    toggleAdPosterStatus(id);
    toast(`Ad poster "${title}" status toggled`, "success");
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete ad poster "${title}"?`)) {
      deleteAdPoster(id);
      toast(`Ad poster "${title}" deleted`, "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImageUrl(""); // Clear manual URL if file is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast("Please enter a title for the ad poster", "error");

    let finalImageUrl = imageUrl.trim();

    // Handle Direct File Upload
    if (selectedFile) {
      setUploading(true);
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to posters storage bucket
        const { error: uploadError } = await supabase.storage
          .from("posters")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage.from("posters").getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      } catch (err: any) {
        setUploading(false);
        return toast(err.message || "Failed to upload image. Please verify bucket setup.", "error");
      }
      setUploading(false);
    }

    if (!finalImageUrl) {
      return toast("Please select a file to upload or paste a valid image URL", "error");
    }

    const newAd: AdPoster = {
      id: `AD${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      imageUrl: finalImageUrl,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addAdPoster(newAd);
    toast(`Ad Poster "${newAd.title}" created successfully!`, "success");
    setShowAddModal(false);

    // Reset Form
    setNewTitle("");
    setImageUrl("");
    setSelectedFile(null);
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
            placeholder="Search ad posters..."
            className="input-base w-full pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-base"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-sm ml-auto"
        >
          <Plus size={14} /> Add Ad Poster
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
        {[
          {
            label: "Total Ad Posters",
            value: adPosters.length,
            color: "text-white",
            icon: Image,
          },
          {
            label: "Active Campaigns",
            value: adPosters.filter((ad) => ad.isActive).length,
            color: "text-green-400",
            icon: Upload,
          },
          {
            label: "Inactive Campaigns",
            value: adPosters.filter((ad) => !ad.isActive).length,
            color: "text-[#6b7290]",
            icon: X,
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

      {/* Ads Grid List */}
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        {paginated.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-0 overflow-hidden relative flex flex-col justify-between"
          >
            {/* Image Preview Container */}
            <div className="h-44 w-full bg-[#11131a] relative flex items-center justify-center overflow-hidden border-b border-[#2e3454]">
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual if URL doesn't load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="text-[#6b7290] flex flex-col items-center gap-1.5">
                  <Image size={24} />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-3 left-3">
                <StatusBadge
                  status={ad.isActive ? "active" : "inactive"}
                  label={ad.isActive ? "Active" : "Inactive"}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">
                  {ad.title}
                </h4>
                <p className="text-[10px] text-[#6b7290] mt-1 font-mono">ID: {ad.id}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2e3454]/50">
                <span className="text-[10px] text-[#6b7290]">
                  Created:{" "}
                  {new Date(ad.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStatusToggle(ad.id, ad.title)}
                    className="p-1.5 rounded-lg hover:bg-[#22263a] text-[#9aa0c0] hover:text-blue-400 transition-colors"
                    title="Toggle Status (On/Off)"
                  >
                    <RefreshCcw size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#9aa0c0] hover:text-red-400 transition-colors"
                    title="Delete Ad Poster"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {paginated.length === 0 && (
          <div className="col-span-4 text-center py-16 card text-[#6b7290]">
            No ad posters found matching your criteria. Click "Add Ad Poster" to create one.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card py-3 px-4 flex items-center justify-between">
          <span className="text-xs text-[#6b7290]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} posters
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost px-3 py-1 text-xs rounded-lg disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded-lg font-medium ${
                  page === p ? "bg-blue-600 text-white" : "btn-ghost"
                }`}
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
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#1a1d27] border border-[#2e3454] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3454]">
                <div className="flex items-center gap-2">
                  <Image size={16} className="text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Add New Ad Poster</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-[#22263a] text-[#9aa0c0] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-[#9aa0c0] font-medium block mb-1">Ad Title</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Summer Cooler Splash Offers!"
                    className="input-base w-full"
                    required
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="text-xs text-[#9aa0c0] font-medium block mb-1">
                    Upload Image File
                  </label>
                  <div className="relative border border-dashed border-[#2e3454] rounded-lg p-6 bg-[#0f1117] hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Upload size={22} className="text-[#6b7290] group-hover:text-blue-400 transition-colors mb-2" />
                    <span className="text-xs font-semibold text-white block">
                      {selectedFile ? selectedFile.name : "Select Image Poster File"}
                    </span>
                    <span className="text-[10px] text-[#6b7290] mt-1 block">
                      PNG, JPG or WEBP (Max 2MB)
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#2e3454]/50"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-[#6b7290] uppercase font-bold">Or Link URL</span>
                  <div className="flex-grow border-t border-[#2e3454]/50"></div>
                </div>

                <div>
                  <label className="text-xs text-[#9aa0c0] font-medium block mb-1">
                    Manual Image URL
                  </label>
                  <input
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setSelectedFile(null); // Clear file if manual link is typed
                    }}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="input-base w-full"
                    disabled={uploading}
                  />
                </div>

                <div className="pt-2 border-t border-[#2e3454] flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-ghost text-xs"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs flex items-center gap-1.5"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Uploading...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, ShieldAlert, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant: "danger" | "warning";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  variant,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const Icon = variant === "danger" ? Trash2 : AlertTriangle;
  const iconColorClass = variant === "danger" ? "text-red-400" : "text-amber-400";
  const iconBgClass = variant === "danger" ? "bg-red-500/10" : "bg-amber-500/10";
  const confirmBtnClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-amber-600 hover:bg-amber-500 text-white";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-[#13151f] border border-[#2e3454] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-7 h-7 rounded-lg bg-[#1e2235] flex items-center justify-center text-[#6b7290] hover:text-white hover:bg-[#2a2f45] transition-colors"
            >
              <X size={14} />
            </button>

            {/* Warning Icon */}
            <div className={`w-14 h-14 rounded-full ${iconBgClass} flex items-center justify-center mb-4 mt-2`}>
              <Icon size={28} className={iconColorClass} />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white mb-2">{title}</h3>

            {/* Message */}
            <p className="text-xs text-[#9aa0c0] leading-relaxed mb-6 px-2">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1 py-2 rounded-xl text-xs font-semibold text-[#9aa0c0] hover:text-white transition-all border border-[#2e3454] bg-transparent"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${confirmBtnClass}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

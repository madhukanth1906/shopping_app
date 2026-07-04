"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function ToastNotification({ message, type = "success", isVisible, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }}
          exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant/20 backdrop-blur-xl ${
            type === "success" ? "bg-surface/80 text-on-surface" : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {type === "success" ? <CheckCircle size={18} className="text-[#7e572e]" /> : <AlertCircle size={18} className="text-red-600" />}
          <p className="text-sm font-semibold tracking-wide">{message}</p>
          <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

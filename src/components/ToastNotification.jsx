"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function ToastNotification({ message, type = "success", isVisible, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
          exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.2 } }}
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded shadow-xl border border-outline-variant/10 ${
            type === "success" ? "bg-surface-container text-on-surface" : "bg-error-container text-on-error-container"
          }`}
        >
          {type === "success" ? <CheckCircle size={20} className="text-primary" /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message}</p>
          <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

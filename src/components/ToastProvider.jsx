"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ToastNotification from "./ToastNotification";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} 
      />
    </ToastContext.Provider>
  );
}

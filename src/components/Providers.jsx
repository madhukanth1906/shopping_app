"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AppContext = createContext();

import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const pathname = usePathname();

  // Close modals on route change
  useEffect(() => {
    // eslint-disable-next-line
    setIsCartOpen(false);
    // eslint-disable-next-line
    setIsProductModalOpen(false);
  }, [pathname]);

  // Lock body scroll when modal/drawer is open
  useEffect(() => {
    if (isCartOpen || isProductModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, isProductModalOpen]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // clear after animation
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContext.Provider value={{
        isCartOpen,
        openCart,
        closeCart,
        isProductModalOpen,
        selectedProduct,
        openProductModal,
        closeProductModal
      }}>
        {children}
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: "Azhagii - Women's Dresses",
  description: "Redefining modern elegance through curation and craftsmanship.",
};

import { Providers } from "@/components/Providers";
import CartDrawer from "@/components/CartDrawer";
import ProductModal from "@/components/ProductModal";
import AiStylist from "@/components/AiStylist";
import { CurrencyProvider } from "@/components/CurrencyProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body selection:bg-secondary-container selection:text-on-secondary-container antialiased" suppressHydrationWarning>
        <CurrencyProvider>
          <Providers>
            <ToastProvider>
              {children}
              <CartDrawer />
              <ProductModal />
              <AiStylist />
            </ToastProvider>
          </Providers>
        </CurrencyProvider>
      </body>
    </html>
  );
}

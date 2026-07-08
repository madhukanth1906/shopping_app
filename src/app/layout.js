import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: {
    default: "Azhagii - Premium Clothing & Sarees",
    template: "%s | Azhagii"
  },
  description: "Discover Azhagii's collection of premium women's clothing, sarees, and modern elegance. Handcrafted designs for every occasion.",
  keywords: ["Azhagii", "Sarees", "Women's Clothing", "Premium Dresses", "Ethnic Wear", "Indian Fashion"],
  authors: [{ name: "Azhagii" }],
  creator: "Azhagii",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.azhagii.me",
    siteName: "Azhagii",
    title: "Azhagii - Premium Clothing & Sarees",
    description: "Discover Azhagii's collection of premium women's clothing, sarees, and modern elegance.",
    images: [
      {
        url: "https://www.azhagii.me/media__1783138121082.png", // Using one of their hero images
        width: 1200,
        height: 630,
        alt: "Azhagii Collection",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azhagii - Premium Clothing & Sarees",
    description: "Discover Azhagii's collection of premium women's clothing, sarees, and modern elegance.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Azhagii",
  },
  metadataBase: new URL("https://www.azhagii.me"),
};

export const viewport = {
  themeColor: "#7e572e",
};

import { Providers } from "@/components/Providers";
import CartDrawer from "@/components/CartDrawer";
import ProductModal from "@/components/ProductModal";
import AiStylist from "@/components/AiStylist";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body selection:bg-secondary-container selection:text-on-secondary-container antialiased transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
        </ThemeProvider>
      </body>
    </html>
  );
}

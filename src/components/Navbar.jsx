"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchProducts } from "@/lib/catalog";
import { Home, User, Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from './Providers';

export default function Navbar() {
  const pathname = usePathname();
  const { openCart } = useAppContext();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const updateCounts = () => {
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
    setCartCount(totalItems || 0);

    const wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    window.addEventListener('storage', updateCounts);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    async function loadCategories() {
      try {
        const products = await fetchProducts();
        const cats = Array.from(new Set(Object.values(products).map(p => p.category).filter(Boolean)));
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();

    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 w-full z-50 px-6 md:px-12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled 
          ? "py-4 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm" 
          : "py-6 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5 shadow-sm"
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href="/" className="font-headline italic text-2xl tracking-tighter text-on-surface">AZHAGII</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="font-label uppercase tracking-widest text-xs text-on-surface hover:text-[#7e572e] transition-colors duration-300 font-semibold" href="/shop?filter=new">New Arrivals</Link>
            <Link className="font-label uppercase tracking-widest text-xs text-on-surface hover:text-[#7e572e] transition-colors duration-300 font-semibold" href="/shop">Shop</Link>
            
            <div className="relative group cursor-pointer py-2">
              <Link href="/collections" className="font-label uppercase tracking-widest text-xs text-on-surface hover:text-[#7e572e] transition-colors duration-300 font-semibold">Collections</Link>
              {categories.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-surface/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-2">
                  {categories.map(cat => (
                    <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} className="px-5 py-3.5 text-[10px] font-label font-bold uppercase tracking-widest hover:bg-black/5 transition-colors text-on-surface border-b border-outline-variant/5 last:border-0">
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {pathname === '/account' || pathname === '/admin' ? (
            <Link href="/" className="opacity-70 hover:opacity-100 transition-opacity"><Home size={20} strokeWidth={1.5} className="text-on-surface" /></Link>
          ) : (
            <Link href="/account" className="opacity-70 hover:opacity-100 transition-opacity"><User size={20} strokeWidth={1.5} className="text-on-surface" /></Link>
          )}
          
          <Link href="/account?tab=wishlist" className="relative group cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <Heart size={20} strokeWidth={1.5} className="text-on-surface" />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#7e572e] text-surface text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button onClick={openCart} className="relative group cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-2">
            <ShoppingBag size={20} strokeWidth={1.5} className="text-on-surface" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#1A1A1A] text-surface text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

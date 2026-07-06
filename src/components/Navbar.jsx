"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts } from "@/lib/catalog";
import { Home, User, Heart, ShoppingBag, Search, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from './Providers';
import { useCurrency } from './CurrencyProvider';
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart } = useAppContext();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { currency, changeCurrency, isLoaded } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

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
          
          {mounted && isLoaded && (
            <div className="relative group cursor-pointer">
              <span className="font-label text-[10px] uppercase font-bold text-on-surface opacity-70 group-hover:opacity-100 transition-opacity p-2">
                {currency}
              </span>
              <div className="absolute top-full right-0 mt-2 bg-surface/90 backdrop-blur-xl border border-outline-variant/20 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50">
                {['INR', 'USD', 'EUR', 'GBP'].map(cur => (
                  <button 
                    key={cur}
                    onClick={() => changeCurrency(cur)}
                    className={`px-4 py-2 text-[10px] font-label font-bold text-left hover:bg-black/5 ${currency === cur ? 'text-secondary' : 'text-on-surface'}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden absolute right-8"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low text-xs border border-outline-variant/30 rounded-full px-4 py-2 outline-none focus:border-secondary transition-colors text-on-surface"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="opacity-70 hover:opacity-100 transition-opacity p-2 z-10 bg-surface rounded-full">
              {isSearchOpen ? <X size={20} strokeWidth={1.5} className="text-on-surface" /> : <Search size={20} strokeWidth={1.5} className="text-on-surface" />}
            </button>
          </div>

          {pathname === '/account' || pathname === '/admin' ? (
            <Link href="/" className="opacity-70 hover:opacity-100 transition-opacity p-2"><Home size={20} strokeWidth={1.5} className="text-on-surface" /></Link>
          ) : (
            <Link href="/account" className="opacity-70 hover:opacity-100 transition-opacity p-2"><User size={20} strokeWidth={1.5} className="text-on-surface" /></Link>
          )}
          
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="opacity-70 hover:opacity-100 transition-opacity p-2"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} className="text-on-surface" /> : <Moon size={20} strokeWidth={1.5} className="text-on-surface" />}
            </button>
          )}

          <Link href="/account?tab=wishlist" className="relative group cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-2">
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

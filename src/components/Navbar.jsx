"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchProducts } from "@/lib/catalog";

export default function Navbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);

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
    };
  }, []);

  return (
    <nav className="bg-[#fbf9f7]/70 dark:bg-[#303331]/70 backdrop-blur-md fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center max-w-[1920px] mx-auto transition-all duration-300">
      <div className="flex items-center gap-12">
        <Link href="/" className="font-['Noto_Serif'] italic text-2xl tracking-tighter text-[#303331] dark:text-[#fbf9f7]">AZHAGII</Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop?filter=new">New Arrivals</Link>
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop">Shop</Link>
          
          <div className="relative group cursor-pointer py-2">
            <span className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300">Collections</span>
            {categories.length > 0 && (
              <div className="absolute top-full left-0 mt-0 w-48 bg-[#fbf9f7] dark:bg-[#303331] border border-outline-variant/10 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50 overflow-hidden">
                {categories.map(cat => (
                  <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} className="px-4 py-3 text-[10px] font-['Manrope'] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-on-surface">
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {pathname === '/account' ? (
          <Link href="/"><span className="material-symbols-outlined text-xl cursor-pointer hover:text-secondary transition-colors text-on-surface">home</span></Link>
        ) : (
          <Link href="/account"><span className="material-symbols-outlined text-xl cursor-pointer hover:text-secondary transition-colors text-on-surface">person</span></Link>
        )}
        
        <Link href="/account?tab=wishlist" className="relative group cursor-pointer">
          <span className="material-symbols-outlined text-xl hover:text-secondary transition-colors text-on-surface">favorite</span>
          <span className="absolute -top-1.5 -right-1.5 bg-error text-surface text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
            {wishlistCount || 0}
          </span>
        </Link>

        <Link href="/cart" className="relative group cursor-pointer">
          <span className="material-symbols-outlined text-xl hover:text-secondary transition-colors text-on-surface">shopping_bag</span>
          <span className="absolute -top-1.5 -right-1.5 bg-secondary text-on-secondary text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
            {cartCount || 0}
          </span>
        </Link>
      </div>
    </nav>
  );
}

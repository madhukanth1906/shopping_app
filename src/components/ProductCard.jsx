import Link from "next/link";
import { useToast } from "./ToastProvider";
import { useState, useEffect } from "react";
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from './Providers';
import { useCurrency } from './CurrencyProvider';

export default function ProductCard({ product, isRecommended, viewMode = "grid" }) {
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);

  const images = Array.isArray(product.images) ? product.images : [product.image];
  const videoUrl = images.find(url => url && url.match(/\.(mp4|webm)/i));
  const imgUrl = images.find(url => url && !url.match(/\.(mp4|webm)/i)) || product.image;
  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    setIsInWishlist(!!wishlist.find(item => item.id === product.id));
  };

  useEffect(() => {
    checkWishlist();
    window.addEventListener('wishlistUpdated', checkWishlist);
    return () => window.removeEventListener('wishlistUpdated', checkWishlist);
  }, [product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    const exists = wishlist.find(item => item.id === product.id);
    if (!exists) {
      wishlist.push({ id: product.id, name: product.name, price: product.price, image: imgUrl });
      localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      showToast(`${product.name} added to wishlist!`, "success");
    } else {
      wishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      showToast(`${product.name} removed from wishlist.`, "success");
    }
  };

  const totalInventory = product.inventory ? Object.values(product.inventory).reduce((sum, qty) => sum + qty, 0) : 0;
  
  const { openProductModal } = useAppContext();

  const handleCardClick = (e) => {
    e.preventDefault();
    openProductModal(product);
  };
  
  return (
    <div onClick={handleCardClick} className="block w-full text-left">
      <motion.div 
        whileHover={{ y: -5 }} 
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`product-card group cursor-pointer relative ${viewMode === "list" ? "flex flex-row gap-8 items-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10" : ""}`}
      >
        <div className={`relative overflow-hidden bg-surface-container-low rounded-lg ${viewMode === "list" ? "w-48 h-64 flex-shrink-0 mb-0" : "aspect-[3/4] mb-6"}`}>
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          {videoUrl && (
            <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'}`}>
              <video 
                src={videoUrl} 
                className="w-full h-full object-cover" 
                autoPlay={isHovered} 
                loop 
                muted 
                playsInline
              />
            </div>
          )}
          
          {/* Stock Badges */}
          {totalInventory === 0 ? (
            <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest z-10 shadow-sm">
              Out of Stock
            </div>
          ) : totalInventory <= 5 ? (
            <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest z-10 shadow-sm">
              Low Stock
            </div>
          ) : null}

          <button onClick={handleWishlist} className={`group/wishlist absolute top-4 right-4 p-2 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm z-10 ${isInWishlist ? 'bg-surface text-error' : 'bg-surface/80 text-on-surface hover:text-error hover:bg-surface'}`}>
            <Heart size={18} strokeWidth={1.5} className={isInWishlist ? "fill-current" : ""} />
          </button>
          <div className="quick-shop-overlay absolute inset-0 flex items-end p-6 bg-gradient-to-t from-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button className="w-full py-4 bg-on-surface text-surface font-label text-[10px] uppercase tracking-widest rounded-full hover:bg-secondary transition-colors pointer-events-auto">Quick View</button>
          </div>
        </div>
        <div className={`space-y-2 flex-1`}>
          <div className="flex justify-between items-baseline">
            <h3 className="font-headline text-lg italic text-on-surface">{product.name}</h3>
            <span className="font-headline text-sm">{formatPrice(String(product.price).replace(/[^0-9.]/g, ''))}</span>
          </div>
          {viewMode === 'list' && (
            <p className="text-outline text-sm mt-4 leading-relaxed line-clamp-3">
              {product.description || "A curated silhouette designed for the discerning minimalist. Enjoy timeless craftsmanship."}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

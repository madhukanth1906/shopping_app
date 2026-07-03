import Link from "next/link";
import { useToast } from "./ToastProvider";
import { useState, useEffect } from "react";

export default function ProductCard({ product }) {
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
  
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
  
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="product-card group cursor-pointer relative">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low rounded-lg">
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
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
            <span className="material-symbols-outlined text-sm transition-all duration-300 group-hover/wishlist:[font-variation-settings:'FILL'_1]" style={{ fontVariationSettings: `'FILL' ${isInWishlist ? 1 : 0}` }}>favorite</span>
          </button>
          <div className="quick-shop-overlay absolute inset-0 flex items-end p-6 bg-gradient-to-t from-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-full py-4 bg-on-surface text-surface font-label text-[10px] uppercase tracking-widest rounded-full hover:bg-secondary transition-colors pointer-events-none">View Details</button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <h3 className="font-headline text-lg italic text-on-surface">{product.name}</h3>
            <span className="font-headline text-sm">{product.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { useToast } from "./ToastProvider";

export default function ProductCard({ product }) {
  const { showToast } = useToast();
  const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
  
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push({ id: product.id, name: product.name, price: product.price, image: imgUrl });
      localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
      showToast(`${product.name} added to wishlist!`, "success");
    } else {
      showToast(`${product.name} is already in your wishlist.`, "error");
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="product-card group cursor-pointer relative">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low rounded-lg">
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <button onClick={handleWishlist} className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-on-surface hover:bg-on-surface hover:text-surface transition-all z-10">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
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

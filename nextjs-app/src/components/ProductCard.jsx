import Link from "next/link";

export default function ProductCard({ product }) {
  const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
  
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="product-card group cursor-pointer">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low rounded-lg">
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="quick-shop-overlay absolute inset-0 flex items-end p-6 bg-gradient-to-t from-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-full py-4 bg-on-surface text-surface font-label text-[10px] uppercase tracking-widest rounded-full hover:bg-secondary transition-colors">View Details</button>
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

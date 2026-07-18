"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/catalog";
import ProductSkeleton from "@/components/ProductSkeleton";
import Link from "next/link";
import { ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import { useToast } from "@/components/ToastProvider";
import { useAppContext } from "@/components/Providers";

export default function Collections() {
  const { showToast } = useToast();
  const { openProductModal } = useAppContext();
  const [products, setProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allProducts = await fetchProducts();
        if (allProducts && typeof allProducts === 'object' && !Array.isArray(allProducts)) {
          setProducts(allProducts);
          const cats = Array.from(new Set(Object.values(allProducts).map(p => p.category).filter(Boolean)));
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to load products for collections:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto min-h-screen bg-surface text-on-surface">
        <nav className="flex items-center gap-2 mb-8 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          <Link className="hover:text-on-surface transition-colors" href="/">Home</Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <span className="text-on-surface">Collections</span>
        </nav>

        <div className="mb-16">
          <h1 className="font-headline italic text-5xl md:text-7xl lg:text-[80px] leading-tight italic text-on-surface mb-4">Curated <span className="font-normal not-italic">Collections</span></h1>
          <p className="font-body text-outline max-w-xl leading-relaxed">Discover our elegant selections organized by category. Find the perfect aesthetic for your next occasion.</p>
        </div>

        {loading && (
          <div className="space-y-20">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={`skel-cat-${idx}`} className="border-t border-outline-variant/10 pt-10 first:border-0 first:pt-0">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <div className="h-10 w-48 bg-surface-container rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-24 bg-surface-container rounded animate-pulse"></div>
                  </div>
                  <div className="h-5 w-16 bg-surface-container rounded animate-pulse"></div>
                </div>
                <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8 snap-x">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skel-${idx}-${i}`} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start">
                      <ProductSkeleton viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && categories.map(category => {
          const categoryProducts = Object.entries(products).filter(([id, p]) => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} key={category} className="mb-20 border-t border-outline-variant/10 pt-10 first:border-0 first:pt-0">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-headline text-3xl md:text-4xl text-on-surface">{category}</h2>
                  <p className="font-label text-xs uppercase tracking-[0.2em] text-outline mt-2">{categoryProducts.length} Pieces</p>
                </div>
                <Link href={`/shop?category=${encodeURIComponent(category)}`} className="font-label uppercase tracking-widest text-xs border-b border-on-surface pb-1 hover:text-secondary hover:border-secondary transition-colors">
                  View All
                </Link>
              </div>

              <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8 snap-x">
                {categoryProducts.map(([id, product]) => {
                  const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
                  
                  const handleWishlist = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
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
                    <div key={id} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] max-w-[320px] snap-start group relative cursor-pointer" onClick={() => openProductModal(product)}>
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container mb-4 relative">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={imgUrl} />
                          <button onClick={handleWishlist} className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-on-surface hover:bg-on-surface hover:text-surface transition-all z-10">
                            <Heart size={18} strokeWidth={1.5} />
                          </button>
                      </div>
                      <h3 className="font-headline text-lg mb-1">{product.name}</h3>
                      <p className="font-headline text-md">{product.price}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}

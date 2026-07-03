"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/catalog";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const { id } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const allProducts = await fetchProducts();
        const p = allProducts[id];
        if (p) {
          setProduct(p);
          setActiveImage(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 px-6 lg:px-12 flex items-center justify-center">
          <p className="text-outline text-sm">Loading product...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 px-6 lg:px-12 flex items-center justify-center">
          <p className="text-outline text-sm">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 lg:px-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-4 order-last md:order-first">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-28 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0 cursor-pointer ${activeImage === img ? 'outline-variant/10 ring-1 ring-on-surface/5' : 'opacity-60 hover:opacity-100 transition-opacity'}`}
                >
                  <img className="w-full h-full object-cover" src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
            </div>

            {/* Main Large Image */}
            <div className="flex-grow group relative overflow-hidden rounded-lg bg-surface-container-low cursor-zoom-in">
              <img className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" src={activeImage} alt={product.name} />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-label tracking-widest uppercase text-on-surface">New Season</span>
                <span className="bg-secondary-container/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-label tracking-widest uppercase text-on-secondary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Top Rated
                </span>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="sticky top-40">
              <nav className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-outline mb-6">
                <Link className="hover:text-on-surface transition-colors" href="/shop">Shop</Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="hover:text-on-surface transition-colors">{product.name}</span>
              </nav>
              
              <h2 className="font-headline text-4xl lg:text-5xl text-on-surface leading-tight mb-4">{product.name}</h2>
              
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-headline text-2xl text-on-surface"><span>{product.price}</span></span>
                <span className="text-outline line-through text-lg font-body">₹580.00</span>
                <span className="text-error text-sm font-label uppercase tracking-widest">25% Off</span>
              </div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/10">
                <div className="flex text-secondary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </div>
                <span className="text-xs font-label uppercase tracking-widest text-outline">128 Reviews</span>
              </div>
              
              {/* Selectors */}
              <div className="space-y-8 mb-10">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface">Color: <span className="text-outline">Champagne</span></span>
                  </div>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-[#F5E6D3] ring-2 ring-offset-2 ring-on-surface p-0.5 border border-outline-variant/20"></button>
                    <button className="w-10 h-10 rounded-full bg-[#2C2C2C] ring-offset-2 hover:ring-2 ring-outline-variant/30 transition-all border border-outline-variant/20"></button>
                    <button className="w-10 h-10 rounded-full bg-[#4A5D4E] ring-offset-2 hover:ring-2 ring-outline-variant/30 transition-all border border-outline-variant/20"></button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface">Select Size</span>
                    <button className="text-[10px] font-label uppercase tracking-widest text-secondary hover:underline">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="py-3 text-xs font-label rounded-lg border border-outline-variant/20 hover:border-on-surface transition-colors">XS</button>
                    <button className="py-3 text-xs font-label rounded-lg border-2 border-on-surface text-on-surface bg-surface-container-low">S</button>
                    <button className="py-3 text-xs font-label rounded-lg border border-outline-variant/20 hover:border-on-surface transition-colors">M</button>
                    <button className="py-3 text-xs font-label rounded-lg border border-outline-variant/20 hover:border-on-surface transition-colors">L</button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-12">
                <button className="w-full py-5 bg-on-surface text-surface rounded-full font-label uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all active:scale-[0.98]">Add to Shopping Bag</button>
                <button className="w-full py-5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-full font-label uppercase tracking-[0.2em] text-xs hover:bg-surface-container-low transition-all">Buy it Now</button>
              </div>

              {/* Accordions */}
              <div className="divide-y divide-outline-variant/10 border-t border-outline-variant/10">
                <details className="group py-5" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface">Product Description</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="pt-4 text-sm leading-relaxed text-on-surface-variant font-body">
                    <p>{product.desc || "A masterpiece of minimalist design."}</p>
                  </div>
                </details>
                <details className="group py-5">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface">Fabric & Care</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="pt-4 text-sm leading-relaxed text-on-surface-variant font-body">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>100% Grade 6A Mulberry Silk</li>
                      <li>Dry clean only to maintain silk luster</li>
                      <li>Iron on low heat with press cloth</li>
                    </ul>
                  </div>
                </details>
                <details className="group py-5">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface">Delivery Estimate</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="pt-4 text-sm leading-relaxed text-on-surface-variant font-body">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary">local_shipping</span>
                      <div>
                        <p className="font-medium text-on-surface">Express Shipping</p>
                        <p>Estimated arrival: Oct 24 - Oct 26</p>
                        <p className="text-[10px] uppercase mt-1">Free for orders over ₹300</p>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <section className="mt-32">
          <div className="flex justify-between items-end mb-12">
            <h3 className="font-headline text-3xl text-on-surface">You May Also Like</h3>
            <Link className="text-xs font-label uppercase tracking-widest border-b border-on-surface pb-1" href="/shop">View Collection</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Recommendations dummy data to match original */}
            <div className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low mb-4 relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrrkepUCT31Xy_S40kD8Z6TI0JaQBQSJJBBUL5MXw1xXRgTsYf8Mhn_FrcbjIfbNKst34pT7--sdu3i5JjwEtdJGFxxF-2TpexHjZ1nS0TelGdSEazoim-NIH0tGOA7lLa3SbH1WsfiO_Q3u1DmP2_OeZUKdoiIekFodvMbanPMh0Htvp33r80CXH1zWmoMnS7I2jrhGXi7PIEvlxnKEGf1Y22nxq3_BMhWG4fgBZHBmfNrnTNYaJND7UzncBxL_o6Uj0fNPHjeWs" />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-surface/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <h4 className="text-xs font-label uppercase tracking-widest text-on-surface mb-1">Luna Maxi Wrap</h4>
              <p className="font-headline text-sm text-outline">₹385.00</p>
            </div>
            <div className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low mb-4 relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoSUGFgMs11lIMqcZJmfJFjofAVHs_JJsvfcclUa_TofECq_gqzL0H7AbeZMrZSl85UOeGamneJzLq2h4XqJW0QnwBFOwCQEaN6nuZSTX9_QcaxxkQr8Z_PQ7puPil-hsvkvk5QkzHK1-tsFttvOygnRARSbRDZY_2tfGrIs0mj1ZdELiSqclIbKWYOxWW_Bs91f90eYZneF7fKzFmNp7RtJZXkBDuO2EbAwCKpEXal85d_cwiF_wXDSymjRDIT2SAB-33xzYmeYk" />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-surface/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <h4 className="text-xs font-label uppercase tracking-widest text-on-surface mb-1">Azhagiii Heel Sandal</h4>
              <p className="font-headline text-sm text-outline">₹290.00</p>
            </div>
            <div className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low mb-4 relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChnrhIInWlU9UC0nMNDKJRKtI89UM0p5iAokEZ4GMxFrsNSYKCYmbXSSM0askwrjLkENsRqiLNxz6DrFXB7BIWmWb0o-ocVafntBPdayJxTFLTXlR7sq1DIox88U15Q3RvAuovIg1BAZ1GckG7i6FFvh37rdGH3_wUN591uvpxO12EmK5ZvEFL14OwraIf44FcDahVM7tojmkdvZHR_dFrRuLYW-lLdlwIChcXT5z1vLCRRE7ypZ1Hm4MubQQZRTbgWQ6Zj8zlOnc" />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-surface/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <h4 className="text-xs font-label uppercase tracking-widest text-on-surface mb-1">Structure Linen Blazer</h4>
              <p className="font-headline text-sm text-outline">₹450.00</p>
            </div>
            <div className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low mb-4 relative">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQLtUJHMeEeRef0iGSAQsCNQWTlV64zK0aScyEimrBukF06DS3t3x1rHVvacGpoERKXX2v3RvJAqF6MqYO8VC-yHgTtVsUsWHDCbdv6XFtIL_kejd9V_Bqfp7FuT0WK8Y_r4yA4pOx7qlxm9IohtFzMl0mBvvoSf4mKlCu364JMnofgy_qIdupExjLQCiu6HJ1mzHIkKSsVYSjUIr_YKbW4vPtGtnLyfSONYeCddYaJxSSkwV0-OdM8O1q6o32AyShU8B18HbmnkE" />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-surface/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <h4 className="text-xs font-label uppercase tracking-widest text-on-surface mb-1">Pearl Droplet Necklace</h4>
              <p className="font-headline text-sm text-outline">₹180.00</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

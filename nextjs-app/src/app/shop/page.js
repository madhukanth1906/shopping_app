"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/catalog";
import Link from "next/link";

export default function Shop() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort State
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortOption, setSortOption] = useState("Newest Arrivals");

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const allProducts = await fetchProducts();
        // Check if fetchProducts silently failed and returned empty object when it shouldn't
        if (allProducts instanceof Error) {
            throw allProducts;
        }
        setProducts(allProducts || {});
      } catch (err) {
        console.error("Fetch error caught in component:", err);
        setError(err.message || "Failed to load products from database.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const numericStr = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(numericStr) || 0;
  };

  let filteredProducts = Object.values(products).filter(product => {
    const pSize = product.size || 'One Size';
    const matchSize = selectedSizes.length === 0 || selectedSizes.includes(pSize);
    
    const priceNum = parsePrice(product.price);
    const matchPrice = priceNum <= maxPrice;

    return matchSize && matchPrice;
  });

  if (sortOption === "Price: Low to High") {
    filteredProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortOption === "Price: High to Low") {
    filteredProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortOption === "Popularity") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          <Link className="hover:text-on-surface transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <Link className="hover:text-on-surface transition-colors" href="/shop">Shop</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-on-surface">Summer Dresses</span>
        </nav>

        {/* Header Section */}
        <div className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl italic text-on-surface mb-4">Summer <span className="font-normal not-italic">Refinement</span></h1>
          <p className="font-body text-outline max-w-xl leading-relaxed">Curated silhouettes designed for the discerning minimalist. Each piece in our collection is a testament to timeless craftsmanship and ethereal movement.</p>
        </div>

        {/* Sorting & Filter Mobile Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-outline-variant/10 pb-6">
          <div className="flex items-center gap-8">
            <button className="md:hidden flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface">
              <span className="material-symbols-outlined">tune</span> Filters
            </button>
            <div className="hidden md:flex items-center gap-4 text-xs font-label uppercase tracking-widest text-outline">
              <span>{filteredProducts.length} Products</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-12">
            <div className="flex items-center gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-outline">Sort By:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)} 
                className="bg-transparent border-none focus:ring-0 font-label text-xs uppercase tracking-widest cursor-pointer text-on-surface pr-8"
              >
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Popularity</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">grid_view</button>
              <button className="material-symbols-outlined text-on-surface">view_comfy</button>
            </div>
          </div>
        </div>

        <div className="flex gap-16">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-10 sticky top-32">
              {/* Occasion (Mock) */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Occasion</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" type="checkbox" />
                    <span className="font-label text-sm text-outline group-hover:text-on-surface transition-colors">Garden Party</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" type="checkbox" />
                    <span className="font-label text-sm text-outline group-hover:text-on-surface transition-colors">Bridal Guest</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" type="checkbox" />
                    <span className="font-label text-sm text-outline group-hover:text-on-surface transition-colors">Summer Soirée</span>
                  </label>
                </div>
              </div>
              
              {/* Size */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-[10px] border transition-colors font-label ${
                        selectedSizes.includes(size) 
                          ? 'border-on-surface bg-on-surface text-white' 
                          : 'border-outline-variant/30 hover:border-on-surface'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Color Palette (Mock) */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Color Palette</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="w-6 h-6 rounded-full bg-[#f4ece1] border border-outline-variant/20 focus:ring-1 focus:ring-offset-2 focus:ring-on-surface" title="Cream"></button>
                  <button className="w-6 h-6 rounded-full bg-[#ead8c7] border border-outline-variant/20" title="Blush"></button>
                  <button className="w-6 h-6 rounded-full bg-[#7e572e] border border-outline-variant/20" title="Terra"></button>
                  <button className="w-6 h-6 rounded-full bg-[#303331] border border-outline-variant/20" title="Soft Black"></button>
                  <button className="w-6 h-6 rounded-full bg-[#ffffff] border border-outline-variant/50" title="Pure White"></button>
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Price: ₹{maxPrice}</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="1500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-secondary" 
                />
                <div className="flex justify-between mt-2 font-label text-[10px] text-outline tracking-wider">
                  <span>₹0</span>
                  <span>₹1,500+</span>
                </div>
              </div>
              
              {/* Fabric (Mock) */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Fabric</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" type="checkbox" />
                    <span className="font-label text-sm text-outline group-hover:text-on-surface transition-colors">Organic Silk</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" type="checkbox" />
                    <span className="font-label text-sm text-outline group-hover:text-on-surface transition-colors">Linen Blend</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
              {loading && <p className="text-outline text-sm col-span-full">Loading products...</p>}
              
              {!loading && error && (
                <div className="col-span-full bg-error-container/10 border border-error/30 p-6 rounded-lg flex items-start gap-4">
                  <span className="material-symbols-outlined text-error">error</span>
                  <div>
                    <h4 className="font-bold text-error text-sm uppercase tracking-wide">Database Connection Error</h4>
                    <p className="text-sm text-error/80">{error}</p>
                  </div>
                </div>
              )}
              
              {!loading && !error && filteredProducts.length === 0 && (
                <p className="text-outline text-sm col-span-full">No products match your current filters.</p>
              )}
              
              {!loading && !error && filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination (Mock) */}
        <div className="mt-24 flex items-center justify-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 font-label text-xs border border-on-surface bg-on-surface text-surface rounded-full">1</button>
            <button className="w-10 h-10 font-label text-xs hover:bg-surface-container-low transition-colors rounded-full text-outline">2</button>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/catalog";
import { getUser } from "@/lib/auth";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import { ChevronRight, Filter, ChevronDown, ChevronUp, LayoutGrid, LayoutList, AlertCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';


function ShopContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort State
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortOption, setSortOption] = useState("Newest Arrivals");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [preferredSize, setPreferredSize] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);

  // For dynamic categories
  const allCategories = Array.from(new Set(Object.values(products).map(p => p.category).filter(Boolean)));

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const allProducts = await fetchProducts();
        try {
          const user = await getUser();
          if (user) {
            const prefs = await account.getPrefs();
            if (prefs && prefs.preferredSize) {
              setPreferredSize(prefs.preferredSize);
            }
          }
        } catch (e) {
          console.error("Failed to load user prefs:", e);
        }

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

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  const toggleFilter = (setState, val) => {
    setState(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const numericStr = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(numericStr) || 0;
  };

  let filteredProducts = Object.values(products).filter(product => {
    // Inventory format usually { S: 10, M: 0, L: 5 }
    const availableSizes = product.inventory 
      ? Object.entries(product.inventory).filter(([_, qty]) => qty > 0).map(([s]) => s)
      : (product.size ? product.size.split(',').map(s => s.trim()) : ['One Size']);
      
    const matchSize = selectedSizes.length === 0 || selectedSizes.some(s => availableSizes.includes(s));
    
    const priceNum = parsePrice(product.price);
    const matchPrice = priceNum <= maxPrice;

    const matchOccasion = selectedOccasions.length === 0 || (product.occasion && selectedOccasions.includes(product.occasion));
    const matchFabric = selectedFabrics.length === 0 || (product.fabric && selectedFabrics.includes(product.fabric));
    const matchCategory = selectedCategories.length === 0 || selectedCategories.some(cat => cat.toLowerCase() === product.category?.toLowerCase());

    const matchSearch = !searchParam || product.name.toLowerCase().includes(searchParam.toLowerCase()) || (product.description && product.description.toLowerCase().includes(searchParam.toLowerCase()));

    return matchSize && matchPrice && matchOccasion && matchFabric && matchCategory && matchSearch;
  });


  // Move recommended to top
  if (preferredSize) {
    filteredProducts.sort((a, b) => {
      const aHas = a.inventory && a.inventory[preferredSize] > 0;
      const bHas = b.inventory && b.inventory[preferredSize] > 0;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
  }

  if (filterParam === 'new') {
    filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortOption === "Price: Low to High") {
    filteredProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortOption === "Price: High to Low") {
    filteredProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortOption === "Popularity") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          <Link className="hover:text-on-surface transition-colors" href="/">Home</Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          {categoryParam ? (
            <>
              <Link className="hover:text-on-surface transition-colors" href="/shop">Shop</Link>
              <ChevronRight size={12} strokeWidth={1.5} />
              <span className="text-on-surface">{categoryParam}</span>
            </>
          ) : (
            <span className="text-on-surface">Shop</span>
          )}
        </nav>

        {/* Header Section */}
        <div className="mb-16">
          <h1 className="font-headline italic text-5xl md:text-7xl lg:text-[80px] leading-tight italic text-on-surface mb-4">
            {categoryParam ? categoryParam : (<span>The <span className="font-normal not-italic">Shop</span></span>)}
          </h1>
          <p className="font-body text-outline max-w-xl leading-relaxed">Curated silhouettes designed for the discerning minimalist. Each piece in our collection is a testament to timeless craftsmanship and ethereal movement.</p>
        </div>

        {/* Sorting & Filter Mobile Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-outline-variant/10 pb-6 relative">
          <div className="flex items-center gap-8">
            <button className="md:hidden flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface">
              <Filter size={16} strokeWidth={1.5} /> Filters
            </button>
            <div className="hidden md:flex items-center gap-4 text-xs font-label uppercase tracking-widest text-outline">
              <span>{filteredProducts.length} Products</span>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-12">
            <div className="flex items-center gap-4 relative">
              <label className="font-label text-[10px] uppercase tracking-widest text-outline">Sort By:</label>
              
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-transparent border-none font-label text-xs uppercase tracking-widest cursor-pointer text-on-surface hover:text-secondary transition-colors"
                >
                  {sortOption} {isSortOpen ? <ChevronUp size={16} strokeWidth={1.5} /> : <ChevronDown size={16} strokeWidth={1.5} />}
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20 shadow-xl rounded z-50 py-2">
                    {["Newest Arrivals", "Price: Low to High", "Price: High to Low", "Popularity"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortOption(opt); setIsSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2 font-label text-xs uppercase tracking-widest hover:bg-surface-container-low transition-colors ${sortOption === opt ? 'bg-secondary text-surface hover:bg-secondary' : 'text-on-surface'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setViewMode('grid')} className={`${viewMode === 'grid' ? 'text-on-surface' : 'text-outline hover:text-on-surface'} transition-colors`}><LayoutGrid size={20} strokeWidth={1.5} /></button>
              <button onClick={() => setViewMode('list')} className={`${viewMode === 'list' ? 'text-on-surface' : 'text-outline hover:text-on-surface'} transition-colors`}><LayoutList size={20} strokeWidth={1.5} /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-16 relative">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-10 sticky top-32">
              
              {/* Occasion */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Occasion</h3>
                <div className="space-y-3">
                  {['Garden Party', 'Bridal Guest', 'Summer Soirée'].map(occ => (
                    <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedOccasions.includes(occ)}
                        onChange={() => toggleFilter(setSelectedOccasions, occ)}
                        className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" 
                      />
                      <span className={`font-label text-sm transition-colors ${selectedOccasions.includes(occ) ? 'text-on-surface font-bold' : 'text-outline group-hover:text-on-surface'}`}>
                        {occ}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Size */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleFilter(setSelectedSizes, size)}
                      className={`py-2 text-[10px] border transition-colors font-label ${
                        selectedSizes.includes(size) 
                          ? 'border-on-surface bg-on-surface text-white' 
                          : 'border-outline-variant/30 hover:border-on-surface text-on-surface'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Price: ₹{maxPrice}</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-secondary" 
                />
                <div className="flex justify-between mt-2 font-label text-[10px] text-outline tracking-wider">
                  <span>₹0</span>
                  <span>₹5,000+</span>
                </div>
              </div>
              
              {/* Fabric */}
              <div>
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface font-bold mb-6">Fabric</h3>
                <div className="space-y-3">
                  {['Organic Silk', 'Linen Blend'].map(fab => (
                    <label key={fab} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedFabrics.includes(fab)}
                        onChange={() => toggleFilter(setSelectedFabrics, fab)}
                        className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-secondary-container" 
                      />
                      <span className={`font-label text-sm transition-colors ${selectedFabrics.includes(fab) ? 'text-on-surface font-bold' : 'text-outline group-hover:text-on-surface'}`}>
                        {fab}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow z-0">
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8" : "flex flex-col gap-y-8"}>
              {loading && <p className="text-outline text-sm col-span-full">Loading products...</p>}
              
              {!loading && error && (
                <div className="col-span-full bg-error-container/10 border border-error/30 p-6 rounded-lg flex items-start gap-4">
                  <AlertCircle size={24} className="text-error" strokeWidth={1.5} />
                  <div>
                    <h4 className="font-bold text-error text-sm uppercase tracking-wide">Database Connection Error</h4>
                    <p className="text-sm text-error/80">{error}</p>
                  </div>
                </div>
              )}
              
              {!loading && !error && filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="font-label uppercase tracking-widest text-outline">
                  {categoryParam ? "no product available on this category" : "No products found matching your criteria."}
                </p>
              </div>
            )}
              
              {!loading && !error && filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} isRecommended={preferredSize && product.inventory && product.inventory[preferredSize] > 0} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

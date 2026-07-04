"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, StarHalf, Truck, Ruler, Shield, Plus, Minus, ShoppingBag, RefreshCcw, CheckCircle } from 'lucide-react';
import { useAppContext } from './Providers';
import { useToast } from './ToastProvider';

export default function ProductModal() {
  const { isProductModalOpen, closeProductModal, selectedProduct, openCart } = useAppContext();
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { showToast } = useToast();

  const checkWishlist = () => {
    if (!selectedProduct) return;
    const wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    setIsInWishlist(!!wishlist.find(item => item.id === selectedProduct.$id || item.id === selectedProduct.id));
  };

  useEffect(() => {
    if (isProductModalOpen && selectedProduct) {
      setSelectedSize(null);
      setCurrentImageIndex(0);
      setActiveTab('details');
      checkWishlist();
    }
  }, [isProductModalOpen, selectedProduct]);

  useEffect(() => {
    window.addEventListener('wishlistUpdated', checkWishlist);
    return () => window.removeEventListener('wishlistUpdated', checkWishlist);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleWishlist = (e) => {
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    const productId = selectedProduct.$id || selectedProduct.id;
    const exists = wishlist.find(item => item.id === productId);
    
    if (!exists) {
      const imgUrl = Array.isArray(selectedProduct.images) ? selectedProduct.images[0] : selectedProduct.image;
      wishlist.push({ id: productId, name: selectedProduct.name, price: selectedProduct.price, image: imgUrl });
      localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      showToast(`${selectedProduct.name} added to wishlist!`, "success");
    } else {
      wishlist = wishlist.filter(item => item.id !== productId);
      localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      showToast(`${selectedProduct.name} removed from wishlist.`, "success");
    }
  };

  const images = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image];

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast("Please select a size first", "error");
      return;
    }
    
    // Add to cart logic
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    const existing = cart.find(item => item.id === selectedProduct.id && item.size === selectedSize);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: images[0],
        size: selectedSize,
        quantity: 1
      });
    }
    
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    closeProductModal();
    openCart(); // Automatically open cart drawer
  };

  const tabs = [
    { id: 'details', label: 'DETAILS & SOURCING' },
    { id: 'sizing', label: 'SIZING GUIDE' },
    { id: 'materials', label: 'MATERIALS' },
  ];

  return (
    <AnimatePresence>
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProductModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl bg-surface md:rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10"
          >
            {/* Close Button - Hover color change per user request */}
            <button 
              onClick={closeProductModal}
              className="absolute top-6 right-6 z-50 p-2 bg-surface text-on-surface shadow-md hover:text-red-500 transition-colors rounded-full border border-outline-variant/10 group"
            >
              <X size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Left: Image Gallery */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative bg-[#f5f5f5]">
              <div className="absolute top-6 left-6 z-20 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded font-label text-[10px] uppercase tracking-widest font-bold shadow-sm">
                NEW COLLECTION
              </div>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[currentImageIndex]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-surface w-6' : 'bg-surface/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-auto overflow-y-auto hide-scrollbar p-8 md:p-12 flex flex-col">
              <span className="font-label uppercase tracking-[0.2em] text-[10px] text-[#7e572e] font-bold mb-2 block">
                {selectedProduct.category || 'EVENING ATELIER'}
              </span>
              
              <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-4 italic">
                {selectedProduct.name}
              </h1>
              
              <div className="flex items-center gap-6 mb-8">
                <p className="font-headline text-2xl text-on-surface font-bold">{selectedProduct.price}</p>
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <StarHalf size={16} fill="currentColor" />
                  <span className="text-xs text-outline ml-2 font-label uppercase tracking-widest">(4.9 out of 5)</span>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-label uppercase tracking-widest text-[10px] text-outline font-bold">Select Size:</h3>
                  <button className="text-[10px] text-[#7e572e] font-bold uppercase tracking-widest hover:text-on-surface transition-colors">
                    SIZE ADVISOR
                  </button>
                </div>
                <div className="flex gap-3">
                  {['S', 'M', 'L'].map(size => {
                    const stock = selectedProduct.inventory?.[size];
                    const isOutOfStock = stock === 0;

                    return (
                      <button 
                        key={size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-12 flex items-center justify-center font-label text-xs uppercase tracking-widest rounded border transition-all duration-300 ${
                          isOutOfStock 
                            ? 'opacity-40 border-outline-variant/30 text-outline line-through bg-surface cursor-not-allowed' 
                            : selectedSize === size 
                              ? 'border-on-surface bg-on-surface text-surface shadow-md scale-105' 
                              : 'border-outline-variant hover:border-on-surface text-on-surface'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mb-10">
                <h3 className="font-label uppercase tracking-widest text-[10px] text-outline font-bold mb-3">
                  Select Color: <span className="text-on-surface font-bold">CREAM</span>
                </h3>
                <div className="flex gap-4">
                  {/* Cream Swatch - Selected */}
                  <button className="w-8 h-8 rounded-full border-2 border-on-surface flex items-center justify-center p-0.5">
                    <span className="w-full h-full rounded-full bg-[#f4ece1]"></span>
                  </button>
                  {/* Brown Swatch - Unselected */}
                  <button className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:border-on-surface transition-colors p-0.5">
                    <span className="w-full h-full rounded-full bg-[#8c6b4a]"></span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex gap-6 border-b border-outline-variant/10 pb-3 relative">
                  {tabs.map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`font-label text-[10px] uppercase tracking-widest transition-colors relative ${activeTab === tab.id ? 'text-on-surface font-bold' : 'text-outline hover:text-on-surface'}`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="modalActiveTab" 
                          className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-on-surface"
                        />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="min-h-[80px] mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="font-body text-xs text-outline leading-relaxed"
                    >
                      {activeTab === 'details' && (
                        <p>{selectedProduct.description || "High-neck silk halter dress with an exquisite cowled neck and a dramatic, sweeping ankle-length hemline."}</p>
                      )}
                      {activeTab === 'sizing' && (
                        <p>Fits true to size. We recommend taking your normal size. Model is 175cm/5'9" and is wearing a size S.</p>
                      )}
                      {activeTab === 'materials' && (
                        <p>100% Organic Silk. Dry clean only. Iron on low heat. Do not bleach. Made ethically in our Parisian atelier.</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Value Props */}
              <div className="flex justify-between items-center py-6 border-t border-b border-outline-variant/10 mb-8 mt-auto">
                <div className="flex items-center gap-2 text-[#7e572e]">
                  <Truck size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">FREE COURIER</span>
                </div>
                <div className="flex items-center gap-2 text-[#7e572e]">
                  <RefreshCcw size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">30-DAY RETURNS</span>
                </div>
                <div className="flex items-center gap-2 text-[#7e572e]">
                  <CheckCircle size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">CERTIFIED PURE</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-on-surface text-surface uppercase font-label tracking-[0.2em] text-[10px] font-bold rounded hover:bg-secondary transition-all hover:-translate-y-0.5 flex justify-center items-center shadow-lg"
                >
                  ADD TO SHOPPING BAG
                </button>
                <button 
                  onClick={handleWishlist}
                  className={`w-14 h-auto flex items-center justify-center border rounded transition-all group ${isInWishlist ? 'border-error bg-error/5 text-error' : 'border-outline-variant/20 hover:border-on-surface text-outline'}`}
                >
                  <Heart size={18} strokeWidth={1.5} className={`${isInWishlist ? 'fill-current text-error' : 'group-hover:text-error transition-colors'}`} />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

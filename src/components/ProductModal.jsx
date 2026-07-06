"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, StarHalf, Truck, Ruler, Shield, Plus, Minus, ShoppingBag, RefreshCcw, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from './Providers';
import { useToast } from './ToastProvider';
import { account, storage, ID, BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '@/lib/appwrite';
import { fetchReviews, saveReview, fetchProducts, deleteReview } from '@/lib/catalog';
import SizeCalculator from './SizeCalculator';
import { useCurrency } from './CurrencyProvider';

export default function ProductModal() {
  const { isProductModalOpen, closeProductModal, selectedProduct, openCart } = useAppContext();
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [newReview, setNewReview] = useState({ rating: 5, userEmail: '', comment: '', file: null });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [userAccount, setUserAccount] = useState(null);
  const [liveStock, setLiveStock] = useState(null);
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    account.get().then(res => {
      setUserAccount(res);
      setNewReview(prev => ({ ...prev, userEmail: res.email }));
    }).catch(() => {});
  }, []);

  const checkWishlist = () => {
    if (!selectedProduct) return;
    const wishlist = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    setIsInWishlist(!!wishlist.find(item => item.id === selectedProduct.$id || item.id === selectedProduct.id));
  };

  useEffect(() => {
    if (isProductModalOpen && selectedProduct) {
      // eslint-disable-next-line
      setSelectedSize(null);
      // eslint-disable-next-line
      setCurrentImageIndex(0);
      // eslint-disable-next-line
      setActiveTab('details');
      checkWishlist();
      setLiveStock(selectedProduct.inventory || {});
      
      const productId = selectedProduct.$id || selectedProduct.id;
      fetchReviews(productId).then(setReviews);

      fetchProducts().then(allProducts => {
        const prodArray = Object.values(allProducts || {});
        const fresh = prodArray.find(p => (p.$id || p.id) === productId);
        if (!fresh) {
           showToast("This product is no longer available.", "error");
           closeProductModal();
           return;
        }
        setLiveStock(fresh.inventory || {});

        const cat = selectedProduct.category;
        if (cat) {
          setRecommendations(prodArray.filter(p => p.category === cat && (p.$id || p.id) !== productId).slice(0, 3));
        } else {
          setRecommendations(prodArray.filter(p => (p.$id || p.id) !== productId).slice(0, 3));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProductModalOpen, selectedProduct]);

  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center', transform: 'scale(1)' });
  const [imageErrors, setImageErrors] = useState({});
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };
  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
  };

  useEffect(() => {
    window.addEventListener('wishlistUpdated', checkWishlist);
    return () => window.removeEventListener('wishlistUpdated', checkWishlist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const totalInventory = liveStock ? Object.values(liveStock).reduce((sum, qty) => sum + qty, 0) : (selectedProduct?.inventory ? Object.values(selectedProduct.inventory).reduce((sum, qty) => sum + qty, 0) : 0);
  const isCompletelyOutOfStock = totalInventory <= 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast("Please select a size first", "error");
      return;
    }
    
    // Add to cart logic
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    const existing = cart.find(item => item.id === selectedProduct.id && item.size === selectedSize);
    
    const currentInventory = liveStock || selectedProduct.inventory || {};
    const maxQty = currentInventory[selectedSize] || 0;

    if (existing) {
      if (existing.quantity >= maxQty) {
        showToast("Maximum available stock reached.", "error");
        return;
      }
      existing.quantity += 1;
    } else {
      if (maxQty <= 0) {
        showToast("Item is out of stock.", "error");
        return;
      }
      cart.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: images[0],
        size: selectedSize,
        quantity: 1,
        maxQuantity: maxQty
      });
    }
    
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    closeProductModal();
    openCart(); // Automatically open cart drawer
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.userEmail || !newReview.comment) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      let finalComment = newReview.comment;

      if (newReview.file) {
        const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), newReview.file);
        finalComment += `\n[IMAGE:${fileResponse.$id}]`;
      }

      await saveReview({
        productId: selectedProduct.$id || selectedProduct.id,
        userName: newReview.userEmail.split('@')[0],
        rating: newReview.rating,
        comment: finalComment
      });

      // Award 100 points for review
      if (userAccount) {
        try {
          const prefs = await account.getPrefs();
          const currentPoints = prefs.points || 0;
          await account.updatePrefs({ ...prefs, points: currentPoints + 100 });
        } catch (e) {
          console.error("Failed to award points for review", e);
        }
      }

      setNewReview({ rating: 5, userEmail: userAccount?.email || '', comment: '', file: null });
      showToast('Review submitted! You earned 100 Atelier Points!', 'success');
      const updatedReviews = await fetchReviews(selectedProduct.$id || selectedProduct.id);
      setReviews(updatedReviews);
    } catch (error) {
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'DETAILS & SOURCING' },
    { id: 'sizing', label: 'SIZING GUIDE' },
    { id: 'materials', label: 'MATERIALS' },
    { id: 'reviews', label: 'REVIEWS' },
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
              <div 
                className="overflow-hidden relative w-full h-full cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <AnimatePresence mode="wait">
                  {images[currentImageIndex] && (images[currentImageIndex].match(/\.(mp4|webm)/i) || imageErrors[currentImageIndex]) ? (
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <video
                        src={images[currentImageIndex]}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </motion.div>
                  ) : (
                    <motion.img
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      src={images[currentImageIndex]}
                      alt={selectedProduct.name}
                      onError={() => setImageErrors(prev => ({ ...prev, [currentImageIndex]: true }))}
                      style={{ ...zoomStyle, transition: 'transform 0.1s ease-out' }}
                      className="w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>
              </div>
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute top-1/2 -translate-y-1/2 left-4 z-20 p-2 bg-surface/80 backdrop-blur-sm text-on-surface hover:text-secondary transition-colors rounded-full shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute top-1/2 -translate-y-1/2 right-4 z-20 p-2 bg-surface/80 backdrop-blur-sm text-on-surface hover:text-secondary transition-colors rounded-full shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-surface w-6' : 'bg-surface/50'}`}
                      />
                    ))}
                  </div>
                </>
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
                <p className="font-headline text-2xl text-on-surface font-bold">{formatPrice(String(selectedProduct.price).replace(/[^0-9.]/g, ''))}</p>
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  {reviews.length > 0 ? (
                    <span className="text-sm text-[#7e572e] ml-3 font-headline italic cursor-pointer hover:text-[#5a3e21] transition-colors underline decoration-[#7e572e]/30 underline-offset-4" onClick={() => setActiveTab('reviews')}>
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'} - Write or see a review
                    </span>
                  ) : (
                    <span className="text-sm text-[#7e572e] ml-3 font-headline italic cursor-pointer hover:text-[#5a3e21] transition-colors underline decoration-[#7e572e]/30 underline-offset-4" onClick={() => setActiveTab('reviews')}>
                      Write or see a review
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-label uppercase tracking-widest text-[10px] text-outline font-bold">Select Size:</h3>
                  <button onClick={() => setIsSizeCalcOpen(true)} className="text-[10px] text-[#7e572e] font-bold uppercase tracking-widest hover:text-on-surface transition-colors">
                    SIZE ADVISOR
                  </button>
                </div>
                <div className="flex gap-3">
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => {
                    const stock = liveStock ? liveStock[size] : selectedProduct.inventory?.[size];
                    const isOutOfStock = !stock || stock <= 0;

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
                        <p>Fits true to size. We recommend taking your normal size. Model is 175cm/5&apos;9&quot; and is wearing a size S.</p>
                      )}
                      {activeTab === 'materials' && (
                        <p>100% Organic Silk. Dry clean only. Iron on low heat. Do not bleach. Made ethically in our Parisian atelier.</p>
                      )}
                      {activeTab === 'reviews' && (
                        <div className="flex flex-col gap-6">
                          {/* Write Review Form */}
                          <div className="bg-surface-container p-4 rounded-lg">
                            <h4 className="font-headline text-sm mb-3">Write a Review</h4>
                            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                              <div className="flex items-center gap-2" onMouseLeave={() => setHoveredRating(0)}>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-outline">Rating:</label>
                                {[1,2,3,4,5].map(star => {
                                  const isActive = (hoveredRating || newReview.rating) >= star;
                                  return (
                                    <motion.button 
                                      type="button" 
                                      key={star} 
                                      onClick={() => setNewReview({...newReview, rating: star})} 
                                      onMouseEnter={() => setHoveredRating(star)}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                      animate={{
                                        color: isActive ? '#f59e0b' : '#9ca3af',
                                      }}
                                      className="transition-colors"
                                    >
                                      <Star size={18} fill="currentColor" />
                                    </motion.button>
                                  );
                                })}
                              </div>
                              <input type="email" placeholder="Your Email Address" value={newReview.userEmail} onChange={(e) => setNewReview({...newReview, userEmail: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded p-2 text-xs outline-none focus:border-on-surface" required />
                              <textarea placeholder="Your Comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded p-2 text-xs outline-none focus:border-on-surface resize-none h-20" required></textarea>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-outline cursor-pointer bg-surface border border-outline-variant/30 px-3 py-2 rounded hover:bg-surface-container transition-colors">
                                  {newReview.file ? newReview.file.name : 'Attach a Photo'}
                                  <input type="file" accept="image/*" onChange={(e) => setNewReview({...newReview, file: e.target.files[0]})} className="hidden" />
                                </label>
                                {newReview.file && (
                                  <button type="button" onClick={() => setNewReview({...newReview, file: null})} className="text-error text-xs p-1 hover:bg-error/10 rounded">
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                              <button type="submit" disabled={isSubmittingReview} className="w-full py-2 bg-on-surface text-surface text-[10px] uppercase tracking-widest font-bold rounded hover:bg-secondary disabled:opacity-50">
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </form>
                          </div>
                          
                          {/* Reviews List */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-headline text-sm">Customer Reviews</h4>
                              <div className="flex gap-2">
                                {['All', '5', '4', '3', '2', '1'].map(f => (
                                  <button key={f} onClick={() => setReviewFilter(f)} className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${reviewFilter === f ? 'bg-on-surface text-surface border-on-surface' : 'border-outline-variant/30 text-outline'}`}>
                                    {f === 'All' ? f : f + '★'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              {reviews.filter(r => reviewFilter === 'All' || r.rating.toString() === reviewFilter).length === 0 ? (
                                <p className="text-xs text-outline italic">No reviews match the selected filter.</p>
                              ) : (
                                reviews.filter(r => reviewFilter === 'All' || r.rating.toString() === reviewFilter).map(review => (
                                  <div key={review.$id} className="border-b border-outline-variant/10 pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-bold text-on-surface">{review.userName}</span>
                                      <div className="flex items-center gap-4">
                                        <div className="flex text-[#f59e0b]">
                                          {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                        </div>
                                        {userAccount && userAccount.email.split('@')[0].toLowerCase() === review.userName.toLowerCase() && (
                                          <button 
                                            onClick={async () => {
                                              try {
                                                await deleteReview(review.$id);
                                                showToast('Review deleted', 'success');
                                                fetchReviews(selectedProduct.$id || selectedProduct.id).then(setReviews);
                                              } catch (e) {
                                                showToast('Failed to delete review', 'error');
                                              }
                                            }}
                                            className="text-error text-[10px] uppercase font-bold tracking-widest hover:underline"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-outline-variant">{new Date(review.$createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-on-surface mt-2">{review.comment.replace(/\n?\[IMAGE:([^\]]+)\]/, '')}</p>
                                    
                                    {review.comment.match(/\[IMAGE:([^\]]+)\]/) && (
                                      <div className="mt-3">
                                        <img 
                                          src={`${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${review.comment.match(/\[IMAGE:([^\]]+)\]/)[1]}/view?project=${APPWRITE_PROJECT_ID}`} 
                                          alt="Review attachment" 
                                          className="w-24 h-24 object-cover rounded-lg border border-outline-variant/20 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity"
                                          onClick={() => window.open(`${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${review.comment.match(/\[IMAGE:([^\]]+)\]/)[1]}/view?project=${APPWRITE_PROJECT_ID}`, '_blank')}
                                        />
                                      </div>
                                    )}

                                    {review.reply && (
                                      <div className="mt-3 bg-surface-container p-3 rounded border-l-2 border-secondary">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-1">Atelier Reply</p>
                                        <p className="text-xs">{review.reply}</p>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
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
                  disabled={isCompletelyOutOfStock}
                  className={`flex-1 py-4 font-label tracking-[0.2em] text-[10px] font-bold rounded flex justify-center items-center shadow-lg transition-all ${
                    isCompletelyOutOfStock 
                      ? 'bg-surface-container-low text-outline-variant cursor-not-allowed opacity-70 border border-outline-variant/30' 
                      : 'bg-on-surface text-surface uppercase hover:bg-secondary hover:-translate-y-0.5'
                  }`}
                >
                  {isCompletelyOutOfStock ? 'OUT OF STOCK' : 'ADD TO SHOPPING BAG'}
                </button>
                <button 
                  onClick={handleWishlist}
                  className={`w-14 h-auto flex items-center justify-center border rounded transition-all group ${isInWishlist ? 'border-error bg-error/5 text-error' : 'border-outline-variant/20 hover:border-on-surface text-outline'}`}
                >
                  <Heart size={18} strokeWidth={1.5} className={`${isInWishlist ? 'fill-current text-error' : 'group-hover:text-error transition-colors'}`} />
                </button>
              </div>

              {/* You May Also Like */}
              {recommendations.length > 0 && (
                <div className="mt-12 pt-8 border-t border-outline-variant/10">
                  <h3 className="font-headline text-xl italic mb-6">You May Also Like</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {recommendations.map(rec => {
                      const recImg = Array.isArray(rec.images) && rec.images.length > 0 ? rec.images[0] : rec.image;
                      return (
                        <div key={rec.$id || rec.id} className="group cursor-pointer" onClick={() => {
                          closeProductModal();
                          setTimeout(() => {
                            // Quick shop replacement logic depends on state managed by Providers
                            // Since we can't easily swap modal content without breaking animations,
                            // let's just use window.location if necessary, or just skip it for now and use a link.
                            window.location.href = `/shop`; 
                          }, 300);
                        }}>
                          <div className="aspect-[3/4] bg-surface-container rounded overflow-hidden mb-2 relative">
                            <img src={recImg} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <p className="font-headline text-sm truncate">{rec.name}</p>
                          <p className="font-label text-[10px] text-outline">{formatPrice(String(rec.price).replace(/[^0-9.]/g, ''))}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
          <SizeCalculator isOpen={isSizeCalcOpen} onClose={() => setIsSizeCalcOpen(false)} />
        </div>
      )}
    </AnimatePresence>
  );
}

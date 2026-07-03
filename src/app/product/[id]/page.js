"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchProducts, fetchReviews, saveReview } from "@/lib/catalog";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const { id } = params;
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  
  // Review Form State
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const allProducts = await fetchProducts();
        const p = allProducts[id];
        if (p) {
          setProduct(p);
          setActiveImage(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image);
          
          // Auto-select first available size if any
          if (p.category === 'Fashion Dress' && p.inventory) {
            const availableSizes = Object.entries(p.inventory).filter(([_, qty]) => qty > 0).map(([s]) => s);
            if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
          } else {
            setSelectedSize('One Size');
          }
        }
        
        // Fetch reviews
        const productReviews = await fetchReviews(id);
        setReviews(productReviews);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (product.category === 'Fashion Dress' && !selectedSize) {
      showToast("Please select a size first.", "error");
      return;
    }
    
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.images) ? product.images[0] : product.image,
      size: selectedSize
    };
    const newCart = [...cart, itemToAdd];
    localStorage.setItem('atelier_cart', JSON.stringify(newCart));
    showToast(`${product.name} added to your shopping bag!`, "success");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      await saveReview({
        productId: id,
        userName: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      // Refresh reviews
      const updatedReviews = await fetchReviews(id);
      setReviews(updatedReviews);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
      showToast("Review submitted successfully!", "success");
    } catch (err) {
      showToast("Failed to submit review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 px-6 lg:px-12 flex items-center justify-center min-h-screen">
          <p className="text-outline text-sm uppercase tracking-widest">Loading product...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 px-6 lg:px-12 flex items-center justify-center min-h-screen">
          <p className="text-outline text-sm uppercase tracking-widest">Product not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
  let availableSizes = [];
  if (product.category === 'Fashion Dress' && product.inventory) {
    availableSizes = Object.entries(product.inventory).filter(([_, qty]) => qty > 0).map(([s]) => s);
  }
  
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 lg:px-12 max-w-[1920px] mx-auto min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 mb-32">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
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

            <div className="flex-grow group relative overflow-hidden rounded-lg bg-surface-container-low cursor-zoom-in">
              <img className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" src={activeImage} alt={product.name} />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-label tracking-widest uppercase text-on-surface">{product.category || 'New Arrival'}</span>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="sticky top-32">
              <nav className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-outline mb-6">
                <Link className="hover:text-on-surface transition-colors" href="/shop">Shop</Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="hover:text-on-surface transition-colors">{product.name}</span>
              </nav>
              
              <h2 className="font-headline text-4xl lg:text-5xl text-on-surface leading-tight mb-4">{product.name}</h2>
              
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-headline text-2xl text-on-surface">{product.price}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/10">
                <div className="flex text-secondary">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${star <= Math.round(avgRating) ? 1 : 0}` }}>star</span>
                  ))}
                </div>
                <span className="text-xs font-label uppercase tracking-widest text-outline">{reviews.length} Reviews</span>
              </div>
              
              <div className="space-y-8 mb-10">
                {product.color && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-label uppercase tracking-widest text-on-surface">Color: <span className="text-outline">{product.color}</span></span>
                    </div>
                  </div>
                )}
                {product.fabric && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-label uppercase tracking-widest text-on-surface">Fabric: <span className="text-outline">{product.fabric}</span></span>
                    </div>
                  </div>
                )}
                
                {product.category === 'Fashion Dress' && availableSizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-label uppercase tracking-widest text-on-surface">Select Size</span>
                      <button className="text-[10px] font-label uppercase tracking-widest text-secondary hover:underline">Size Guide</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['XS', 'S', 'M', 'L', 'XL'].map(size => {
                        const isAvailable = availableSizes.includes(size);
                        return (
                          <button 
                            key={size}
                            disabled={!isAvailable}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 text-xs font-label rounded-lg transition-colors ${
                              !isAvailable ? 'opacity-30 border border-outline-variant/20 cursor-not-allowed line-through' :
                              selectedSize === size ? 'border-2 border-on-surface text-on-surface bg-surface-container-low' : 
                              'border border-outline-variant/20 hover:border-on-surface'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {product.category === 'Fashion Dress' && availableSizes.length === 0 && (
                  <p className="text-error text-sm font-bold uppercase tracking-widest">Out of Stock</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-12">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.category === 'Fashion Dress' && availableSizes.length === 0}
                  className="w-full py-5 bg-on-surface text-surface rounded-full font-label uppercase tracking-[0.2em] text-xs hover:bg-secondary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Shopping Bag
                </button>
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
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="max-w-4xl mx-auto mb-32">
          <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-4">
            <h3 className="font-headline text-3xl text-on-surface">Customer Reviews</h3>
          </div>
          
          <div className="space-y-12">
            {reviews.length === 0 ? (
              <p className="text-outline text-sm">No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map(review => (
                <div key={review.$id} className="border-b border-outline-variant/10 pb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-bold text-sm uppercase tracking-widest">{review.userName}</span>
                    <div className="flex text-secondary">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: `'FILL' ${star <= review.rating ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant font-body leading-relaxed">{review.comment}</p>
                  
                  {review.reply && (
                    <div className="mt-4 bg-surface-container-lowest p-4 rounded border border-outline-variant/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Azhagii Team Reply:</p>
                      <p className="text-sm text-on-surface-variant italic font-body">{review.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-16 bg-surface-container-low p-8 rounded-lg">
            <h4 className="font-headline text-xl mb-6">Leave a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Your Name *</label>
                  <input required value={reviewName} onChange={e => setReviewName(e.target.value)} type="text" className="w-full bg-surface-container-lowest border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Rating *</label>
                  <select required value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full bg-surface-container-lowest border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none">
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Your Review *</label>
                <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} className="w-full bg-surface-container-lowest border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none"></textarea>
              </div>
              <button disabled={isSubmittingReview} type="submit" className="bg-on-surface text-surface px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50">
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

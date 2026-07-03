"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { saveOrder, validateCoupon } from "@/lib/catalog";
import { getUser } from "@/lib/auth";
import { account } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { showToast } = useToast();
  const router = useRouter();
  const [isCheckout, setIsCheckout] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Checkout Form State
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "Cash on Delivery"
  });
  
  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    loadCart();
    fetchSavedAddresses();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    setCartItems(cart);
    
    let total = 0;
    cart.forEach(item => {
      const numericStr = (item.price || "").replace(/[^0-9.]/g, '');
      total += (parseFloat(numericStr) || 0) * (item.quantity || 1);
    });
    setSubtotal(total);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    cart[index].quantity = newQuantity;
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setCartItems(cart);
    
    let total = 0;
    cart.forEach(item => {
      const numericStr = (item.price || "").replace(/[^0-9.]/g, '');
      total += (parseFloat(numericStr) || 0) * (item.quantity || 1);
    });
    setSubtotal(total);
  };

  const fetchSavedAddresses = async () => {
    try {
      const user = await getUser();
      if (user) {
        const prefs = await account.getPrefs();
        if (prefs.addresses) {
          const addresses = JSON.parse(prefs.addresses);
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            handleSelectAddress(addresses[0]);
          }
        }
      }
    } catch (e) {
      // Guest user or failed to fetch
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShipping({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      paymentMethod: shipping.paymentMethod
    });
  };

  const handleRemove = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    localStorage.setItem('atelier_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    loadCart();
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.toUpperCase());
      if (result.valid) {
        const coupon = result.coupon;
        if (subtotal < coupon.minPrice) {
          showToast(`Order must be at least ₹${coupon.minPrice} to use this coupon.`, 'error');
          setDiscountAmount(0);
        } else {
          setDiscountAmount(coupon.discountAmount);
          showToast('Coupon applied!', 'success');
        }
      } else {
        showToast(result.message, 'error');
        setDiscountAmount(0);
      }
    } catch (err) {
      showToast('Error applying coupon.', 'error');
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCompleteOrder = async () => {
    if (!shipping.fullName || !shipping.address || !shipping.city) {
      showToast("Please fill out your shipping details.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const user = await getUser();
      const orderPayload = {
        userId: user ? user.$id : 'guest',
        items: JSON.stringify(cartItems),
        total: finalTotal,
        status: 'Pending',
        shippingAddress: JSON.stringify(shipping)
      };
      
      await saveOrder(orderPayload);
      localStorage.removeItem('atelier_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      showToast("Order placed successfully!", "success");
      router.push("/");
    } catch (err) {
      console.error(err);
      showToast("Failed to place order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        
        <div className="flex justify-center mb-16 space-x-12">
          <div className={`flex items-center gap-3 ${isCheckout ? 'opacity-30' : ''}`}>
            <span className="font-headline text-2xl text-on-surface">01</span>
            <span className={`uppercase tracking-widest text-[10px] font-bold ${!isCheckout ? 'border-b border-on-surface pb-1' : ''}`}>Shopping Bag</span>
          </div>
          <div className={`flex items-center gap-3 ${!isCheckout ? 'opacity-30' : ''}`}>
            <span className="font-headline text-2xl">02</span>
            <span className={`uppercase tracking-widest text-[10px] font-bold ${isCheckout ? 'border-b border-on-surface pb-1 text-on-surface' : ''}`}>Checkout</span>
          </div>
        </div>

        {!isCheckout ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-12">
              <h1 className="font-headline text-4xl mb-8">Your Selections</h1>
              
              <div className="space-y-10">
                {cartItems.length === 0 ? (
                  <p className="text-outline text-sm uppercase tracking-widest">Your shopping bag is empty.</p>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={index} className="flex gap-6 pb-10 border-b border-outline-variant/10">
                      <div className="w-32 h-44 bg-surface-container overflow-hidden rounded-lg shrink-0">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold uppercase tracking-wider text-xs">{item.name}</h3>
                            <button onClick={() => handleRemove(index)} className="text-outline hover:text-on-surface transition-colors">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <p className="text-on-surface-variant text-sm mt-1">{item.size}</p>
                          <p className="font-headline text-lg mt-2">{item.price}</p>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center border border-outline-variant/20 rounded-full px-2 py-1 gap-4">
                            <button onClick={() => updateQuantity(index, (item.quantity || 1) - 1)} className="text-outline hover:text-on-surface transition-colors w-6 h-6 flex items-center justify-center">-</button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity || 1}</span>
                            <button onClick={() => updateQuantity(index, (item.quantity || 1) + 1)} className="text-outline hover:text-on-surface transition-colors w-6 h-6 flex items-center justify-center">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-surface-container-low p-6 rounded-lg flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                <p className="text-xs uppercase tracking-wide">Complementary shipping on orders over ₹1,000</p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-lg border border-outline-variant/10 sticky top-32">
                <h2 className="font-headline text-2xl mb-8">Order Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider">Subtotal</span>
                    <span className="font-headline">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider">Shipping</span>
                    <span className="font-headline">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10 flex justify-between">
                    <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                    <span className="font-headline text-2xl">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsCheckout(true)}
                  disabled={cartItems.length === 0}
                  className="w-full bg-on-surface text-surface py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-outline-variant/10 pt-10">
            <div className="lg:col-span-7 space-y-16">
              
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="font-headline text-3xl">Shipping Details</h2>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-4 text-on-surface-variant">Saved Addresses</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map(addr => (
                        <div 
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary-container/20' : 'border-outline-variant/30 hover:border-on-surface bg-surface-container-low'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm">{addr.fullName}</p>
                            {selectedAddressId === addr.id && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                          </div>
                          <p className="text-xs text-on-surface-variant">{addr.address}</p>
                          <p className="text-xs text-on-surface-variant">{addr.city}, {addr.postalCode}</p>
                        </div>
                      ))}
                      <div 
                        onClick={() => { setSelectedAddressId('new'); setShipping({ fullName: '', address: '', city: '', postalCode: '', paymentMethod: shipping.paymentMethod }); }}
                        className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${selectedAddressId === 'new' ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-on-surface'}`}
                      >
                        <span className="material-symbols-outlined text-outline">add</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-outline">New Address</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Full Name *</label>
                    <input 
                      value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})}
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" type="text" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Address *</label>
                    <input 
                      value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})}
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">City *</label>
                    <input 
                      value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})}
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Postal Code</label>
                    <input 
                      value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})}
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" type="text" />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-headline text-3xl mb-10">Payment Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center p-6 bg-surface-container-low rounded-lg cursor-pointer border transition-all ${shipping.paymentMethod === 'Cash on Delivery' ? 'border-secondary' : 'border-transparent hover:border-outline-variant/30'}`}>
                    <input checked={shipping.paymentMethod === 'Cash on Delivery'} onChange={() => setShipping({...shipping, paymentMethod: 'Cash on Delivery'})} className="text-on-surface focus:ring-on-surface mr-6 accent-on-surface" name="payment" type="radio" />
                    <div className="flex-1 flex items-center gap-4">
                      <span className="material-symbols-outlined text-outline">payments</span>
                      <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Cash on Delivery</span>
                    </div>
                  </label>
                  <div className={`flex flex-col p-6 bg-surface-container-low rounded-lg border transition-all ${shipping.paymentMethod === 'Online Payment' ? 'border-secondary' : 'border-transparent hover:border-outline-variant/30'}`}>
                    <label className="flex items-center cursor-pointer">
                      <input checked={shipping.paymentMethod === 'Online Payment'} onChange={() => setShipping({...shipping, paymentMethod: 'Online Payment'})} className="text-on-surface focus:ring-on-surface mr-6 accent-on-surface" name="payment" type="radio" />
                      <div className="flex-1 flex items-center gap-4">
                        <span className="material-symbols-outlined text-outline">credit_card</span>
                        <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Online Payment (UPI)</span>
                      </div>
                    </label>
                    {shipping.paymentMethod === 'Online Payment' && (
                      <div className="mt-4 ml-10 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded text-sm">
                        <p className="font-bold text-xs uppercase tracking-widest text-on-surface mb-2">Scan & Pay</p>
                        <p className="text-on-surface-variant text-xs mb-1">Please make the payment to the following UPI ID:</p>
                        <p className="font-bold text-secondary text-base">9940984501@ybl</p>
                        <p className="text-[10px] text-outline mt-2 italic">* Your order will be processed once payment is confirmed.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-lg border border-outline-variant/10 sticky top-32">
                <h2 className="font-headline text-2xl mb-8">Review Order</h2>
                <div className="space-y-6 mb-10 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-20 bg-surface-container rounded-lg shrink-0">
                        <img className="w-full h-full object-cover rounded-lg" src={item.image} alt={item.name} />
                      </div>
                      <div className="flex-1 text-[10px] uppercase tracking-widest">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-outline-variant mt-1">{item.size}</p>
                        <p className="mt-2 font-headline text-sm normal-case font-normal">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Coupon Code Section */}
                <div className="mb-8 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-surface-container border border-outline-variant/30 rounded px-4 py-2 text-sm uppercase focus:outline-none focus:border-on-surface"
                  />
                  <button 
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="px-4 py-2 bg-on-surface text-surface text-xs font-bold uppercase tracking-widest rounded disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-4 mb-10 pt-6 border-t border-outline-variant/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Subtotal</span>
                    <span className="font-headline text-base">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span className="uppercase tracking-wider text-[10px]">Discount</span>
                      <span className="font-headline text-base">- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Shipping</span>
                    <span className="font-headline text-base">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10 flex justify-between">
                    <span className="font-bold uppercase tracking-[0.2em] text-xs">Final Amount</span>
                    <span className="font-headline text-3xl">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-on-secondary py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-on-surface transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

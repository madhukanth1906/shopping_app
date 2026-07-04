"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderSuccess from "@/components/OrderSuccess";
import { saveOrder, validateCoupon, fetchProducts, saveProduct } from "@/lib/catalog";
import { getUser } from "@/lib/auth";
import { account } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { CheckCircle, CreditCard, Banknote, MapPin, Truck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Checkout Form State
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    mobileNumber: "",
    paymentMethod: "Cash on Delivery"
  });

  // Mobile Verification State
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpHash, setOtpHash] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const steps = [
    { id: 1, title: 'Address' },
    { id: 2, title: 'Delivery' },
    { id: 3, title: 'Payment' },
    { id: 4, title: 'Review' }
  ];

  useEffect(() => {
    loadCart();
    fetchSavedAddresses();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    setCartItems(cart);
    if (cart.length === 0) {
      router.push('/');
    }
    
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
    setShipping({ ...shipping, fullName: addr.fullName, address: addr.address, city: addr.city, postalCode: addr.postalCode });
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSendOtp = async () => {
    if (!shipping.mobileNumber) {
      showToast("Please enter a mobile number first.", "error");
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: shipping.mobileNumber })
      });
      const data = await res.json();
      if (data.success) {
        setOtpHash(data.hash);
        setIsOtpSent(true);
        showToast("OTP sent via WhatsApp!", "success");
      } else {
        showToast(data.error || "Failed to send OTP", "error");
      }
    } catch (e) {
      showToast("Error sending OTP", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      showToast("Please enter the OTP.", "error");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: shipping.mobileNumber, otp: otpInput, hash: otpHash })
      });
      const data = await res.json();
      if (data.success) {
        setIsPhoneVerified(true);
        showToast("Phone number verified successfully!", "success");
      } else {
        showToast(data.error || "Invalid OTP", "error");
      }
    } catch (e) {
      showToast("Error verifying OTP", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.mobileNumber) {
        showToast("Please fill out all address fields.", "error");
        return;
      }
      if (!isPhoneVerified) {
        showToast("Please verify your mobile number first.", "error");
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const user = await getUser();
      if (!user) {
        showToast("Please sign in to place an order.", "error");
        setTimeout(() => {
          window.location.href = '/account';
        }, 1500);
        return;
      }
      
      const orderPayload = {
        userId: user.$id,
        items: JSON.stringify(cartItems),
        total: finalTotal,
        status: 'Pending',
        shippingAddress: JSON.stringify(shipping)
      };
      
      await saveOrder(orderPayload);
      
      // Reduce inventory
      const allProducts = await fetchProducts();
      for (const item of cartItems) {
        const product = allProducts[item.id];
        if (product && product.inventory && product.inventory[item.size] !== undefined) {
          const currentQty = parseInt(product.inventory[item.size]) || 0;
          const orderQty = parseInt(item.quantity) || 1;
          product.inventory[item.size] = Math.max(0, currentQty - orderQty);
          await saveProduct(product);
        }
      }
      localStorage.removeItem('atelier_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      setOrderComplete(true);
    } catch (err) {
      console.error(err);
      showToast("Failed to place order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return <OrderSuccess orderDetails={{ total: finalTotal, shippingAddress: shipping }} />;
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        
        {/* Step Indicator */}
        <div className="flex justify-center mb-16 max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= step.id ? 'text-on-surface' : 'text-outline opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${currentStep === step.id ? 'bg-on-surface text-surface' : currentStep > step.id ? 'bg-surface border-2 border-on-surface text-on-surface' : 'border-2 border-outline'}`}>
                  {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-24 h-px mx-4 -mt-6 ${currentStep > step.id ? 'bg-on-surface' : 'bg-outline-variant/30'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="font-headline text-3xl mb-8">Shipping Address</h2>
                  
                  {savedAddresses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {savedAddresses.map(addr => (
                        <div 
                          key={addr.id} onClick={() => handleSelectAddress(addr)}
                          className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' : 'border-outline-variant/30 hover:border-on-surface bg-surface shadow-sm'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm tracking-wide">{addr.fullName}</p>
                            {selectedAddressId === addr.id && <CheckCircle size={18} className="text-secondary" strokeWidth={2} />}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{addr.address}<br/>{addr.city}, {addr.postalCode}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Full Name</label>
                      <input value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-on-surface focus:ring-1 focus:ring-on-surface outline-none transition-all" type="text" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Address</label>
                      <input value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-on-surface focus:ring-1 focus:ring-on-surface outline-none transition-all" type="text" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">City</label>
                        <input value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-on-surface focus:ring-1 focus:ring-on-surface outline-none transition-all" type="text" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Postal Code</label>
                        <input value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-on-surface focus:ring-1 focus:ring-on-surface outline-none transition-all" type="text" />
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/20 pt-6 mt-6">
                      <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mobile Number (For WhatsApp Verification)</label>
                      <div className="flex gap-4">
                        <input 
                          value={shipping.mobileNumber} 
                          onChange={e => setShipping({...shipping, mobileNumber: e.target.value})} 
                          placeholder="+1234567890"
                          disabled={isPhoneVerified || isOtpSent}
                          className="flex-1 bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-on-surface focus:ring-1 focus:ring-on-surface outline-none transition-all disabled:opacity-50" 
                          type="text" 
                        />
                        {!isPhoneVerified && !isOtpSent && (
                          <button 
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || !shipping.mobileNumber}
                            className="bg-on-surface text-surface px-6 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {isSendingOtp ? 'Sending...' : 'Verify'}
                          </button>
                        )}
                        {isPhoneVerified && (
                          <div className="flex items-center gap-2 text-success px-4 font-bold text-sm bg-success/10 rounded-lg">
                            <CheckCircle size={18} /> Verified
                          </div>
                        )}
                      </div>
                      
                      {isOtpSent && !isPhoneVerified && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 border border-secondary/30 bg-secondary/5 rounded-lg">
                          <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block text-secondary">Enter WhatsApp OTP</label>
                          <div className="flex gap-4">
                            <input 
                              value={otpInput} 
                              onChange={e => setOtpInput(e.target.value)} 
                              placeholder="6-digit code"
                              maxLength={6}
                              className="flex-1 bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-center tracking-[0.5em] font-bold" 
                              type="text" 
                            />
                            <button 
                              onClick={handleVerifyOtp}
                              disabled={isVerifyingOtp || otpInput.length < 5}
                              className="bg-secondary text-on-secondary px-6 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                            >
                              {isVerifyingOtp ? 'Verifying...' : 'Confirm'}
                            </button>
                          </div>
                          <button onClick={() => setIsOtpSent(false)} className="text-[10px] mt-3 underline text-on-surface-variant hover:text-on-surface">Change Number or Resend</button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="font-headline text-3xl mb-8">Delivery Method</h2>
                  <div className="p-6 border-2 border-secondary bg-secondary/5 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Truck size={24} className="text-secondary" strokeWidth={1.5} />
                      <div>
                        <p className="font-bold text-sm">Premium Standard Delivery</p>
                        <p className="text-xs text-on-surface-variant mt-1">3-5 Business Days</p>
                      </div>
                    </div>
                    <span className="font-headline font-semibold">Free</span>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="font-headline text-3xl mb-8">Payment Method</h2>
                  <div className="space-y-4">
                    <label className={`flex items-center p-6 bg-surface border shadow-sm rounded-xl cursor-pointer transition-all ${shipping.paymentMethod === 'Cash on Delivery' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}>
                      <input checked={shipping.paymentMethod === 'Cash on Delivery'} onChange={() => setShipping({...shipping, paymentMethod: 'Cash on Delivery'})} className="text-secondary focus:ring-secondary mr-6 accent-secondary" name="payment" type="radio" />
                      <div className="flex-1 flex items-center gap-4">
                        <Banknote size={24} strokeWidth={1.5} className={shipping.paymentMethod === 'Cash on Delivery' ? "text-secondary" : "text-outline"} />
                        <span className="uppercase tracking-[0.2em] text-xs font-bold">Cash on Delivery</span>
                      </div>
                    </label>
                    <div className={`flex flex-col p-6 bg-surface border shadow-sm rounded-xl transition-all ${shipping.paymentMethod === 'Online Payment' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}>
                      <label className="flex items-center cursor-pointer">
                        <input checked={shipping.paymentMethod === 'Online Payment'} onChange={() => setShipping({...shipping, paymentMethod: 'Online Payment'})} className="text-secondary focus:ring-secondary mr-6 accent-secondary" name="payment" type="radio" />
                        <div className="flex-1 flex items-center gap-4">
                          <CreditCard size={24} strokeWidth={1.5} className={shipping.paymentMethod === 'Online Payment' ? "text-secondary" : "text-outline"} />
                          <span className="uppercase tracking-[0.2em] text-xs font-bold">Online Payment (UPI)</span>
                        </div>
                      </label>
                      {shipping.paymentMethod === 'Online Payment' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 ml-10 p-5 bg-surface rounded-lg shadow-inner border border-outline-variant/10 text-sm">
                          <p className="font-bold text-[10px] uppercase tracking-widest text-on-surface mb-2">Scan & Pay</p>
                          <p className="text-on-surface-variant text-xs mb-1">Please make the payment to the following UPI ID:</p>
                          <p className="font-headline text-secondary text-xl mt-2">9940984501@ybl</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h2 className="font-headline text-3xl mb-8">Review Your Order</h2>
                  
                  <div className="bg-surface border border-outline-variant/20 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-outline mb-6">Order Items</h3>
                    <div className="space-y-6">
                      {cartItems.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-16 h-24 bg-surface-container rounded shrink-0">
                            <img className="w-full h-full object-cover rounded" src={item.image} alt={item.name} />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <p className="font-bold text-xs uppercase tracking-widest">{item.name}</p>
                            <p className="text-outline text-xs mt-1 uppercase">Size: {item.size} | Qty: {item.quantity}</p>
                            <p className="mt-2 font-headline">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-outline">Shipping To</h3>
                        <button onClick={() => setCurrentStep(1)} className="text-[10px] uppercase font-bold text-secondary hover:underline">Edit</button>
                      </div>
                      <p className="text-sm font-bold">{shipping.fullName}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{shipping.address}, {shipping.city}</p>
                    </div>
                    <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-outline">Payment</h3>
                        <button onClick={() => setCurrentStep(3)} className="text-[10px] uppercase font-bold text-secondary hover:underline">Edit</button>
                      </div>
                      <p className="text-sm font-bold">{shipping.paymentMethod}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 flex justify-between">
              {currentStep > 1 && currentStep < 5 && (
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-outline hover:text-on-surface transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button 
                  onClick={handleNextStep}
                  className="ml-auto px-12 py-4 bg-on-surface text-surface text-[10px] uppercase font-bold tracking-widest rounded hover:bg-secondary transition-all shadow-md active:scale-95"
                >
                  Continue to {steps[currentStep].title}
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="ml-auto px-12 py-4 bg-secondary text-surface text-[10px] uppercase font-bold tracking-widest rounded hover:bg-on-surface transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>

          {/* Sticky Summary Widget */}
          <div className="lg:col-span-5 relative">
            <div className="bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-outline-variant/20 p-8 rounded-2xl sticky top-32">
              <h3 className="font-headline text-2xl mb-8">Summary</h3>
              
              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Subtotal</span>
                  <span className="font-headline font-medium text-base">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Delivery</span>
                  <span className="font-headline font-medium text-base">FREE</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span className="uppercase tracking-wider text-[10px]">Discount</span>
                    <span className="font-headline font-medium text-base">- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 mt-6 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-[0.2em] text-xs">Total</span>
                  <span className="font-headline text-3xl">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

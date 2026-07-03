"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Cart() {
  const [isCheckout, setIsCheckout] = useState(false);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Progress Steps */}
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
          /* Cart View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-12">
              <h1 className="font-headline text-4xl mb-8">Your Selections</h1>
              
              <div className="space-y-10">
                {/* Item 1 */}
                <div className="flex gap-6 pb-10 border-b border-outline-variant/10">
                  <div className="w-32 h-44 bg-surface-container overflow-hidden rounded-lg">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpZVLoLhTRdxA5_ON8y2nF7KcgpuOHLlwtv9DLWlLGox65r6DC4GKn7b1hkSG9SZP6rtZxAno78pY-qqeA_me4L3PvIyFx3ABmK595noEFUedXwqk_WrqbQOWON8yypUsaYAwbgNTRHwskGXPvkI8PV4SAVoaW4ZO-9nyMojuuU4HKZnXA0D0K6gEpZfoNe4kL4_V4wCiK6DlA_SIOgABq--OuWK41NzNXAkSM2VOg9SIwQ0ANzB4haSQCuBeQzS_fUGSPg-XiqD8" alt="Dress" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold uppercase tracking-wider text-xs">Azhagiii Silk Wrap Dress</h3>
                        <button className="text-outline hover:text-on-surface transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <p className="text-on-surface-variant text-sm mt-1">Champagne / EU 38</p>
                      <p className="font-headline text-lg mt-2">₹890.00</p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center border border-outline-variant/20 rounded-full px-4 py-1 gap-4">
                        <button className="text-xs hover:text-secondary">-</button>
                        <span className="text-xs font-bold w-4 text-center">1</span>
                        <button className="text-xs hover:text-secondary">+</button>
                      </div>
                      <button className="text-[10px] uppercase tracking-widest underline underline-offset-4 text-outline hover:text-on-surface">Move to Wishlist</button>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-6 pb-10 border-b border-outline-variant/10">
                  <div className="w-32 h-44 bg-surface-container overflow-hidden rounded-lg">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMuk1cWr3DNXXDB-Nczpkw0KFWFTRMNkwCtDrtKj5oXmUYxAtXweMhrcvEASR0Nd6JWupGtAcwfM__CU09nzmMNhhVn8GNcMnn88ll6Tj3YN9lIh_njEbRasGChcL8bU-LI31ugkVFFKx-OAcOOd6jXauhOjkibShn8QdofV55HLMXOpbjCnKGXY_v-f-tHR5KkOdj9YtWlDvtdhDHgpWeF4C7k-qDsFJRewiwjdZTY2EGtWFfhQpucQqzfV4JPxuqaRB328m2rBQ" alt="Clutch" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold uppercase tracking-wider text-xs">Nocturne Leather Clutch</h3>
                        <button className="text-outline hover:text-on-surface transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <p className="text-on-surface-variant text-sm mt-1">Mahogany / One Size</p>
                      <p className="font-headline text-lg mt-2">₹420.00</p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center border border-outline-variant/20 rounded-full px-4 py-1 gap-4">
                        <button className="text-xs hover:text-secondary">-</button>
                        <span className="text-xs font-bold w-4 text-center">1</span>
                        <button className="text-xs hover:text-secondary">+</button>
                      </div>
                      <button className="text-[10px] uppercase tracking-widest underline underline-offset-4 text-outline hover:text-on-surface">Move to Wishlist</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Hint */}
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
                    <span className="font-headline">₹1,310.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider">Shipping</span>
                    <span className="font-headline">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10 flex justify-between">
                    <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                    <span className="font-headline text-2xl">₹1,310.00</span>
                  </div>
                </div>
                
                {/* Coupon */}
                <div className="mb-8">
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Promo Code</label>
                  <div className="flex border-b border-outline-variant/30 focus-within:border-on-surface transition-colors">
                    <input className="bg-transparent border-none focus:ring-0 w-full text-sm py-2 px-0 tracking-widest placeholder:text-outline-variant/50 outline-none" placeholder="ENTER CODE" type="text" />
                    <button className="text-[10px] font-bold uppercase tracking-widest hover:text-secondary">Apply</button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsCheckout(true)}
                  className="w-full bg-on-surface text-surface py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-secondary transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                
                <div className="mt-8 space-y-4 text-[10px] uppercase tracking-widest text-center text-outline-variant">
                  <p className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xs">lock</span> Secure Payment Processing
                  </p>
                  <p>30-Day Curated Return Policy</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-outline-variant/10 pt-10">
            <div className="lg:col-span-7 space-y-20">
              <section>
                <h2 className="font-headline text-3xl mb-10">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Full Name</label>
                    <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" placeholder="Evelyn Thorne" type="text" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Address</label>
                    <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" placeholder="124 Editorial Row, Suite 402" type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">City</label>
                    <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" placeholder="Milan" type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block">Postal Code</label>
                    <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-3 text-sm tracking-wide outline-none" placeholder="20121" type="text" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <button className="bg-secondary text-on-secondary px-6 py-2 rounded uppercase tracking-widest text-xs font-bold hover:bg-on-surface transition-all">Save Address</button>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-headline text-3xl mb-10">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center p-6 bg-surface-container-low rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/30 transition-all">
                    <input defaultChecked className="text-on-surface focus:ring-on-surface mr-6 accent-on-surface" name="payment" type="radio" />
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-outline">credit_card</span>
                        <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Credit / Debit Card</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-4 bg-outline-variant/20 rounded"></div>
                        <div className="w-6 h-4 bg-outline-variant/20 rounded"></div>
                      </div>
                    </div>
                  </label>
                  
                  <div className="px-6 py-8 bg-surface-container-low/50 rounded-lg space-y-6 mt-[-1rem]">
                    <div className="relative">
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block">Card Number</label>
                      <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-2 text-sm outline-none" placeholder="XXXX XXXX XXXX 4421" type="text" />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block">Expiry</label>
                        <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-2 text-sm outline-none" placeholder="MM/YY" type="text" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block">CVV</label>
                        <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-on-surface focus:ring-0 border-t-0 border-x-0 px-0 py-2 text-sm outline-none" placeholder="***" type="password" />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center p-6 bg-surface-container-low rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/30 transition-all">
                    <input className="text-on-surface focus:ring-on-surface mr-6 accent-on-surface" name="payment" type="radio" />
                    <div className="flex-1 flex items-center gap-4">
                      <span className="material-symbols-outlined text-outline">account_balance</span>
                      <span className="uppercase tracking-[0.2em] text-[10px] font-bold">UPI / Digital Wallet</span>
                    </div>
                  </label>

                  <label className="flex items-center p-6 bg-surface-container-low rounded-lg cursor-pointer border border-transparent hover:border-outline-variant/30 transition-all">
                    <input className="text-on-surface focus:ring-on-surface mr-6 accent-on-surface" name="payment" type="radio" />
                    <div className="flex-1 flex items-center gap-4">
                      <span className="material-symbols-outlined text-outline">payments</span>
                      <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Cash on Delivery</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-lg border border-outline-variant/10 sticky top-32">
                <h2 className="font-headline text-2xl mb-8">Review Order</h2>
                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-surface-container rounded-lg shrink-0">
                      <img className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDchHsf0CeSf4fd42S_dyPKP8t6Ug4136l5ZANU9cTJXgBR5mkwrZfZdeJUdQ6oPsWZuqkMqFXigHuFOUIF0_q84PR8XkQBlLWWlDU3doaKB2u99Qv19eq03JxcSzcd1UnzsejUoq5tgw-dTXMaQj6ch52Mabc9iwOx5D_48hm0n0lRzmUqudC3ffbNO--gfD0dYh6Jm-m-i9u00ziK0rrTAc8ycZ8nvtu5P8BxH-4I2L6Bca6OQ782f9qfZ5EeYc3Z6rFv6Uh2yM" alt="Dress Detail" />
                    </div>
                    <div className="flex-1 text-[10px] uppercase tracking-widest">
                      <p className="font-bold">Azhagiii Silk Wrap Dress</p>
                      <p className="text-outline-variant mt-1">EU 38</p>
                      <p className="mt-2 font-headline text-sm normal-case font-normal">₹890.00</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-surface-container rounded-lg shrink-0">
                      <img className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtZlaxTNYScjDsiGKgBrzocpetX9BW6OVAzqfktjePslq4HtzcKcNza3yx8m3H-J2x02l04C1Z0xHFSn0dipDXHYl6kjZv4-6eSEoEqflspN138Hc30VtjbtiLp4gQ3UBCC8hYGQn7EJoZTtdXUL7QnVGlQqIAl1XX7GDipE9vAM3HdyKK0lBd5VFGOOi--fNmYWsgBF3DidtZKs1Lk0CtNCOjiN3MmM0Jh8FZjowvBLnvPaY0fiA4Eou5ooTpaOcdSTnKoz8iRbs" alt="Clutch Detail" />
                    </div>
                    <div className="flex-1 text-[10px] uppercase tracking-widest">
                      <p className="font-bold">Nocturne Leather Clutch</p>
                      <p className="text-outline-variant mt-1">One Size</p>
                      <p className="mt-2 font-headline text-sm normal-case font-normal">₹420.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-10 pt-6 border-t border-outline-variant/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Subtotal</span>
                    <span className="font-headline text-base">₹1,310.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Shipping</span>
                    <span className="font-headline text-base">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10 flex justify-between">
                    <span className="font-bold uppercase tracking-[0.2em] text-xs">Final Amount</span>
                    <span className="font-headline text-3xl">₹1,310.00</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsCheckout(false)}
                  className="w-full bg-secondary text-on-secondary py-5 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-on-surface transition-all"
                >
                  Complete Order
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

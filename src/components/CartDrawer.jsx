"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppContext } from './Providers';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useAppContext();
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  const updateCartState = () => {
    setCartItems(JSON.parse(localStorage.getItem('atelier_cart') || '[]'));
  };

  useEffect(() => {
    updateCartState();
    window.addEventListener('cartUpdated', updateCartState);
    return () => window.removeEventListener('cartUpdated', updateCartState);
  }, []);

  // Update localStorage when cartItems changes internally
  const updateLocalStorage = (newCart) => {
    localStorage.setItem('atelier_cart', JSON.stringify(newCart));
    setCartItems(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (id, size, delta) => {
    const newCart = cartItems.map(item => {
      if (item.id === id && item.size === size) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    updateLocalStorage(newCart);
  };

  const removeItem = (id, size) => {
    const newCart = cartItems.filter(item => !(item.id === id && item.size === size));
    updateLocalStorage(newCart);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface z-[101] shadow-2xl flex flex-col border-l border-outline-variant/20"
          >
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-2xl tracking-tight text-on-surface flex items-center gap-3">
                <ShoppingBag size={24} strokeWidth={1.5} />
                Shopping Bag
              </h2>
              <button onClick={closeCart} className="p-2 text-outline hover:text-on-surface transition-colors rounded-full hover:bg-outline-variant/10">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-label uppercase tracking-widest text-xs">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <motion.div 
                      key={item.id + item.size}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 group"
                    >
                      <div className="w-24 aspect-[3/4] bg-surface/50 rounded overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm tracking-wide text-on-surface">{item.name}</h3>
                            <button onClick={() => removeItem(item.id, item.size)} className="text-outline hover:text-error transition-colors p-1 opacity-60 hover:opacity-100">
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-xs text-outline mt-1 font-label uppercase tracking-widest">Size: {item.size}</p>
                          <p className="font-semibold text-sm mt-2">{item.price}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-outline-variant/50 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-1 hover:text-secondary"><Minus size={12} strokeWidth={2} /></button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-1 hover:text-secondary"><Plus size={12} strokeWidth={2} /></button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-outline-variant/10 p-6 bg-surface/80 backdrop-blur-md">
                <div className="space-y-3 mb-6 font-body text-sm text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-on-surface font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-outline">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <button 
                  onClick={() => { closeCart(); router.push('/cart'); }}
                  className="w-full py-4 bg-on-surface text-surface uppercase font-label tracking-widest text-[10px] font-bold rounded hover:bg-secondary transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

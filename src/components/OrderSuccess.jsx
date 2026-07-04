"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Download, MapPin, Truck } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccess({ orderDetails }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Small delay for confetti to feel natural after checkmark
    const t = setTimeout(() => setShowConfetti(true), 600);
    return () => clearTimeout(t);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
          {/* Simple CSS-based confetti effect could go here, omitting for simplicity to focus on Framer Motion */}
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full bg-surface relative z-10 text-center"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                d="M20 6 9 17l-5-5"
              />
            </motion.svg>
          </motion.div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="font-headline text-4xl md:text-5xl text-on-surface mb-4">
          Order Confirmed
        </motion.h1>
        <motion.p variants={itemVariants} className="text-on-surface-variant text-sm tracking-wide mb-12">
          Thank you for your purchase. We've sent a confirmation email to you.
        </motion.p>

        <motion.div variants={itemVariants} className="bg-surface/50 border border-outline-variant/20 rounded-2xl p-8 mb-12 text-left shadow-sm">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-6 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-outline mb-1">Order Number</p>
              <p className="font-headline text-lg">#{Math.floor(Math.random() * 1000000)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-outline mb-1">Total Paid</p>
              <p className="font-headline text-lg">₹{orderDetails?.total?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <MapPin className="text-outline shrink-0" size={20} strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-2">Delivery Address</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {orderDetails?.shippingAddress?.fullName}<br/>
                  {orderDetails?.shippingAddress?.address}<br/>
                  {orderDetails?.shippingAddress?.city}, {orderDetails?.shippingAddress?.postalCode}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Truck className="text-outline shrink-0" size={20} strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-2">Estimated Delivery</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  3-5 Business Days
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/account?tab=orders" className="px-8 py-4 bg-surface text-on-surface border border-outline-variant/30 text-[10px] uppercase tracking-widest font-bold hover:bg-outline-variant/10 transition-colors rounded">
            Track Order
          </Link>
          <Link href="/" className="px-8 py-4 bg-on-surface text-surface text-[10px] uppercase tracking-widest font-bold hover:bg-secondary transition-colors rounded shadow-lg">
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

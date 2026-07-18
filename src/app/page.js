"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { fetchProducts } from "@/lib/catalog";
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useAppContext } from "@/components/Providers";

export default function Home() {
  const { showToast } = useToast();
  const { openProductModal } = useAppContext();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [heroImages, setHeroImages] = useState({
    desktop: "/assets/hero-saree-new.jpeg",
    mobile: "/assets/hero-saree-mobile.jpeg"
  });

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast("Thank you for subscribing to Azhagii!", "success");
      setNewsletterEmail("");
    }
  };

  useEffect(() => {
    // Pick random images on mount to avoid hydration mismatch
    const desktopImages = ["/assets/hero-saree-new.jpeg", "/assets/hero-saree-desktop-2.jpeg"];
    const mobileImages = ["/assets/hero-saree-mobile.jpeg", "/assets/hero-saree-mobile-2.jpeg"];
    
    setHeroImages({
      desktop: desktopImages[Math.floor(Math.random() * desktopImages.length)],
      mobile: mobileImages[Math.floor(Math.random() * mobileImages.length)]
    });

    async function load() {
      try {
        const allProducts = await fetchProducts();
        setFeatured(Object.entries(allProducts || {}).slice(0, 4));
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-28">
        {/* Hero Section */}
        <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden block md:flex md:items-center">
          <div className="absolute inset-0 z-0">
            <img className="hidden md:block w-full h-full object-cover object-[right_top]" alt="Editorial fashion shot" src={heroImages.desktop} />
            <img className="block md:hidden w-full h-full object-cover object-top" alt="Editorial fashion shot mobile" src={heroImages.mobile} />
            
            {/* Desktop Gradient */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/40 to-transparent"></div>
            
            {/* Mobile Gradient */}
            <div className="block md:hidden absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-surface via-surface/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full h-full pt-10 md:pt-0">
            <div className="max-w-xl pb-10 md:pb-0">
              <div>
                <span className="font-label uppercase tracking-[0.2em] text-[10px] text-primary block mb-6">New Collection</span>
                <h1 className="font-headline italic text-5xl md:text-6xl lg:text-[80px] leading-tight text-on-surface mb-8 tracking-tighter drop-shadow-sm">
                  Elegant Dresses for Every Occasion
                </h1>
                <p className="hidden md:block font-body text-on-surface-variant mb-12 text-lg leading-relaxed drop-shadow-sm">
                  Discover our curated collection of timeless silhouettes designed for the modern aesthetic. Hand-crafted with luxurious, sustainably sourced materials.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 absolute bottom-12 left-6 right-6 md:static md:bottom-auto md:left-auto md:right-auto md:mt-10">
                <Link href="/shop" className="bg-on-surface text-surface px-10 py-4 font-label uppercase tracking-widest text-[10px] hover:bg-secondary transition-all text-center backdrop-blur-sm">
                  Shop Now
                </Link>
                <Link href="/shop?filter=new" className="bg-surface/50 backdrop-blur-md border border-outline-variant px-10 py-4 font-label uppercase tracking-widest text-[10px] text-on-surface hover:bg-surface-container transition-all text-center">
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="py-32 px-6 md:px-12 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <span className="font-label uppercase tracking-[0.2em] text-[10px] text-primary block mb-2">Curated Collections</span>
              <h2 className="font-headline text-4xl text-on-surface">Shop by Silhouette</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {/* Categories */}
              <Link href="/shop?category=Party%20Wear" className="group cursor-pointer block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Party Wear" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnCGnnMPwh3er99OJg1-DpsZU80XSb8oeu0dws-J6rd9LIYY9uFqtMqTxWklE1Ncuajoyj8ynmEz7YYEMaYu6upc0Badk4Wh4HQti0MnK-KWpYoswvdoBvFIaNgPBavo9NEyJ7gzIVNOzb_1x21IB-upbRP3ZR8fH2N6d6aWKZmT_IdMd4Q3ByYSw2IL9d7OAnp0O-NHYFeg4oPNEZ71jRrUO0ofuZdFbmUaN-jMw3Aw1LSiAlRRR8V0dFpFL_Wxr1Li8_yqI--Mc" />
                </div>
                <p className="font-label uppercase tracking-widest text-xs text-center">Party Wear</p>
              </Link>
              <Link href="/shop?category=Casual" className="group cursor-pointer block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Casual" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd-1w7aEIDRkhvZwbjv0x8t-9Cp_-YUFvU3HWlkrmpn04-3HbVO688NFI8LUtEOG1r-UEYmlIEcmQfafI6mSOkQWMZSS3ICJ1FdybGdQZTEk91AS266cm-3d9oVkizFvDg3_Pg4ivPe65ObUN0KIYYtIsYFmiaEqqZ-DvTAKptQz1vLmvu-zB47R230L_6ft2i2lfG2qHzLdCsizKlSQKztT-08AYzOqf8igde507iilCWgSm_KhTteEq0n38BUaKkjuaSdWRcpIw" />
                </div>
                <p className="font-label uppercase tracking-widest text-xs text-center">Casual</p>
              </Link>
              <Link href="/shop?category=Traditional" className="group cursor-pointer block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Traditional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ePhxWw8EEfAuBy61IdbbVYcdWh9zDQjP64n2b8zuzWuICM6VkvmmsN2GjjiBJdI_fl5M0gWo8DR1zKNTM4ZK1HFLsvtEo-YJ4AqGAx74xCAhela6cZ2cc4vJBglgF6mjQu7pubKegcDHRdWhcPhGh1xXND-oRUfsO_qAesjnKGu3Tp1_1dl-oknCazDesfnhG5OKnzR25Xt5mkGXb-TC8QyAsjNxz2vLNfFXN9wdKf9ZUIV__N1MsnIh0h8qr7_s734PI2mW96A" />
                </div>
                <p className="font-label uppercase tracking-widest text-xs text-center">Traditional</p>
              </Link>
              <Link href="/shop?category=Office%20Wear" className="group cursor-pointer block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Office Wear" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQq4hgrh5X-QkLkxHGPYf_qAlC7QoHXJOyNscXNhQXoIR3InLhNKG6gMCRU9-uXOBjU1HxPuzL-8teVguXyvOs4tnab-ZsQLWvArZNxw-gKweRspYdpfc3IVOrdj-00iDX84xvavcPnpX-Wlf6h16oaW9hQ34946N8yU6tVcljjtQSAkiO7foIYTPnlBrxzzp4fzHLzueT8armUy_-eYodewLRO3Q9pkXP_COUOZGPWrzL1MgIA4ipzBSSm_0B7WP0HQHUKUge1gY" />
                </div>
                <p className="font-label uppercase tracking-widest text-xs text-center">Office Wear</p>
              </Link>
              <Link href="/shop?category=Summer%20Collection" className="group cursor-pointer block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-surface-container">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Summer Collection" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAye5qaKu8BtMhw_0_hPkvjWyqzZ-IlVHII64B52q3neS679M_6POMozOcTa6-fwPhT4bCKXQFjRVDn6fhWFaioXlgTwPu4FfGrLFM0sYaTgqxKOSIFexXR63v1foUm9c3Nyj1NYYoFYthhwXTqXlY5DgYe9lwXIV40x61knY8b-P9_zhxvLcazGItPYMkMRARYPe4Ptw67pulHGeZwWzDrbzt7XaaNGSzcjuVM4vzYDSXsEe8XUwhiR-qGxoKGr15yvA1HTAfbeXk" />
                </div>
                <p className="font-label uppercase tracking-widest text-xs text-center">Summer Collection</p>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Best Sellers */}
        <section className="py-24 bg-surface/50">
          <div className="max-w-[1440px] mx-auto px-12">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="font-label uppercase tracking-[0.2em] text-[10px] text-secondary block mb-2">Most Loved</span>
                <h2 className="font-headline text-4xl text-on-surface">Azhagii Icons</h2>
              </div>
              <Link className="font-label uppercase tracking-widest text-xs border-b border-on-surface pb-1 hover:text-secondary hover:border-secondary transition-colors" href="/shop">View All</Link>
            </div>

            <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8 snap-x">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="min-w-[320px] w-[320px] max-w-[320px] snap-start">
                  <ProductSkeleton viewMode="grid" />
                </div>
              ))}
              {!loading && featured.length === 0 && <p className="text-outline text-sm">No products available at the moment. Please check back later!</p>}
              {!loading && featured.map(([id, product]) => (
                <div key={id} className="min-w-[320px] w-[320px] max-w-[320px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Editorial Carousel */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-surface/80">
                <img className="w-full h-full object-cover" alt="High fashion model" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiaIMxHk5tZfC4wsrLdPyau-T2_3G_nbCL3kyrDTLS65Jfs4XDp1cuYCM9w_ypA1RoYBzsOWJQMhi1R0TKPt2AeKfltt_X_4Yf_q6e4On9EHYUMOol3wRoKNepXO1IeZ02xazGlAZrEygl34O2HbxFuXaz_9OxPV3LGmkA5Vn9yLmytmn8RJlBA-gsDduJRsAIF-IeK5vfDYNLG8euFIFogXp_SnbPpnavCb79QQd0ElpNAuKY8LDhD9tx_P-skRLpPXeT7tJ9TYk" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-lg overflow-hidden border-[12px] border-surface shadow-xl hidden lg:block">
                <img className="w-full h-full object-cover" alt="Detail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp1hf3Fs6ykT4g6ixfAf4ZYXGo4qDfdQIQt6536s8Zsln0r_mOi625Jy3r2IDGRUmQrbnILXad2fIYUDU39MYPVOlrWLldUsOxtxBQ2sJ8tBB73cunGqpT5ddkhzMf-OPQUn8baqzHhiXyiPoBUhy9BbZdRgxFiX2OxAz8dDN8EcpahQWCcOhbjG9LVjOXkkKDBd7zbIOg2Jn4re_XeU273IC_IIrd8yeDmo46z5__PPszp_gMxMtJcq6Rs-nmKQkgiKqJvQWeJfc" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="font-label uppercase tracking-[0.2em] text-[10px] text-primary block mb-4">Just Arrived</span>
              <h2 className="font-headline text-5xl text-on-surface mb-8 leading-tight">Spring Summer '24: The Ethereal Light</h2>
              <p className="font-body text-lg text-on-surface-variant mb-10 leading-relaxed max-w-lg">
                Explore our newest collection inspired by the soft play of light and shadow in Mediterranean landscapes. Featuring organic linens, translucent silks, and sculptural silhouettes.
              </p>
              <button className="font-label uppercase tracking-widest text-xs px-12 py-5 border border-on-surface hover:bg-on-surface hover:text-surface transition-all">
                Discover the Collection
              </button>
            </div>
          </div>
        </motion.section>

        {/* Instagram Gallery */}
        <section className="py-24 border-t border-on-surface/5">
          <div className="max-w-7xl mx-auto px-12">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl mb-2">Seen on You</h2>
              <p className="font-label text-xs uppercase tracking-widest text-primary">Tag us @azhagii</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square bg-surface/80 overflow-hidden">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt="Instagram 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbo0DTYOoHWK3dL9bJgemdVToZjl6K1g5BMduCf1PLp4LhiBTN2YqFv_jRtaDGxujQvqLcS7ukN3uG-b5e1EaUkwtjq-RqwqPjfy3ILdwAv4L_evbVlrOrGpibCAyATvKifMl9PJjcQcDLWLL-vORkNzGl6jxEkjSyiVZI-gUqnNc_mxuHatoJ4ZhWB5KRMXy_eRYGBF5UW_F0gdz2Nbzqs9pcHIlxa8uiZjoshV9xXIxIetAqMc4YZct2wlPfXg8i15_JEtA8yEg" />
              </div>
              <div className="aspect-square bg-surface/80 overflow-hidden">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt="Instagram 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESrXoyhuYKqkiiIG4mL1mc2CserCSOorh7JLU7R-NAmnWn8cX3YxY12VeUL9yV8HX8StpLok8hir13uY4qqWdfgfUlZ3lb1fiaYkPr7JLBn_etupPKcuw0KLF9qxs1EyLTmScMyA0SIDPOsjk1pcg-J0uG8P0lqe8saURwDghi_-kzp1f18o_ROercI5nnciku-_AbdI5jSLRpAMFGNSb__GY_g7xaLa6UEma6p06kwzHGPD2kOywaxFrQtDiRdtxs5O4GdQLaeY" />
              </div>
              <div className="aspect-square bg-surface/80 overflow-hidden">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt="Instagram 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeEotB2c0ozX7YcnTamVpjpJ_JsgOPk3keTIWDJqI1fOphIZ6Yw9wmwkpnlu_sgTvUpk1sY7N_yVciHqsDzOgoDq7BTQq_RAlfNaHiMYSoj-lstUJZNgK6T3r3_sSGB4EQBkw6UosDNFfpXHzVXksRUdKDkvdWmKau58vyj9YMOniW7xuNfGwg3X7tu7MNpJoww3SWK0iPlze_HLNtH5FjyHtYgxKoWTz5xMFUs5zrogZSh8WqPp_di79u_0xQAMtJsTy0vTrp7pE" />
              </div>
              <div className="aspect-square bg-surface/80 overflow-hidden">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt="Instagram 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1_NC-U-ym_zKyFK1n4G_B3f7u_yeivtiY5g41JLjJzLiwXHrsGwWnREJ04e-D1AOP2YmcQL3geRu4cANTTeB3RA51zudZeL_n-zwRD-4Q6j65arzvtql55qvo6-uxMggKQ1zzXVCoENdXpvnqbgpHr6SLh_oDb8_XPZ-7jpFGXsbg3mntbemvlPfcKZSm_tswk9E2xDKBrLdDTU_e7K4Sgs073Ij_seKW7kAUhR-Ifovlq6xyBctO-kDRB2mSUtx24zjaxsgIvwA" />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-tertiary-fixed text-on-tertiary-fixed">
          <div className="max-w-xl mx-auto text-center px-6">
            <h2 className="font-headline text-3xl mb-4">Join the Azhagii</h2>
            <p className="font-body text-sm mb-8 opacity-80">Receive curated styling advice, early access to new collections, and invitations to exclusive events.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-on-tertiary-fixed/30 py-3 px-0 focus:ring-0 focus:border-on-tertiary-fixed font-label text-sm placeholder:text-on-tertiary-fixed/50" 
                placeholder="Your Email Address" 
                type="email" 
              />
              <button type="submit" className="font-label uppercase tracking-widest text-[10px] bg-on-tertiary-fixed text-tertiary-fixed px-8 py-3 hover:opacity-90 transition-opacity">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

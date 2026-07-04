import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }} 
      transition={{ duration: 1 }}
      className="bg-surface w-full pt-32 pb-12 px-6 md:px-12 border-t border-outline-variant/10 font-label text-sm tracking-wide text-on-surface"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 max-w-[1440px] mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="font-headline italic text-3xl mb-6 block tracking-tighter">AZHAGII</span>
          <p className="text-on-surface-variant font-label text-xs tracking-wide leading-relaxed mb-8 max-w-xs">
            Redefining modern elegance through mindful design and premium craftsmanship.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">IG</Link>
            <Link href="#" className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">X</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] mb-8 text-outline">Collections</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link className="hover:text-secondary transition-colors" href="/shop">New Arrivals</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Best Sellers</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">The Archive</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Sustainability</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] mb-8 text-outline">Client Care</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Shipping & Returns</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Size Guide</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Contact Us</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] mb-8 text-outline">Legal</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Privacy Policy</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Terms of Service</Link></li>
            <li><Link className="hover:text-secondary transition-colors" href="/shop">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-[9px] font-bold tracking-[0.25em] uppercase text-outline">
        <span>© 2024 AZHAGII. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
          <span>NEW YORK</span>
          <span>PARIS</span>
          <span>LONDON</span>
        </div>
      </div>
    </motion.footer>
  );
}

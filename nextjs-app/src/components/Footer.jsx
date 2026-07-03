import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#fbf9f7] dark:bg-[#1a1c1b] w-full pt-20 pb-10 px-12 border-t border-[#303331]/5 font-['Manrope'] text-sm tracking-wide text-[#303331] dark:text-[#fbf9f7]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="font-['Noto_Serif'] text-xl mb-4 block">AZHAGII</span>
          <p className="text-[#5f5e5e] dark:text-[#7e572e] leading-relaxed mb-6">Redefining modern elegance through mindful design and premium craftsmanship.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer">social_leaderboard</span>
            <span className="material-symbols-outlined text-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer">image</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold uppercase text-xs tracking-widest mb-6">Collections</h4>
          <ul className="space-y-4 text-[#5f5e5e] dark:text-[#7e572e]">
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">New Arrivals</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Best Sellers</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">The Archive</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Sustainability</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold uppercase text-xs tracking-widest mb-6">Client Care</h4>
          <ul className="space-y-4 text-[#5f5e5e] dark:text-[#7e572e]">
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Shipping & Returns</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Size Guide</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Contact Us</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold uppercase text-xs tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4 text-[#5f5e5e] dark:text-[#7e572e]">
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Privacy Policy</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Terms of Service</Link></li>
            <li><Link className="hover:text-[#303331] dark:hover:text-white transition-all" href="/shop">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-on-surface/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-[10px] tracking-[0.2em] uppercase">
        <span>© 2024 AZHAGII. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
          <span>NEW YORK</span>
          <span>PARIS</span>
          <span>LONDON</span>
        </div>
      </div>
    </footer>
  );
}

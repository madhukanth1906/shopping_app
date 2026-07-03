import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#fbf9f7]/70 dark:bg-[#303331]/70 backdrop-blur-md fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center max-w-[1920px] mx-auto transition-all duration-300">
      <div className="flex items-center gap-12">
        <Link href="/" className="font-['Noto_Serif'] italic text-2xl tracking-tighter text-[#303331] dark:text-[#fbf9f7]">AZHAGII</Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop">New Arrivals</Link>
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop">Shop</Link>
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop">Collections</Link>
          <Link className="font-['Manrope'] uppercase tracking-[0.1em] text-xs text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/shop">Editorial</Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/account"><span className="material-symbols-outlined text-xl cursor-pointer hover:text-secondary transition-colors text-on-surface">person</span></Link>
        <Link href="/shop"><span className="material-symbols-outlined text-xl cursor-pointer hover:text-secondary transition-colors text-on-surface">favorite</span></Link>
        <div className="relative group cursor-pointer">
          <Link href="/cart"><span className="material-symbols-outlined text-xl hover:text-secondary transition-colors text-on-surface">shopping_bag</span></Link>
        </div>
      </div>
    </nav>
  );
}

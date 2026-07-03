"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser, loginWithGoogle, logout } from "@/lib/auth";
import Link from "next/link";

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const u = await getUser();
        setUser(u);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert('Failed to login with Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-6 md:px-12 flex justify-center">
            <p className="text-outline text-sm">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col gap-12 flex-grow w-full">
        {!user ? (
          /* Login View */
          <div className="w-full flex flex-col items-center justify-center flex-grow text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-['Noto_Serif'] italic tracking-tight text-on-surface">Sign In</h1>
            <p className="text-on-surface-variant font-['Manrope'] text-sm tracking-wide max-w-md mx-auto">
              Access your curated wishlist, track orders, and manage your preferred shipping details.
            </p>
            <button 
              onClick={handleLogin}
              className="flex items-center gap-3 bg-surface-container-low border border-outline/30 px-6 py-3 rounded-full hover:bg-surface-container-high transition-colors text-sm font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          /* Dashboard View */
          <div className="w-full flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex flex-col gap-8">
              <div className="space-y-1">
                <h2 className="font-['Manrope'] uppercase tracking-[0.15em] text-[10px] text-outline mb-6">Account Menu</h2>
                <nav className="flex flex-col gap-2">
                  <Link className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-semibold transition-all" href="/account">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-sm">Dashboard</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-lg transition-all" href="/account">
                    <span className="material-symbols-outlined">history</span>
                    <span className="text-sm">Order History</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-lg transition-all" href="/shop">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="text-sm">Wishlist</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-lg transition-all" href="/account">
                    <span className="material-symbols-outlined">location_on</span>
                    <span className="text-sm">Saved Addresses</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-lg transition-all" href="/account">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                  {user?.email === 'madhu9940984501@gmail.com' && (
                    <Link className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-secondary-container/30 rounded-lg font-bold transition-all mt-4 border border-secondary/30" href="/admin">
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                      <span className="text-sm">Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-all w-full text-left mt-4 border border-error/20"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm">Sign Out</span>
                  </button>
                </nav>
              </div>
              <div className="mt-auto p-6 bg-surface-container-low rounded-xl">
                <p className="text-xs text-outline mb-2">Need assistance?</p>
                <Link className="text-sm font-semibold underline decoration-primary/30 hover:decoration-primary" href="/account">Contact Concierge</Link>
              </div>
            </aside>

            {/* Canvas Area */}
            <section className="flex-1 flex flex-col gap-12">
              {/* Welcome Header */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-['Noto_Serif'] italic tracking-tight text-on-surface">Welcome back, <span className="font-normal not-italic">{user.name || 'User'}</span></h1>
                <p className="text-on-surface-variant font-['Manrope'] text-sm tracking-wide">{user.email}</p>
              </div>

              {/* Recent Orders (List View) */}
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                  <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Recent Orders</h3>
                  <Link className="text-xs text-secondary font-semibold hover:underline" href="/account">View All</Link>
                </div>
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-outline bg-surface-container-low/50">
                          <th className="px-6 py-4 font-medium">Order ID</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        <tr className="text-sm hover:bg-surface-container-low/20 transition-colors">
                          <td className="px-6 py-5 font-['Noto_Serif'] font-bold">#AT-82910</td>
                          <td className="px-6 py-5 text-on-surface-variant">March 14, 2024</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">IN TRANSIT</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-xs font-bold uppercase tracking-tighter text-on-surface border-b border-on-surface/20 hover:border-on-surface pb-0.5 transition-all">Track Order</button>
                          </td>
                        </tr>
                        <tr className="text-sm hover:bg-surface-container-low/20 transition-colors">
                          <td className="px-6 py-5 font-['Noto_Serif'] font-bold">#AT-71022</td>
                          <td className="px-6 py-5 text-on-surface-variant">February 28, 2024</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">DELIVERED</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-xs font-bold uppercase tracking-tighter text-on-surface border-b border-on-surface/20 hover:border-on-surface pb-0.5 transition-all">Details</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Wishlist (Bento/Grid View) */}
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                  <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Curated Wishlist</h3>
                  <span className="text-[10px] text-outline">2 ITEMS SAVED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Wishlist Item 1 */}
                  <div className="group relative flex flex-col gap-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low">
                      <img alt="Silk midi dress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCACuYMWFMTQkWnwJ0u2UTRyWPAoM8wrZU0fe64f2jwts1WSm25InZ9LP8YPh4ggqTFMgVHlnsb8z-SM2Ve1sIEciaDvMX5YZ-I2IqxyUgW6oHgEED9z4O_NxGdn-EXqY3696kVALsVfczC7bvGTVes5hWMIFCapRjwUXArjYlcFCITU9VKz6ocglaXquspZQCt7FFc8HW2plwdQJetVgeGvyk8ZpPYYXK4_ebgpwtAnPBnjo8oSLmiSlM800Lx2cZY0UxIKy6CGMI" />
                      <button className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-on-surface hover:bg-on-surface hover:text-surface transition-all">
                        <Link href="/shop"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span></Link>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-['Manrope'] uppercase text-[10px] tracking-[0.15em] text-outline">Signature Collection</h4>
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold">Azhagiii Silk Slip</p>
                        <p className="font-['Noto_Serif'] text-sm italic">₹420</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Wishlist Item 2 */}
                  <div className="group relative flex flex-col gap-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low">
                      <img alt="Leather bucket bag" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBm2x5mhMKwjdQ91iQsCqvoq0C8OZVoIrnf_bUtXP-_LLOrwKkD2t112ma5_PzBSEhKkL-FNdUO8fZa294KP9qxfWy6CdFDNucm0ElxQq65y7137raE6eaVZ5B9gIRiJetIXNfh1LGuRtxpeqYdrWsy-O9vIq3XRRJAUc83Q71AL8m3ucddDSgn-izzoHFhrzKTOY4rKp9ZuRoH3Bvax_7ohhz6PH3XBLLZQ5LR7U_w-jqssUhoJi4_Aj2RPknHTdt3mI7CP7Cw6s" />
                      <button className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-on-surface hover:bg-on-surface hover:text-surface transition-all">
                        <Link href="/shop"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span></Link>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-['Manrope'] uppercase text-[10px] tracking-[0.15em] text-outline">Accessories</h4>
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold">Sculptural Leather Tote</p>
                        <p className="font-['Noto_Serif'] text-sm italic">₹890</p>
                      </div>
                    </div>
                  </div>

                  {/* Empty slot style */}
                  <div className="group relative flex flex-col gap-4">
                    <div className="aspect-[4/5] rounded-lg bg-[#7e572e]/5 border border-dashed border-[#7e572e]/20 flex flex-col items-center justify-center p-8 text-center gap-4">
                      <span className="material-symbols-outlined text-4xl text-[#7e572e]/40">add_circle</span>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#7e572e]">Add to Moodboard</p>
                        <p className="text-[11px] text-outline-variant max-w-[140px]">Keep exploring to find your next statement piece.</p>
                      </div>
                      <Link href="/shop" className="mt-2 text-[10px] uppercase tracking-widest font-bold border-b border-on-surface/10 hover:border-on-surface transition-all">Shop Collections</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-8 bg-surface-container-low rounded-xl space-y-4">
                  <h3 className="font-['Manrope'] uppercase tracking-widest text-[10px] font-bold text-outline">Preferred Shipping</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">240 Central Park West, Apt 4C<br/>New York, NY 10024</p>
                  </div>
                  <button className="text-xs font-bold border-b border-outline-variant hover:border-on-surface transition-all py-1">Edit Address</button>
                </div>
                <div className="p-8 bg-surface-container-low rounded-xl space-y-4">
                  <h3 className="font-['Manrope'] uppercase tracking-widest text-[10px] font-bold text-outline">Payment Method</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-on-surface rounded flex items-center justify-center">
                      <span className="text-[8px] text-surface font-bold">VISA</span>
                    </div>
                    <p className="text-sm font-semibold">Ending in •••• 4421</p>
                  </div>
                  <button className="text-xs font-bold border-b border-outline-variant hover:border-on-surface transition-all py-1">Manage Cards</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

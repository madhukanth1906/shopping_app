"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser, loginWithGoogle, logout } from "@/lib/auth";
import { fetchUserOrders } from "@/lib/catalog";
import { account } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { ID } from "appwrite";

export default function Account() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [newAddress, setNewAddress] = useState({ fullName: '', address: '', city: '', postalCode: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const w = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
        setWishlist(w);
        
        const u = await getUser();
        setUser(u);
        if (u) {
            const userOrders = await fetchUserOrders(u.$id);
            setOrders(userOrders);

            const prefs = await account.getPrefs();
            if (prefs.addresses) {
              setAddresses(JSON.parse(prefs.addresses));
            }
        }
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
    } catch (err) {
      console.error(err);
      showToast('Failed to login with Google.', 'error');
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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const addrWithId = { ...newAddress, id: ID.unique() };
      const updatedAddresses = [...addresses, addrWithId];
      await account.updatePrefs({ addresses: JSON.stringify(updatedAddresses) });
      setAddresses(updatedAddresses);
      setNewAddress({ fullName: '', address: '', city: '', postalCode: '' });
      setIsAddingAddress(false);
      showToast('Address saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const updatedAddresses = addresses.filter(a => a.id !== id);
      await account.updatePrefs({ addresses: JSON.stringify(updatedAddresses) });
      setAddresses(updatedAddresses);
      showToast('Address deleted.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete address.', 'error');
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

  const renderOrderTable = (orderList) => (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-outline bg-surface-container-low/50">
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {orderList.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-5 text-sm text-outline">No orders found.</td></tr>
            ) : (
              orderList.map(order => {
                  const date = new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  let statusColor = 'bg-surface-container-high text-on-surface-variant';
                  if (order.status === 'Shipped') statusColor = 'bg-secondary-container text-on-secondary-container';
                  if (order.status === 'Cancelled') statusColor = 'bg-error-container/20 text-error';

                  return (
                    <tr key={order.$id} className="text-sm hover:bg-surface-container-low/20 transition-colors">
                      <td className="px-6 py-5 font-['Noto_Serif'] font-bold uppercase tracking-tighter">#{order.$id.slice(-6)}</td>
                      <td className="px-6 py-5 text-on-surface-variant">{date}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-5 text-right font-semibold">₹{order.total.toFixed(2)}</td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col gap-12 flex-grow w-full">
        {!user ? (
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
          <div className="w-full flex flex-col md:flex-row gap-12">
            
            <aside className="w-full md:w-64 flex flex-col gap-8 shrink-0">
              <div className="space-y-1">
                <h2 className="font-['Manrope'] uppercase tracking-[0.15em] text-[10px] text-outline mb-6">Account Menu</h2>
                <nav className="flex flex-col gap-2">
                  <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-sm">Dashboard</span>
                  </button>
                  <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'history' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined">history</span>
                    <span className="text-sm">Order History</span>
                  </button>
                  <button onClick={() => setActiveTab('addresses')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'addresses' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined">location_on</span>
                    <span className="text-sm">Saved Addresses</span>
                  </button>
                  <Link className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low rounded-lg transition-all" href="/shop">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="text-sm">Wishlist</span>
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
            </aside>

            <section className="flex-1 flex flex-col gap-12">
              <div className="space-y-2 border-b border-outline-variant/10 pb-6">
                <h1 className="text-4xl md:text-5xl font-['Noto_Serif'] italic tracking-tight text-on-surface">Welcome back, <span className="font-normal not-italic">{user.name || 'User'}</span></h1>
                <p className="text-on-surface-variant font-['Manrope'] text-sm tracking-wide">{user.email}</p>
              </div>

              {activeTab === 'dashboard' && (
                <>
                  {/* Recent Orders (Last 3) */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                      <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Recent Orders</h3>
                      <button onClick={() => setActiveTab('history')} className="text-xs text-secondary font-semibold hover:underline">View All</button>
                    </div>
                    {renderOrderTable(orders.slice(0, 3))}
                  </div>

                  {/* Wishlist */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                      <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Curated Wishlist</h3>
                      <span className="text-[10px] text-outline">{wishlist.length} ITEMS SAVED</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {wishlist.map(item => (
                        <div key={item.id} className="group relative flex flex-col gap-4">
                          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low relative">
                            <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.image} />
                            <button 
                              onClick={() => {
                                const newWishlist = wishlist.filter(w => w.id !== item.id);
                                setWishlist(newWishlist);
                                localStorage.setItem('atelier_wishlist', JSON.stringify(newWishlist));
                              }}
                              className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-on-surface hover:bg-error hover:text-surface transition-all z-10"
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                            </button>
                            <Link href={`/product/${item.id}`} className="absolute inset-0 z-0"></Link>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-['Manrope'] uppercase text-[10px] tracking-[0.15em] text-outline">Saved Item</h4>
                            <div className="flex justify-between items-baseline">
                              <p className="text-sm font-semibold">{item.name}</p>
                              <p className="font-['Noto_Serif'] text-sm italic">{item.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty slot style */}
                      <div className="group relative flex flex-col gap-4">
                        <div className="aspect-[4/5] rounded-lg bg-[#7e572e]/5 border border-dashed border-[#7e572e]/20 flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-[#7e572e]/10 transition-colors cursor-pointer">
                          <Link href="/shop" className="absolute inset-0"></Link>
                          <span className="material-symbols-outlined text-4xl text-[#7e572e]/40">add_circle</span>
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#7e572e]">Add to Moodboard</p>
                            <p className="text-[11px] text-outline-variant max-w-[140px]">Keep exploring to find your next statement piece.</p>
                          </div>
                          <span className="mt-2 text-[10px] uppercase tracking-widest font-bold border-b border-on-surface/10 group-hover:border-on-surface transition-all">Shop Collections</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                    <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Complete Order History</h3>
                    <span className="text-[10px] text-outline">{orders.length} TOTAL ORDERS</span>
                  </div>
                  {renderOrderTable(orders)}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                    <h3 className="font-['Manrope'] uppercase tracking-widest text-xs font-bold text-on-surface">Saved Addresses</h3>
                    <button onClick={() => setIsAddingAddress(true)} className="text-xs text-on-surface bg-secondary/10 px-4 py-2 rounded-full font-semibold hover:bg-secondary/20 transition">Add New Address</button>
                  </div>
                  
                  {isAddingAddress && (
                    <form onSubmit={handleSaveAddress} className="bg-surface-container-lowest p-6 rounded-xl space-y-4 mb-6 border border-outline-variant/20">
                      <h4 className="font-bold text-sm mb-4">Add a New Shipping Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full bg-surface-container border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                        <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-surface-container border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                        <input required placeholder="Address Line" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full md:col-span-2 bg-surface-container border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                        <input required placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full bg-surface-container border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-2 rounded font-bold text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded font-bold text-xs uppercase tracking-widest bg-on-surface text-surface hover:bg-secondary transition">Save Address</button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.length === 0 && !isAddingAddress && (
                      <p className="text-sm text-outline col-span-2">No saved addresses yet.</p>
                    )}
                    {addresses.map((addr, idx) => (
                      <div key={addr.id || idx} className="p-8 bg-surface-container-low rounded-xl relative group">
                        <div className="space-y-1 pr-8">
                          <p className="text-sm font-semibold">{addr.fullName}</p>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{addr.address}<br/>{addr.city}, {addr.postalCode}</p>
                        </div>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-4 right-4 p-2 text-error/50 hover:bg-error-container hover:text-error rounded-full transition-all">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

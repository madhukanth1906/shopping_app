"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser, loginWithGoogle, logout } from "@/lib/auth";
import { fetchUserOrders, cancelOrder, fetchProducts } from "@/lib/catalog";
import { account } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { LayoutDashboard, History, MapPin, Heart, ShieldCheck, LogOut, PlusCircle, Trash2, X, ChevronRight, Settings, UserCircle, Bell, ArrowRight, Plus, Truck, PackageCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ID } from "appwrite";

export default function Account() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedWishlist, setSelectedWishlist] = useState(new Set());
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState({});
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [preferredSize, setPreferredSize] = useState("");
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Profile update state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    // Check URL for tab param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  const [newAddress, setNewAddress] = useState({ fullName: '', address: '', city: '', postalCode: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const postalCode = data.address.postcode || "";
            const street = data.address.road || "";
            const house = data.address.house_number ? data.address.house_number + ", " : "";
            const fullAddress = house + street + (data.address.suburb ? ", " + data.address.suburb : "");
            
            setNewAddress(prev => ({
              ...prev,
              address: fullAddress || data.display_name,
              city: city,
              postalCode: postalCode
            }));
            showToast("Location fetched successfully!", "success");
          } else {
            showToast("Could not determine address from location.", "error");
          }
        } catch (error) {
          showToast("Failed to fetch address details.", "error");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        showToast("Location permission denied or unavailable.", "error");
      }
    );
  };

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const w = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
        setWishlist(w);
        
        const productsData = await fetchProducts();
        setCatalog(productsData || {});
        
        const u = await getUser();
        setUser(u);
        if (u) {
            setProfileName(u.name || '');
            setProfilePhone(u.phone || '');
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
        if (profileName !== user.name) {
            await account.updateName(profileName);
        }
        if (profilePhone !== user.phone) {
            // Appwrite requires phone numbers in international format e.g., +123456789
            await account.updatePhone(profilePhone, 'password123'); // Often requires password, might fail without proper auth setup in appwrite. 
            // We will just try updating prefs instead for extra info to be safe and avoiding strict phone auth blocks.
        }
        
        const u = await getUser();
        setUser(u);
        showToast('Profile updated successfully!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Failed to update profile.', 'error');
    } finally {
        setIsUpdatingProfile(false);
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

  const toggleWishlistSelection = (id) => {
    const liveProduct = catalog[id];
    const isOutOfStock = liveProduct && (
      liveProduct.category === 'Fashion Dress'
        ? Object.entries(liveProduct.inventory || {}).filter(([_, q]) => q > 0).length === 0
        : Object.values(liveProduct.inventory || {}).reduce((a, b) => a + b, 0) === 0
    );
    
    if (isOutOfStock) {
      showToast('This item is out of stock and cannot be added to bag.', 'error');
      return;
    }

    const newSelection = new Set(selectedWishlist);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedWishlist(newSelection);
  };

  const handleAddSelectedToCart = () => {
    const cart = JSON.parse(localStorage.getItem('atelier_cart') || '[]');
    let addedCount = 0;
    
    selectedWishlist.forEach(id => {
      const item = wishlist.find(w => w.id === id);
      if (item) {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            size: item.inventory ? Object.keys(item.inventory)[0] : 'One Size'
          });
        }
        addedCount++;
      }
    });

    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setSelectedWishlist(new Set());
    showToast(`Added ${addedCount} item(s) to shopping bag!`, 'success');
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

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason) return;
    setIsCancelling(true);
    try {
      const shippingAddress = JSON.parse(orderToCancel.shippingAddress || '{}');
      const isOnline = shippingAddress.paymentMethod === 'Online Payment';
      const newStatus = isOnline ? 'Refund Requested' : 'Cancelled';
      
      const updatedShipping = JSON.stringify({
        ...shippingAddress,
        cancelReason: cancelReason
      });

      await cancelOrder(orderToCancel.$id, newStatus, updatedShipping);
      showToast(`Order ${isOnline ? 'refund requested' : 'cancelled'}.`, 'success');
      
      // Refresh orders
      const userOrders = await fetchUserOrders(user.$id);
      setOrders(userOrders);
      
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel order.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-6 md:px-12 flex justify-center">
            <p className="text-outline text-sm uppercase tracking-widest font-label">Loading Dashboard...</p>
  
        

      </main>
        <Footer />
      </div>
    );
  }

  const renderOrderTable = (orderList) => (
    <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-outline bg-surface-container-lowest border-b border-outline-variant/10">
              <th className="px-6 py-5 font-bold">Order ID</th>
              <th className="px-6 py-5 font-bold">Date</th>
              <th className="px-6 py-5 font-bold">Status</th>
              <th className="px-6 py-5 font-bold text-right">Total</th>
              <th className="px-6 py-5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {orderList.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-sm text-center text-outline">No orders found.</td></tr>
            ) : (
              orderList.map(order => {
                  const date = new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  let statusColor = 'bg-surface-container-high text-on-surface-variant';
                  if (order.status === 'Shipped') statusColor = 'bg-secondary/10 text-secondary border border-secondary/20';
                  if (order.status === 'Cancelled') statusColor = 'bg-error/10 text-error border border-error/20';

                  return (
                    <tr key={order.$id} className="text-sm hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-6 font-['Noto_Serif'] font-bold uppercase tracking-tighter">#{order.$id.slice(-6)}</td>
                      <td className="px-6 py-6 text-on-surface-variant">{date}</td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{order.status}</span>
                        {(order.status === 'Cancelled' || order.status === 'Refund Requested') && (() => {
                          const addr = JSON.parse(order.shippingAddress || '{}');
                          if (addr.adminCancelReason) {
                            return <p className="text-[10px] text-error mt-2 italic max-w-xs leading-relaxed font-bold">Admin Note: {addr.adminCancelReason}</p>;
                          }
                          if (addr.cancelReason) {
                            return <p className="text-[10px] text-on-surface-variant mt-2 italic max-w-xs leading-relaxed">Your Reason: {addr.cancelReason}</p>;
                          }
                          return null;
                        })()}
                      </td>
                      <td className="px-6 py-6 text-right font-semibold">₹{order.total.toFixed(2)}</td>
                      <td className="px-6 py-6 text-right">
                        {(order.status === 'Pending' || order.status === 'Processing') && (
                          <button 
                            onClick={() => { setOrderToCancel(order); setIsCancelModalOpen(true); }}
                            className="text-[10px] font-bold uppercase tracking-widest text-error hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TABS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'Orders', icon: History },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile Settings', icon: Settings },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-body">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col gap-12 flex-grow w-full">
        {!user ? (
          <div className="w-full flex flex-col items-center justify-center flex-grow text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-headline tracking-tight text-on-surface">Welcome to <span className="italic">Azhagii</span></h1>
            <p className="text-on-surface-variant font-label text-sm tracking-widest uppercase max-w-md mx-auto">
              Access your curated wishlist, track orders, and manage your preferred shipping details.
            </p>
            <button 
              onClick={handleLogin}
              className="group flex items-center gap-4 bg-surface border border-outline-variant/20 shadow-sm px-8 py-4 rounded-full hover:shadow-md hover:border-outline-variant/40 transition-all text-sm font-bold uppercase tracking-widest text-on-surface"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
            
            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col gap-10 shrink-0 sticky top-32 h-fit">
              {/* User Summary */}
              <div className="flex items-center gap-4 pb-10 border-b border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <UserCircle size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-sm truncate w-40">{user.name || 'Valued Member'}</p>
                  <p className="text-[10px] uppercase tracking-widest text-outline">Azhagii Member</p>
                </div>
              </div>

              <div className="space-y-2">
                <nav className="flex flex-col gap-1">
                  {TABS.map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${activeTab === tab.id ? 'bg-surface text-on-surface shadow-sm border border-outline-variant/10' : 'text-outline hover:text-on-surface hover:bg-surface/50'}`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <tab.icon size={18} strokeWidth={1.5} className={activeTab === tab.id ? 'text-secondary' : ''} />
                        <span className="text-sm font-semibold">{tab.label}</span>
                      </div>
                      {activeTab === tab.id && (
                         <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-full" />
                      )}
                    </button>
                  ))}
                  
                  {user?.email === 'madhu9940984501@gmail.com' && (
                    <div className="pt-6 mt-6 border-t border-outline-variant/10">
                      <Link className="flex items-center gap-4 px-4 py-3 text-on-surface hover:bg-surface/50 rounded-xl transition-all font-semibold" href="/admin">
                        <ShieldCheck size={18} strokeWidth={1.5} className="text-secondary" />
                        <span className="text-sm">Admin Portal</span>
                      </Link>
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t border-outline-variant/10">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-4 px-4 py-3 text-error hover:bg-error/5 rounded-xl transition-all w-full text-left font-semibold"
                    >
                      <LogOut size={18} strokeWidth={1.5} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Mobile Tab Bar (Horizontal Scroll) */}
            <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 pb-4 -mx-6 px-6 border-b border-outline-variant/10 sticky top-[80px] bg-[#FAFAFA] z-40">
              {TABS.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-on-surface text-surface' : 'bg-surface border border-outline-variant/20 text-on-surface-variant'}`}
                >
                  <tab.icon size={14} strokeWidth={2} />
                  <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
              {user?.email === 'madhu9940984501@gmail.com' && (
                <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 whitespace-nowrap">
                  <ShieldCheck size={14} strokeWidth={2} />
                  <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
                </Link>
              )}
            </div>

            {/* Dynamic Content Panel */}
            <section className="flex-1 w-full min-h-[60vh]">
              <AnimatePresence mode="wait">
                
                {/* Overview Tab */}
                {activeTab === "dashboard" && (
                  <motion.div key="dashboard" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{duration:0.4, ease: [0.16, 1, 0.3, 1]}} className="space-y-12">
                    <div className="space-y-2">
                      <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-on-surface mb-2">Overview</h1>
                      <p className="text-on-surface-variant text-sm">Manage your profile, track your orders, and explore your curated wishlist.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-12">
                          <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                            <History size={24} strokeWidth={1.5} />
                          </div>
                          <button onClick={() => setActiveTab('history')} className="w-8 h-8 rounded-full border border-outline-variant/20 flex items-center justify-center group-hover:bg-on-surface group-hover:text-surface transition-colors">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div>
                          <p className="text-3xl font-headline mb-1">{orders.length}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Total Orders</p>
                        </div>
                      </div>

                      <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-12">
                          <div className="p-3 bg-[#7e572e]/10 text-[#7e572e] rounded-xl">
                            <Heart size={24} strokeWidth={1.5} />
                          </div>
                          <button onClick={() => setActiveTab('wishlist')} className="w-8 h-8 rounded-full border border-outline-variant/20 flex items-center justify-center group-hover:bg-on-surface group-hover:text-surface transition-colors">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div>
                          <p className="text-3xl font-headline mb-1">{wishlist.length}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Wishlist Items</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders (Last 3) */}
                    {orders.length > 0 && (
                      <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
                          <h3 className="font-headline text-2xl text-on-surface">Recent Orders</h3>
                          <button onClick={() => setActiveTab('history')} className="text-xs text-on-surface font-bold uppercase tracking-widest hover:text-secondary transition-colors">View All</button>
                        </div>
                        {renderOrderTable(orders.slice(0, 3))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div key="profile" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{duration:0.4, ease: [0.16, 1, 0.3, 1]}} className="space-y-12">
                    <div className="space-y-2 border-b border-outline-variant/10 pb-6">
                      <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-on-surface mb-2">Profile Settings</h1>
                      <p className="text-on-surface-variant text-sm">Update your personal information and preferences.</p>
                    </div>

                    <div className="bg-surface rounded-2xl border border-outline-variant/10 shadow-sm p-8 max-w-2xl">
                      <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Email Address</label>
                            <input disabled value={user?.email || ''} className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-lg px-5 py-4 text-sm text-outline cursor-not-allowed focus:outline-none" />
                            <p className="text-[10px] mt-2 text-outline">Email address cannot be changed.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Full Name</label>
                            <input required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                          </div>
                          {/*<div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Phone Number</label>
                            <input placeholder="+1234567890" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                          </div>*/}
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                          <button type="submit" disabled={isUpdatingProfile} className="bg-on-surface text-surface px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
                            {isUpdatingProfile ? 'Saving Changes...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <motion.div key="wishlist" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{duration:0.4, ease: [0.16, 1, 0.3, 1]}} className="space-y-12">
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-on-surface mb-2">Wishlist</h1>
                        <p className="text-on-surface-variant text-sm">Your personally curated collection of favorites.</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {selectedWishlist.size > 0 && (
                          <button 
                            onClick={handleAddSelectedToCart}
                            className="text-[10px] font-bold uppercase tracking-widest bg-on-surface text-surface px-6 py-3 rounded-full hover:bg-secondary hover:shadow-md transition-all shadow-sm"
                          >
                            Add {selectedWishlist.size} to Bag
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {wishlist.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-6 bg-surface rounded-2xl border border-outline-variant/10 border-dashed">
                          <Heart size={48} strokeWidth={1} className="text-outline-variant" />
                          <div>
                            <p className="font-headline text-2xl mb-2">Your wishlist is empty</p>
                            <p className="text-sm text-outline">Save items you love to build your dream wardrobe.</p>
                          </div>
                          <Link href="/shop" className="bg-on-surface text-surface px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">
                            Discover Pieces
                          </Link>
                        </div>
                      )}
                      
                      {wishlist.map(item => {
                        const liveProduct = catalog[item.id];
                        const isOutOfStock = liveProduct && (
                          liveProduct.category === 'Fashion Dress'
                            ? Object.entries(liveProduct.inventory || {}).filter(([_, q]) => q > 0).length === 0
                            : Object.values(liveProduct.inventory || {}).reduce((a, b) => a + b, 0) === 0
                        );

                        return (
                        <div key={item.id} className="group relative flex flex-col gap-4">
                          <div className={`aspect-[3/4] overflow-hidden rounded-xl bg-surface border border-outline-variant/10 shadow-sm relative ${isOutOfStock ? 'opacity-70' : ''}`}>
                            <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.image} />
                            
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-surface/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                                <span className="bg-error text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Out of Stock</span>
                              </div>
                            )}

                            <button 
                              onClick={() => {
                                const newWishlist = wishlist.filter(w => w.id !== item.id);
                                setWishlist(newWishlist);
                                localStorage.setItem('atelier_wishlist', JSON.stringify(newWishlist));
                                window.dispatchEvent(new Event('wishlistUpdated'));
                                
                                if (selectedWishlist.has(item.id)) {
                                  const newSelection = new Set(selectedWishlist);
                                  newSelection.delete(item.id);
                                  setSelectedWishlist(newSelection);
                                }
                              }}
                              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-surface/80 backdrop-blur-md rounded-full text-on-surface hover:bg-error hover:text-surface transition-all z-20 shadow-sm"
                            >
                              <X size={16} strokeWidth={2} />
                            </button>
                            
                            {!isOutOfStock && (
                              <div className="absolute top-4 left-4 z-20">
                                <input 
                                  type="checkbox" 
                                  checked={selectedWishlist.has(item.id)}
                                  disabled={isOutOfStock}
                                  onChange={() => toggleWishlistSelection(item.id)}
                                  className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary-container cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-surface/80 backdrop-blur-md" 
                                />
                              </div>
                            )}

                            <Link href={`/product/${item.id}`} className="absolute inset-0 z-0"></Link>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-label uppercase text-[10px] tracking-widest text-outline">Saved Item</h4>
                            <div className="flex justify-between items-baseline gap-4">
                              <p className="text-sm font-semibold truncate" title={item.name}>{item.name}</p>
                              <p className="font-headline text-sm">{item.price}</p>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === "history" && (
                  <motion.div key="history" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{duration:0.4, ease: [0.16, 1, 0.3, 1]}} className="space-y-12">
                    <div className="space-y-2 border-b border-outline-variant/10 pb-6">
                      <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-on-surface mb-2">Order History</h1>
                      <p className="text-on-surface-variant text-sm">Review your past purchases and track active orders.</p>
                    </div>
                    {renderOrderTable(orders)}
                  </motion.div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <motion.div key="addresses" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{duration:0.4, ease: [0.16, 1, 0.3, 1]}} className="space-y-12">
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-on-surface mb-2">Addresses</h1>
                        <p className="text-on-surface-variant text-sm">Manage your shipping and billing locations.</p>
                      </div>
                      
                      {!isAddingAddress && (
                        <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 text-xs text-on-surface bg-surface border border-outline-variant/20 shadow-sm px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:border-on-surface hover:shadow-md transition-all">
                          <Plus size={14} strokeWidth={2} />
                          Add New
                        </button>
                      )}
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {isAddingAddress && (
                        <motion.form initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} onSubmit={handleSaveAddress} className="bg-surface border border-outline-variant/10 shadow-md p-8 rounded-2xl space-y-6 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h4 className="font-headline text-xl text-on-surface">New Shipping Address</h4>
                            <button 
                              type="button"
                              onClick={fetchLocation}
                              disabled={isFetchingLocation}
                              className="flex items-center gap-2 text-xs text-on-surface bg-surface border border-outline-variant/20 shadow-sm px-4 py-2 rounded-full font-bold uppercase tracking-widest hover:border-on-surface hover:shadow-md transition-all disabled:opacity-50"
                            >
                              <MapPin size={14} strokeWidth={2} />
                              {isFetchingLocation ? 'Locating...' : 'Use My Location'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input required placeholder="Full Name (e.g. Jane Doe)" value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                            <input required placeholder="City / State" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                            <input required placeholder="Complete Street Address" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full md:col-span-2 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                            <input required placeholder="Postal Code / ZIP" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-on-surface transition-colors" />
                          </div>
                          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/10">
                            <button type="button" onClick={() => setIsAddingAddress(false)} className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-outline hover:text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
                            <button type="submit" className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest bg-on-surface text-surface hover:bg-secondary hover:shadow-md transition-all">Save Address</button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {addresses.length === 0 && !isAddingAddress && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-6 bg-surface rounded-2xl border border-outline-variant/10 border-dashed">
                          <MapPin size={48} strokeWidth={1} className="text-outline-variant" />
                          <div>
                            <p className="font-headline text-2xl mb-2">No addresses saved</p>
                            <p className="text-sm text-outline">Add an address for a faster checkout experience.</p>
                          </div>
                          <button onClick={() => setIsAddingAddress(true)} className="bg-on-surface text-surface px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">
                            Add Address
                          </button>
                        </div>
                      )}
                      
                      {addresses.map((addr, idx) => (
                        <div key={addr.id || idx} className="p-8 bg-surface border border-outline-variant/10 shadow-sm rounded-2xl relative group hover:shadow-md hover:border-outline-variant/30 transition-all flex flex-col justify-between min-h-[200px]">
                          <div className="space-y-4 pr-12">
                            <div className="flex items-center gap-3">
                              <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface">Address {idx + 1}</span>
                              {idx === 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Default</span>}
                            </div>
                            <div>
                              <p className="text-base font-bold mb-1">{addr.fullName}</p>
                              <p className="text-sm text-on-surface-variant leading-relaxed font-body">{addr.address}<br/>{addr.city}, {addr.postalCode}</p>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-outline-variant/5 flex gap-6">
                             <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface hover:text-secondary transition-colors">Edit</button>
                             <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-bold uppercase tracking-widest text-error hover:text-error/80 transition-colors">Delete</button>
                          </div>
                          
                          <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-outline hover:bg-error/10 hover:text-error transition-colors">
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </section>
          </div>
        )}
        {/* Shipment Tracking Modal */}
        <AnimatePresence>
          {selectedTrackingOrder && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setSelectedTrackingOrder(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }} 
                className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {(() => {
                  const order = selectedTrackingOrder;
                  const addr = JSON.parse(order.shippingAddress || '{}');
                  const orderDate = new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  
                  // Determine timeline steps
                  const isProcessing = order.status === 'Pending' || order.status === 'Processing';
                  const isShipped = order.status === 'Shipped';
                  const isDelivered = order.status === 'Delivered';
                  
                  return (
                    <>
                      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start">
                        <div>
                          <h2 className="font-headline text-2xl text-on-surface italic">Shipment Tracking</h2>
                          <p className="text-xs uppercase tracking-widest text-outline mt-1 font-bold">Order #{order.$id.slice(0,8).toUpperCase()}</p>
                        </div>
                        <button onClick={() => setSelectedTrackingOrder(null)} className="p-2 text-outline hover:text-on-surface">
                          <X size={20} strokeWidth={1.5} />
                        </button>
                      </div>
                      
                      <div className="p-10 space-y-8">
                        <div className="relative border-l-2 border-[#7e572e]/20 ml-3 space-y-12">
                          
                          {/* Step 1: Processing */}
                          <div className="relative pl-8">
                            <span className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#7e572e] flex items-center justify-center shadow-[0_0_0_4px_rgba(126,87,46,0.2)]">
                               <span className="w-2 h-2 bg-white rounded-full"></span>
                            </span>
                            <h3 className="font-bold text-sm text-on-surface">Processing Silhouette Inspections</h3>
                            <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">Inspection by resident stylist</p>
                          </div>

                          {/* Step 2: Shipped */}
                          <div className="relative pl-8">
                            <span className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full ${isShipped || isDelivered ? 'bg-[#7e572e]' : 'bg-surface-container border-2 border-outline-variant/20'} flex items-center justify-center ${(isShipped || isDelivered) ? 'shadow-[0_0_0_4px_rgba(126,87,46,0.2)]' : ''}`}>
                               {(isShipped || isDelivered) && <span className="w-2 h-2 bg-white rounded-full"></span>}
                            </span>
                            <h3 className={`font-bold text-sm ${isShipped || isDelivered ? 'text-on-surface' : 'text-outline'}`}>Departed Atelier Sort Depot</h3>
                            {isShipped && <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">In transit to destination</p>}
                            {!isShipped && !isDelivered && <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">Pending Dispatch</p>}
                          </div>

                          {/* Step 3: Delivered */}
                          <div className="relative pl-8">
                            <span className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full ${isDelivered ? 'bg-[#7e572e]' : 'bg-surface-container border-2 border-outline-variant/20'} flex items-center justify-center ${isDelivered ? 'shadow-[0_0_0_4px_rgba(126,87,46,0.2)]' : ''}`}>
                               {isDelivered && <span className="w-2 h-2 bg-white rounded-full"></span>}
                            </span>
                            <h3 className={`font-bold text-sm ${isDelivered ? 'text-on-surface' : 'text-outline'}`}>Delivered at Residence</h3>
                            {isDelivered && <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">Successfully Handed Over</p>}
                            {!isDelivered && <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">Awaiting delivery confirmation</p>}
                          </div>

                        </div>
                      </div>

                      {addr.trackingNumber && (
                        <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-between items-center">
                          <p className="text-[10px] uppercase tracking-widest font-bold">Shipping Carrier: <span className="text-on-surface">Atelier Premium Logistics</span></p>
                          <p className="text-[10px] uppercase tracking-widest text-outline">{addr.trackingNumber}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>\n      </main>
      
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface">
              <h3 className="font-headline text-2xl">Cancel Order</h3>
              <button onClick={() => { setIsCancelModalOpen(false); setOrderToCancel(null); }} className="p-2 hover:bg-surface-container rounded-full transition-colors"><X size={20} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handleCancelOrder} className="p-8 space-y-8">
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                Are you sure you want to cancel order <strong className="text-on-surface">#{orderToCancel?.$id.slice(-6)}</strong>? 
                Please provide a reason for cancellation below.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Cancellation Reason *</label>
                <textarea required value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="e.g. Ordered by mistake, changed my mind..." className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg p-4 text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"></textarea>
              </div>
              <div className="pt-2 flex flex-col md:flex-row justify-end gap-4">
                <button type="button" onClick={() => { setIsCancelModalOpen(false); setOrderToCancel(null); }} className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors order-2 md:order-1">Keep Order</button>
                <button type="submit" disabled={isCancelling} className="bg-error text-surface px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error/90 transition-all disabled:opacity-50 shadow-sm order-1 md:order-2">
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

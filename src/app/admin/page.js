"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { fetchProducts, saveProduct, deleteProduct, fetchOrders, fetchAllReviews, saveReview, updateOrderStatus, fetchCoupons, saveCoupon, deleteCoupon } from "@/lib/catalog";
import { storage, BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT, ID } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { 
  LayoutDashboard, Package, ShoppingCart, MessageSquare, Settings, 
  Ticket, LogOut, TrendingUp, Users, DollarSign, Plus, Edit2, 
  Trash2, X, Search, CheckCircle, Truck, Eye, Check, AlertCircle, RefreshCcw, Menu, Bell, Star, UserCircle, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function Admin() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const [products, setProducts] = useState({});
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponType, setCouponType] = useState('fixed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQuantities, setRestockQuantities] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });

  // Orders Filter State
  const [orderSort, setOrderSort] = useState("desc"); // 'asc' for oldest first, 'desc' for newest first
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [selectedDossierOrder, setSelectedDossierOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isAdminCancelModalOpen, setIsAdminCancelModalOpen] = useState(false);
  const [adminCancelReason, setAdminCancelReason] = useState('');
  const [adminOrderToCancel, setAdminOrderToCancel] = useState(null);


  // Form State
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });

  // Reply State
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getUser();
        if (!user) {
          router.push('/account');
          return;
        }
        const allowedAdmins = ['madhu9940984501@gmail.com', 'dharanimpdm2910@gmail.com'];
        if (!allowedAdmins.includes(user.email)) {
          showToast('Access Denied: You do not have administrator privileges.', 'error');
          router.push('/');
          return;
        }
        setIsAdmin(true);
        loadData();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  async function loadData() {
    try {
      const [catalog, fetchedOrders, fetchedReviews, fetchedCoupons] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchAllReviews(),
        fetchCoupons()
      ]);
      setProducts(catalog || {});
      setOrders(fetchedOrders || []);
      setReviews(fetchedReviews || []);
      setCoupons(fetchedCoupons || []);
    } catch (e) {
      console.error(e);
    }
  }

  const confirmDelete = (id) => {
    setProductToDelete(id);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
        loadData();
        showToast('Product deleted successfully.', 'success');
      } catch (err) {
        showToast('Failed to delete product.', 'error');
      }
      setProductToDelete(null);
    }
  };

  const handleInventoryChange = (size, val) => {
    setInventory(prev => ({ ...prev, [size]: parseInt(val) || 0 }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const name = formData.get('name');
      let price = formData.get('price');
      const occasion = formData.get('occasion');
      const fabric = formData.get('fabric');
      const desc = formData.get('desc');

      const totalInventory = Object.values(inventory).reduce((acc, val) => acc + parseInt(val || 0), 0);
      if (totalInventory === 0) {
        showToast("Stocks are still zero. Please add inventory to at least one size.", "error");
        setIsSubmitting(false);
        return;
      }

      const files = [];
      ['image1', 'image2', 'image3'].forEach(key => {
        const file = formData.get(key);
        if (file && file.size > 0) {
          files.push(file);
        }
      });
      
      if (files.length === 0) {
        showToast("Please select at least 1 image.", "error");
        setIsSubmitting(false);
        return;
      }

      const uploadedImageUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Note: If you get a "Failed to fetch" error here, it usually means 
        // the "product-images" bucket doesn't exist in Appwrite Storage, 
        // or its permissions are not set to allow creating files.
        const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const viewUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploaded.$id}/view?project=${APPWRITE_PROJECT_ID}`;
        uploadedImageUrls.push(viewUrl);
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!price.startsWith('₹')) price = '₹' + price;

      let sizeString = '';
      if (category === 'Fashion Dress') {
        const availableSizes = Object.entries(inventory)
          .filter(([_, qty]) => qty > 0)
          .map(([size]) => size);
        sizeString = availableSizes.join(', ');
      }

      const newProduct = {
        id,
        name,
        price,
        size: sizeString,
        image: uploadedImageUrls[0],
        images: uploadedImageUrls,
        desc: desc || `A newly added ${name}.`,
        category: category || formData.get('category') || 'Fashion Dress',
        inventory,
        occasion,
        fabric
      };

      await saveProduct(newProduct);
      e.target.reset();
      setInventory({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
      setIsModalOpen(false);
      loadData();
      showToast('Product saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRestockModal = (product) => {
    setRestockProduct(product);
    setRestockQuantities({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
  };

  const executeRestock = async () => {
    if (!restockProduct) return;
    try {
      const updatedInventory = { ...restockProduct.inventory };
      ['XS', 'S', 'M', 'L', 'XL'].forEach(s => {
        const qtyToAdd = parseInt(restockQuantities[s]) || 0;
        updatedInventory[s] = (parseInt(updatedInventory[s]) || 0) + qtyToAdd;
      });
      
      let sizeString = '';
      if (restockProduct.category === 'Fashion Dress' || !restockProduct.category) {
        const availableSizes = Object.entries(updatedInventory)
          .filter(([_, qty]) => qty > 0)
          .map(([size]) => size);
        sizeString = availableSizes.join(', ');
      }

      await saveProduct({ ...restockProduct, inventory: updatedInventory, size: sizeString });
      loadData();
      showToast('Product restocked successfully!', 'success');
      setRestockProduct(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to restock product.', 'error');
    }
  };

  const handleSubmitReply = async (review) => {
    if (!replyText) return;
    try {
      await saveReview({ ...review, reply: replyText });
      setReplyingTo(null);
      setReplyText("");
      loadData();
      showToast("Reply submitted successfully!", "success");
    } catch (err) {
      showToast("Failed to submit reply.", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, updatedShippingAddress = null) => {
    try {
      await updateOrderStatus(orderId, status, updatedShippingAddress);
      loadData();
      showToast(`Order status updated to ${status}.`, "success");
    } catch (err) {
      showToast("Failed to update order status.", "error");
    }
  };

  const handleAdminCancelOrder = async (e) => {
    e.preventDefault();
    if (!adminCancelReason || !adminOrderToCancel) return;
    try {
      const shippingAddress = JSON.parse(adminOrderToCancel.shippingAddress || '{}');
      const updatedShipping = JSON.stringify({
        ...shippingAddress,
        adminCancelReason: adminCancelReason
      });
      await updateOrderStatus(adminOrderToCancel.$id, 'Cancelled', updatedShipping);
      showToast('Order successfully cancelled.', 'success');
      setAdminCancelReason('');
      setAdminOrderToCancel(null);
      setIsAdminCancelModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to cancel order.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center">
        <p className="text-outline text-sm">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  // Dashboard Metrics
  const totalEarnings = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const onlineOrders = orders.filter(o => {
    const addr = JSON.parse(o.shippingAddress || '{}');
    return addr.paymentMethod === 'Online Payment';
  }).length;
  const offlineOrders = orders.filter(o => {
    const addr = JSON.parse(o.shippingAddress || '{}');
    return addr.paymentMethod === 'Cash on Delivery' || !addr.paymentMethod;
  }).length;

  // Top Selling Dress
  const productSales = {};
  orders.filter(o => o.status !== 'Cancelled').forEach(o => {
    const items = JSON.parse(o.items || '[]');
    items.forEach(item => {
      productSales[item.id] = (productSales[item.id] || 0) + (item.quantity || 1);
    });
  });
  let topSellingProductId = null;
  let maxSales = 0;
  Object.keys(productSales).forEach(id => {
    if (productSales[id] > maxSales) {
      maxSales = productSales[id];
      topSellingProductId = id;
    }
  });
  const topSellingProduct = products[topSellingProductId];

  // Monthly Earnings
  const monthlyEarnings = {};
  orders.filter(o => o.status !== 'Cancelled').forEach(o => {
    const date = new Date(o.$createdAt);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyEarnings[monthYear] = (monthlyEarnings[monthYear] || 0) + o.total;
  });

  // Stock Alerts
  let outOfStock = [];
  let lowStock = [];
  Object.values(products).forEach(product => {
    if (product.inventory) {
      Object.entries(product.inventory).forEach(([size, qty]) => {
        const alertId = `${product.id}-${size}`;
        if (dismissedAlerts.includes(alertId)) return;
        
        if (qty === 0) outOfStock.push({ alertId, product, size, qty });
        else if (qty <= 5) lowStock.push({ alertId, product, size, qty });
      });
    }
  });

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const handleClearAllAlerts = () => {
    const allAlertIds = [...outOfStock, ...lowStock].map(a => a.alertId);
    setDismissedAlerts([...dismissedAlerts, ...allAlertIds]);
  };

  return (
    <div className="bg-surface text-on-surface text-on-background font-body min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 bg-[#fbf9f7]/70 dark:bg-[#303331]/70 backdrop-blur-md flex justify-between items-center max-w-[1920px] mx-auto border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <Link href="/" className="font-['Noto_Serif'] italic text-2xl tracking-tighter text-[#303331] dark:text-[#fbf9f7]">AZHAGII</Link>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/account" className="text-[10px] font-bold uppercase tracking-widest hover:text-secondary">Logout</Link>
        </div>
      </header>

      <div className="flex pt-24 flex-grow">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <aside className={`w-64 fixed left-0 top-24 bottom-0 px-8 py-8 border-r border-outline-variant/10 z-40 bg-surface text-on-surface transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="space-y-8 overflow-y-auto h-full pb-20">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline mb-6 font-semibold">Core Management</p>
              <ul className="space-y-4">
                <li onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Dashboard' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><LayoutDashboard size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Dashboard</span>
                </li>
                <li onClick={() => { setActiveTab('Products'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Products' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><Package size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Products</span>
                </li>
                <li onClick={() => { setActiveTab('Orders'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Orders' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><ShoppingCart size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Orders</span>
                </li>
                <li onClick={() => { setActiveTab('Customers'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Customers' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><Users size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Customer Feedback</span>
                </li>
                <li onClick={() => { setActiveTab('Coupons'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Coupons' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><Ticket size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Coupons</span>
                </li>
                <li onClick={() => { setActiveTab('Refunds'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Refunds' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><DollarSign size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide">Refund Requests</span>
                </li>
                <li onClick={() => { setActiveTab('Notifications'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Notifications' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><Bell size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide flex-1">Notifications</span>
                </li>
                <li onClick={() => { setActiveTab('Site Settings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Site Settings' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span><Settings size={20} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium tracking-wide flex-1">Site Settings</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main className="flex-1 ml-0 md:ml-64 px-8 md:px-12 pb-20">
          <section className="py-10">
            <h1 className="font-headline text-4xl md:text-5xl tracking-tight mb-2 text-on-surface">Azhagii <span className="italic font-normal">{activeTab}</span></h1>
            <p className="text-on-surface-variant tracking-wide text-sm uppercase">Management Dashboard</p>
          </section>

          {activeTab === 'Site Settings' && (
            <div className="space-y-12">
               <section className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                 <h2 className="font-headline text-2xl mb-6 text-on-surface">Change Home Hero Image</h2>
                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   const form = e.target;
                   const formData = new FormData(form);
                   const file = formData.get('image');
                   if (!file || file.size === 0) return;
                   
                   try {
                     const res = await fetch('/api/upload-hero', { method: 'POST', body: formData });
                     if (res.ok) {
                       showToast('Hero image updated successfully. Refresh home page to see changes.', 'success');
                       form.reset();
                     } else {
                       showToast('Failed to update image.', 'error');
                     }
                   } catch (err) {
                     showToast('An error occurred.', 'error');
                   }
                 }}>
                   <div className="mb-6">
                     <label className="block text-xs uppercase tracking-widest text-outline mb-2">Upload New High-Quality Image</label>
                     <input type="file" name="image" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-surface hover:file:bg-on-surface" required />
                   </div>
                   <button type="submit" className="bg-on-surface text-surface px-6 py-3 text-xs uppercase tracking-widest hover:bg-secondary transition-colors rounded">Update Image</button>
                 </form>
               </section>
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <div className="space-y-12">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">Total Earnings</h3>
                  <p className="font-headline text-3xl">₹{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">Payment Methods</h3>
                  <p className="text-sm">Online Orders: <span className="font-bold">{onlineOrders}</span></p>
                  <p className="text-sm">Offline Orders: <span className="font-bold">{offlineOrders}</span></p>
                </div>
                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20 flex gap-4 items-center">
                  {topSellingProduct ? (
                    <>
                      <img src={Array.isArray(topSellingProduct.images) ? topSellingProduct.images[0] : topSellingProduct.image} alt={topSellingProduct.name} className="w-16 h-20 object-cover rounded" />
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">Top Selling Product</h3>
                        <p className="font-headline text-lg italic text-on-surface line-clamp-1">{topSellingProduct.name}</p>
                        <p className="text-sm text-secondary font-bold">{maxSales} sold</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-outline text-sm">No sales data yet.</p>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-6 font-bold">Monthly Earnings</h3>
                  <div className="space-y-4">
                    {Object.keys(monthlyEarnings).length === 0 ? (
                      <p className="text-sm text-outline">No earnings data available.</p>
                    ) : (
                      Object.entries(monthlyEarnings).map(([month, amount]) => (
                        <div key={month} className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                          <span className="text-sm font-medium">{month}</span>
                          <span className="font-headline text-lg">₹{amount.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-6 font-bold">Stock Overview</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {Object.values(products).map(product => (
                      <div key={product.id} className="border border-outline-variant/20 rounded p-4">
                        <p className="text-sm font-bold mb-2">{product.name}</p>
                        {product.inventory ? (
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(product.inventory).map(([size, qty]) => (
                              <div key={size} className="text-[10px] uppercase tracking-wider">
                                <span className="text-outline">{size}:</span> <span className={`font-bold ${qty === 0 ? 'text-error' : qty <= 5 ? 'text-secondary' : 'text-on-surface'}`}>{qty}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-outline uppercase">No inventory tracked</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <section className="space-y-8">
              <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-2xl text-error flex items-center gap-2">
                    <AlertCircle size={32} strokeWidth={1.5} /> Out of Stock Alerts
                  </h3>
                  {(outOfStock.length > 0 || lowStock.length > 0) && (
                    <button onClick={handleClearAllAlerts} className="text-xs uppercase tracking-widest text-outline hover:text-on-surface font-bold border border-outline/20 px-4 py-2 rounded">
                      Clear All
                    </button>
                  )}
                </div>
                {outOfStock.length === 0 ? (
                  <p className="text-outline text-sm">No out of stock items.</p>
                ) : (
                  <div className="space-y-4">
                    {outOfStock.map((alert, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-error/5 border border-error/20 p-4 rounded-lg">
                        <div className="flex gap-4 items-center">
                          <img src={Array.isArray(alert.product.images) ? alert.product.images[0] : alert.product.image} className="w-12 h-16 object-cover rounded" />
                          <div>
                            <p className="font-bold text-sm">{alert.product.name}</p>
                            <p className="text-xs text-error mt-1 uppercase tracking-widest font-bold">Size: {alert.size} is out of stock!</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openRestockModal(alert.product)} className="bg-on-surface text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
                            Restock
                          </button>
                          <button onClick={() => confirmDelete(alert.product.id)} className="bg-error text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-error/80 transition-colors">
                            Remove Product
                          </button>
                          <button onClick={() => handleDismissAlert(alert.alertId)} className="p-2 text-outline hover:text-on-surface">
                            <X size={24} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                <h3 className="font-headline text-2xl mb-6 text-secondary flex items-center gap-2">
                  <Package size={24} strokeWidth={1.5} /> Low Stock Alerts
                </h3>
                {lowStock.length === 0 ? (
                  <p className="text-outline text-sm">No low stock items.</p>
                ) : (
                  <div className="space-y-4">
                    {lowStock.map((alert, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-secondary/5 border border-secondary/20 p-4 rounded-lg">
                        <div className="flex gap-4 items-center">
                          <img src={Array.isArray(alert.product.images) ? alert.product.images[0] : alert.product.image} className="w-12 h-16 object-cover rounded" />
                          <div>
                            <p className="font-bold text-sm">{alert.product.name}</p>
                            <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Size: {alert.size} has only {alert.qty} left!</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openRestockModal(alert.product)} className="bg-on-surface text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
                            Restock
                          </button>
                          <button onClick={() => handleDismissAlert(alert.alertId)} className="p-2 text-outline hover:text-on-surface">
                            <X size={24} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'Products' && (
            <section className="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
                <h3 className="font-headline text-xl">Product Inventory</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-on-surface text-surface px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all"
                >
                  Add New Dress
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-surface-container-low/20 text-[10px] uppercase tracking-[0.15em] text-outline font-bold">
                      <th className="px-8 py-4">Image</th>
                      <th className="px-8 py-4">Name</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Price</th>
                      <th className="px-8 py-4">Inventory</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {Object.keys(products).length === 0 ? (
                      <tr><td colSpan="6" className="px-8 py-5 text-center text-sm text-outline">No products found.</td></tr>
                    ) : (
                      Object.entries(products).map(([id, product]) => {
                        const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
                        let stockText = product.category === 'Saree' ? 'Saree (One Size)' : 'N/A';
                        if (product.category === 'Fashion Dress' && product.inventory) {
                          const totalStock = Object.values(product.inventory).reduce((a, b) => a + (parseInt(b) || 0), 0);
                          stockText = `${totalStock} in stock`;
                        }
                        return (
                          <tr key={id} className="group hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-8 py-5"><div className="w-12 h-16 rounded overflow-hidden bg-surface-container"><img src={imgUrl} className="w-full h-full object-cover" alt={product.name} /></div></td>
                            <td className="px-8 py-5 text-sm font-semibold">{product.name}</td>
                            <td className="px-8 py-5 text-sm">{product.category || 'Fashion Dress'}</td>
                            <td className="px-8 py-5 text-sm">{product.price}</td>
                            <td className="px-8 py-5 text-sm text-outline">{stockText}</td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => confirmDelete(id)} className="text-red-500 hover:text-red-700 transition-colors material-symbols-outlined text-xl">delete</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          
          {activeTab === 'Orders' && (
            <section className="mb-12 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex-1 bg-surface-container-low rounded-lg px-4 py-2 flex items-center gap-2 border border-outline-variant/10">
                  <Search size={16} className="text-outline" />
                  <input type="text" placeholder="Search by ID, client name..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center overflow-x-auto pb-2 xl:pb-0">
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setOrderSort(orderSort === 'desc' ? 'asc' : 'desc')} className="text-outline px-4 py-2 rounded font-label text-xs uppercase tracking-widest hover:text-on-surface transition-colors flex items-center gap-1 border border-outline-variant/30">
                      {orderSort === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                    <input type="date" value={orderDateFilter} onChange={(e) => setOrderDateFilter(e.target.value)} className="bg-transparent border border-outline-variant/30 rounded px-2 py-1 text-xs outline-none text-on-surface uppercase font-label tracking-widest" />
                  </div>
                  <div className="flex gap-2 md:border-l md:border-outline-variant/20 md:pl-4 shrink-0">
                    <button onClick={() => setOrderStatusFilter('All')} className={`${orderStatusFilter === 'All' ? 'bg-on-surface text-surface' : 'text-outline hover:text-on-surface'} px-4 py-2 rounded font-label text-xs uppercase tracking-widest transition-colors`}>All</button>
                    <button onClick={() => setOrderStatusFilter('Processing')} className={`${orderStatusFilter === 'Processing' ? 'bg-on-surface text-surface' : 'text-outline hover:text-on-surface'} px-4 py-2 rounded font-label text-xs uppercase tracking-widest transition-colors`}>Processing</button>
                    <button onClick={() => setOrderStatusFilter('Shipped / Transit')} className={`${orderStatusFilter === 'Shipped / Transit' ? 'bg-on-surface text-surface' : 'text-outline hover:text-on-surface'} px-4 py-2 rounded font-label text-xs uppercase tracking-widest transition-colors`}>Shipped / Transit</button>
                    <button onClick={() => setOrderStatusFilter('Delivered')} className={`${orderStatusFilter === 'Delivered' ? 'bg-on-surface text-surface' : 'text-outline hover:text-on-surface'} px-4 py-2 rounded font-label text-xs uppercase tracking-widest transition-colors`}>Delivered</button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low/20 text-[10px] uppercase tracking-[0.15em] text-outline font-bold">
                      <th className="px-8 py-4 w-1/5">Order Details</th>
                      <th className="px-8 py-4 w-1/4">Client Information</th>
                      <th className="px-8 py-4">Total Bill</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {orders.length === 0 ? (
                      <tr><td colSpan="5" className="px-8 py-5 text-center text-sm text-outline">No orders found.</td></tr>
                    ) : (
                      orders
                        .filter(order => {
                          if (orderSearch) {
                            const searchLower = orderSearch.toLowerCase();
                            const addr = JSON.parse(order.shippingAddress || '{}');
                            if (!order.$id.toLowerCase().includes(searchLower) && 
                                !(addr.fullName && addr.fullName.toLowerCase().includes(searchLower)) &&
                                !(addr.email && addr.email.toLowerCase().includes(searchLower))) {
                              return false;
                            }
                          }
                          if (orderDateFilter) {
                            const orderDateStr = new Date(order.$createdAt).toISOString().split('T')[0];
                            if (orderDateStr !== orderDateFilter) return false;
                          }
                          if (orderStatusFilter !== 'All') {
                            const isProcessing = order.status === 'Pending' || order.status === 'Processing';
                            if (orderStatusFilter === 'Processing' && !isProcessing) return false;
                            if (orderStatusFilter === 'Shipped / Transit' && order.status !== 'Shipped') return false;
                            if (orderStatusFilter === 'Delivered' && order.status !== 'Delivered') return false;
                          }
                          return true;
                        })
                        .sort((a, b) => {
                          const dateA = new Date(a.$createdAt).getTime();
                          const dateB = new Date(b.$createdAt).getTime();
                          return orderSort === 'asc' ? dateA - dateB : dateB - dateA;
                        })
                        .map(order => {
                          const addr = JSON.parse(order.shippingAddress || '{}');
                          const orderDate = new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          const isProcessing = order.status === 'Pending' || order.status === 'Processing';
                          return (
                            <tr key={order.$id} className="group hover:bg-surface-container-low/30 transition-colors">
                              <td className="px-8 py-6 align-top">
                                <p className="font-headline font-bold text-sm tracking-wide text-on-surface">#{order.$id.slice(0,8).toUpperCase()}</p>
                                <p className="text-xs text-outline mt-1">{orderDate}</p>
                              </td>
                              <td className="px-8 py-6 align-top">
                                <p className="font-bold text-sm text-on-surface">{addr.fullName}</p>
                                <p className="text-xs text-outline mt-1">{addr.email}</p>
                              </td>
                              <td className="px-8 py-6 align-top">
                                <p className="font-headline text-lg font-bold">₹{order.total.toFixed(0)}</p>
                              </td>
                              <td className="px-8 py-6 align-top">
                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${isProcessing ? 'bg-[#f8d7da] text-[#721c24]' : order.status === 'Delivered' ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                  {isProcessing ? 'Processing' : order.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 align-top text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => setSelectedDossierOrder(order)} className="p-2 text-outline hover:text-on-surface transition-colors bg-surface-container-low rounded-full">
                                    <Eye size={16} strokeWidth={1.5} />
                                  </button>
                                  {isProcessing ? (
                                    <>
                                      <button onClick={() => { setAdminOrderToCancel(order); setIsAdminCancelModalOpen(true); }} className="bg-surface-container text-error px-4 py-2 rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-error/10 transition-colors">
                                        <X size={14} /> Cancel
                                      </button>
                                      <button onClick={() => { setSelectedDossierOrder(order); setTrackingNumber(""); }} className="bg-[#7e572e] text-surface px-4 py-2 rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#5c3e1e] transition-colors">
                                        <Truck size={14} /> Ship
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-1">
                                      {order.status === 'Cancelled' ? <><X size={14} className="text-error" /> <span className="text-error">Cancelled</span></> : <><Check size={14} /> {order.status}</>}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Dossier Modal */}
              <AnimatePresence>
                {selectedDossierOrder && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
                    onClick={() => setSelectedDossierOrder(null)}
                  >
                    <motion.div 
                      initial={{ x: '100%' }} 
                      animate={{ x: 0 }} 
                      exit={{ x: '100%' }} 
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="bg-surface w-full max-w-md h-full shadow-2xl flex flex-col"
                      onClick={e => e.stopPropagation()}
                    >
                      {(() => {
                        const order = selectedDossierOrder;
                        const addr = JSON.parse(order.shippingAddress || '{}');
                        const items = JSON.parse(order.items || '[]');
                        const isProcessing = order.status === 'Pending' || order.status === 'Processing';
                        return (
                          <>
                            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-start">
                              <div>
                                <h2 className="font-headline text-2xl text-on-surface italic">Order Dossier</h2>
                                <p className="text-xs uppercase tracking-widest text-outline mt-1">#{order.$id}</p>
                              </div>
                              <button onClick={() => setSelectedDossierOrder(null)} className="p-2 text-outline hover:text-on-surface">
                                <X size={20} strokeWidth={1.5} />
                              </button>
                            </div>
                            
                            <div className="p-8 flex-1 overflow-y-auto space-y-8">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Order Status</p>
                                <span className={`inline-flex px-4 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold ${isProcessing ? 'bg-[#f8d7da] text-[#721c24]' : order.status === 'Delivered' ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                  {isProcessing ? 'Processing' : order.status}
                                </span>
                              </div>

                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Client Details</p>
                                <div className="space-y-3 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10">
                                  <div className="flex gap-3 text-sm text-on-surface-variant"><UserCircle size={16} className="mt-0.5 text-outline" /> <span><span className="font-bold text-on-surface block">{addr.fullName}</span><span className="text-xs">Registered Atelier Guest</span></span></div>
                                  <div className="flex gap-3 text-sm text-on-surface-variant"><MessageSquare size={16} className="text-outline" /> {addr.email}</div>
                                  <div className="flex gap-3 text-sm text-on-surface-variant"><Bell size={16} className="text-outline" /> {addr.phone || 'N/A'}</div>
                                  <div className="flex gap-3 text-sm text-on-surface-variant pt-2 border-t border-outline-variant/10">
                                    <MapPin size={16} className="mt-0.5 text-outline" /> 
                                    <span className="text-xs">
                                      <span className="font-bold text-[10px] uppercase tracking-widest block text-outline mb-1">Shipping Address</span>
                                      {addr.address}, {addr.city} - {addr.postalCode}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Silhouettes Ordered</p>
                                <div className="space-y-4">
                                  {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center bg-surface-container-lowest p-3 rounded border border-outline-variant/5">
                                      <img src={item.image} className="w-12 h-16 rounded object-cover" />
                                      <div className="flex-1">
                                        <p className="font-bold text-sm text-on-surface">{item.name}</p>
                                        <p className="text-xs text-outline mt-1 uppercase font-label">Size: {item.size} | Qty: {item.quantity || 1}</p>
                                      </div>
                                      <p className="font-headline font-bold text-sm">₹{(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                                <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Grand Total (INR)</p>
                                <p className="font-headline text-2xl font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                              </div>
                            </div>

                            {isProcessing && (
                              <div className="p-8 border-t border-outline-variant/10 bg-surface-container-lowest flex flex-col gap-3">
                                <input 
                                  type="text" 
                                  placeholder="Enter Tracking Number (e.g. TRK-98182)"
                                  value={trackingNumber}
                                  onChange={e => setTrackingNumber(e.target.value)}
                                  className="w-full bg-surface-container-low border-none rounded p-3 text-sm outline-none focus:ring-1 focus:ring-[#7e572e]"
                                />
                                <button 
                                  onClick={() => {
                                    const updatedAddr = { ...addr, trackingNumber };
                                    handleUpdateOrderStatus(order.$id, 'Shipped', JSON.stringify(updatedAddr));
                                    setSelectedDossierOrder(null);
                                  }}
                                  className="w-full bg-[#7e572e] text-surface py-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5c3e1e] transition-colors"
                                >
                                  <Truck size={16} /> Dispatch Indian Courier
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          {activeTab === 'Customers' && (
            <section className="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
              <div className="px-8 py-6 border-b border-outline-variant/10">
                <h3 className="font-headline text-xl">Customer Feedback & Reviews</h3>
              </div>
              <div className="p-8 space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-sm text-outline">No feedback or reviews yet.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.$id} className="border border-outline-variant/20 rounded-lg p-6 bg-surface-container-low/30">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-widest">{review.userName}</p>
                          <p className="text-[10px] text-outline mt-1 uppercase">Product ID: {review.productId}</p>
                        </div>
                        <div className="flex text-secondary">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} strokeWidth={2} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-6">"{review.comment}"</p>

                      {review.reply ? (
                        <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/20">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Your Reply:</p>
                          <p className="text-sm text-on-surface-variant italic font-body">{review.reply}</p>
                        </div>
                      ) : (
                        replyingTo === review.$id ? (
                          <div className="mt-4">
                            <textarea
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none mb-3"
                              rows="3"
                              placeholder="Write your response..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex gap-3">
                              <button onClick={() => handleSubmitReply(review)} className="bg-secondary text-on-secondary px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface transition-all">Submit Reply</button>
                              <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-outline text-[10px] font-bold uppercase tracking-widest hover:text-on-surface">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingTo(review.$id)} className="text-secondary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                            <MessageSquare size={14} strokeWidth={1.5} /> Reply to Customer
                          </button>
                        )
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'Coupons' && (
            <section className="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
                <h3 className="font-headline text-xl">Coupons</h3>
                <button
                  onClick={() => { setIsCouponModalOpen(true); setCouponType('fixed'); }}
                  className="bg-on-surface text-surface px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all"
                >
                  Create Coupon
                </button>
              </div>
              <div className="p-8 space-y-6">
                {coupons.length === 0 ? (
                  <p className="text-sm text-outline">No coupons created yet.</p>
                ) : (
                  coupons.map(coupon => {
                    const isExpired = new Date(coupon.expiryDate) < new Date();
                    return (
                      <div key={coupon.$id} className="border border-outline-variant/20 rounded-lg p-6 bg-surface-container-low/30 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold uppercase tracking-widest text-on-surface mb-1">{coupon.code}</p>
                          <p className="text-sm text-on-surface-variant">
                            {coupon.type === 'percentage' 
                              ? `Discount: ${coupon.discountAmount}% (Max ₹${coupon.maxDiscount}) | Min Price: ₹${coupon.minPrice}`
                              : `Discount: ₹${coupon.discountAmount} | Min Price: ₹${coupon.minPrice}`}
                          </p>
                          <p className="text-xs text-outline mt-1">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {isExpired ? (
                            <span className="bg-error-container/20 text-error px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Expired</span>
                          ) : (
                            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Active</span>
                          )}
                          <button onClick={async () => {
                            if (confirm('Delete this coupon?')) {
                              try {
                                await deleteCoupon(coupon.$id);
                                loadData();
                                showToast('Coupon deleted.', 'success');
                              } catch (e) {
                                showToast('Failed to delete coupon.', 'error');
                              }
                            }
                          }} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all">
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {activeTab === 'Refunds' && (
            <section className="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
              <div className="px-8 py-6 border-b border-outline-variant/10">
                <h3 className="font-headline text-xl">Refund Requests</h3>
              </div>
              <div className="p-8 space-y-6">
                {orders.filter(o => o.status === 'Refund Requested' || o.status === 'Refund Processed').length === 0 ? (
                  <p className="text-sm text-outline">No refund requests found.</p>
                ) : (
                  orders
                    .filter(o => o.status === 'Refund Requested' || o.status === 'Refund Processed')
                    .map(order => {
                      const addr = JSON.parse(order.shippingAddress || '{}');
                      return (
                        <div key={order.$id} className={`border rounded-lg p-6 ${order.status === 'Refund Processed' ? 'bg-surface-container/30 border-outline-variant/10 opacity-70' : 'bg-error-container/10 border-error/20'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Order ID: {order.$id}</p>
                              <p className="text-sm font-bold mt-1 text-on-surface">{addr.fullName}</p>
                              <p className="text-sm text-on-surface-variant mt-2 font-semibold">Payment: {addr.paymentMethod}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <span className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${order.status === 'Refund Processed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error text-surface'}`}>
                                {order.status}
                              </span>
                              <p className="font-headline text-xl mt-1">₹{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/10 mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-1">Cancellation Reason:</p>
                            <p className="text-sm text-on-surface-variant italic font-body">"{addr.cancelReason || 'No reason provided.'}"</p>
                          </div>
                          {order.status === 'Refund Requested' && (
                            <div className="mt-6 flex justify-end gap-3">
                              <button onClick={() => handleUpdateOrderStatus(order.$id, 'Refund Rejected')} className="border border-error/50 text-error px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all">
                                Reject Refund
                              </button>
                              <button onClick={() => handleUpdateOrderStatus(order.$id, 'Refund Processed')} className="bg-on-surface text-surface px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">
                                Mark as Refunded
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <AlertCircle size={32} strokeWidth={1.5} />
            <h3 className="font-headline text-xl mb-2">Delete Product</h3>
            <p className="text-on-surface-variant text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setProductToDelete(null)} className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-outline border border-outline-variant/30 hover:bg-surface-container-low transition-colors">Cancel</button>
              <button onClick={executeDelete} className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-error text-white hover:bg-error/80 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {restockProduct && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-headline text-xl mb-4 text-center">Restock Sizes</h3>
            <p className="text-on-surface-variant text-sm mb-6 text-center">Add quantities for {restockProduct.name}. Leave at 0 if no new stock.</p>
            <div className="space-y-4 mb-6">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="flex justify-between items-center bg-surface-container-low p-2 rounded">
                  <span className="font-bold text-sm">{size} <span className="text-[10px] text-outline font-normal">(Current: {restockProduct.inventory[size] || 0})</span></span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline font-bold uppercase">+</span>
                    <input 
                      type="number" 
                      min="0"
                      value={restockQuantities[size]}
                      onChange={(e) => setRestockQuantities({...restockQuantities, [size]: e.target.value})}
                      className="w-16 bg-surface border border-outline-variant/30 rounded p-1 text-center text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setRestockProduct(null)} className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-outline border border-outline-variant/30 hover:bg-surface-container-low transition-colors">Cancel</button>
              <button onClick={executeRestock} className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-on-surface text-surface hover:bg-secondary transition-colors">Restock</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline text-xl">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Product Category *</label>
                <input
                  name="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  list="category-options"
                  placeholder="e.g. Saree, Summer Wear"
                  className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none"
                />
                <datalist id="category-options">
                  <option value="Party Wear" />
                  <option value="Casual" />
                  <option value="Traditional" />
                  <option value="Office Wear" />
                  <option value="Summer Collection" />
                  <option value="Saree" />
                  {Array.from(new Set(Object.values(products).map(p => p.category).filter(Boolean))).map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-[10px] text-outline mt-1 uppercase tracking-widest">Type a new category or select an existing one.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Product Name *</label>
                  <input name="name" type="text" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Price *</label>
                  <input name="price" type="text" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Description Note *</label>
                <textarea name="desc" required rows="3" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Occasion</label>
                  <select name="occasion" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none">
                    <option value="">Any</option>
                    <option value="Garden Party">Garden Party</option>
                    <option value="Bridal Guest">Bridal Guest</option>
                    <option value="Summer Soirée">Summer Soirée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Fabric</label>
                  <select name="fabric" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none">
                    <option value="">Any</option>
                    <option value="Organic Silk">Organic Silk</option>
                    <option value="Linen Blend">Linen Blend</option>
                  </select>
                </div>
              </div>

              {category === 'Saree' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Total Quantity *</label>
                  <input type="number" min="0" value={inventory['One Size'] || 0} onChange={(e) => setInventory({ 'One Size': parseInt(e.target.value) || 0 })} className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Size Inventory *</label>
                  <div className="grid grid-cols-5 gap-4">
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <div key={size}>
                        <label className="block text-[10px] text-center font-bold mb-1">{size}</label>
                        <input type="number" min="0" value={inventory[size] || 0} onChange={(e) => handleInventoryChange(size, e.target.value)} className="w-full bg-surface-container-low border-none rounded p-2 text-center text-sm outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface">Product Images (Max 3) *</label>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-outline-variant mb-1">Image 1 (Required) *</label>
                  <input name="image1" type="file" accept="image/*" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-outline-variant mb-1">Image 2 (Optional)</label>
                  <input name="image2" type="file" accept="image/*" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-outline-variant mb-1">Image 3 (Optional)</label>
                  <input name="image3" type="file" accept="image/*" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-on-surface text-surface px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50">
                  {isSubmitting ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline text-xl">Create New Coupon</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const formData = new FormData(e.target);
              try {
                await saveCoupon({
                  code: formData.get('code').toUpperCase(),
                  discountAmount: parseFloat(formData.get('discountAmount')),
                  minPrice: parseFloat(formData.get('minPrice')),
                  expiryDate: formData.get('expiryDate'),
                  type: couponType,
                  maxDiscount: couponType === 'percentage' ? parseFloat(formData.get('maxDiscount')) : null
                });
                setIsCouponModalOpen(false);
                loadData();
                showToast('Coupon created successfully!', 'success');
              } catch (err) {
                showToast('Failed to create coupon.', 'error');
              } finally {
                setIsSubmitting(false);
              }
            }} className="p-8 space-y-6">

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Coupon Code *</label>
                <input name="code" type="text" required placeholder="e.g. SUMMER24" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none uppercase" />
              </div>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="type" value="fixed" checked={couponType === 'fixed'} onChange={() => setCouponType('fixed')} className="accent-secondary" /> Fixed Amount (₹)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="type" value="percentage" checked={couponType === 'percentage'} onChange={() => setCouponType('percentage')} className="accent-secondary" /> Percentage (%)
                </label>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Discount {couponType === 'fixed' ? '(₹)' : '(%)'} *</label>
                  <input name="discountAmount" type="number" min="1" max={couponType === 'percentage' ? 100 : undefined} required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Min Price (₹) *</label>
                  <input name="minPrice" type="number" min="0" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                {couponType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Max Discount (₹) *</label>
                    <input name="maxDiscount" type="number" min="1" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Expiry Date *</label>
                <input name="expiryDate" type="datetime-local" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setIsCouponModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-on-surface text-surface px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Cancel Order Modal */}
      {isAdminCancelModalOpen && adminOrderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline text-xl text-on-surface">Cancel Order</h3>
              <button onClick={() => { setIsAdminCancelModalOpen(false); setAdminOrderToCancel(null); setAdminCancelReason(''); }} className="p-2 hover:bg-surface-container rounded-full transition-colors"><X size={20} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handleAdminCancelOrder} className="p-6 space-y-6">
              <p className="text-sm text-on-surface-variant font-body">
                Please provide a reason for cancelling order <strong className="text-on-surface">#{adminOrderToCancel.$id.slice(-6)}</strong>. This reason will be visible to the customer.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Cancellation Reason *</label>
                <textarea required value={adminCancelReason} onChange={(e) => setAdminCancelReason(e.target.value)} rows={3} placeholder="e.g. Out of stock, pricing error..." className="w-full bg-surface-container-low border-none rounded p-4 text-sm focus:ring-1 focus:ring-secondary outline-none transition-all"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-4">
                <button type="button" onClick={() => { setIsAdminCancelModalOpen(false); setAdminOrderToCancel(null); setAdminCancelReason(''); }} className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface transition-colors">Keep Order</button>
                <button type="submit" className="bg-error text-surface px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error/90 transition-all shadow-sm">
                  Confirm Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

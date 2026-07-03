"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { fetchProducts, saveProduct, deleteProduct, fetchOrders, fetchAllReviews, saveReview, updateOrderStatus, fetchCoupons, saveCoupon, deleteCoupon } from "@/lib/catalog";
import { storage, BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT, ID } from "@/lib/appwrite";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Orders Filter State
  const [orderSort, setOrderSort] = useState("asc"); // 'asc' for oldest first, 'desc' for newest first
  const [orderDateFilter, setOrderDateFilter] = useState("");

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
        if (user.email !== 'madhu9940984501@gmail.com') {
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

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this dress?')) {
      try {
        await deleteProduct(id);
        loadData();
        showToast('Product deleted successfully.', 'success');
      } catch (err) {
        showToast('Failed to delete product.', 'error');
      }
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
      const color = formData.get('color');
      const fabric = formData.get('fabric');
      const desc = formData.get('desc');

      const files = Array.from(formData.getAll('images')).filter(f => f.size > 0);
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
        color,
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

  const handleRestock = async (product) => {
    try {
      const updatedInventory = { ...product.inventory };
      ['XS', 'S', 'M', 'L', 'XL'].forEach(s => {
        updatedInventory[s] = (parseInt(updatedInventory[s]) || 0) + 10;
      });
      await saveProduct({ ...product, inventory: updatedInventory });
      loadData();
      showToast('Product restocked successfully!', 'success');
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

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
      showToast(`Order status updated to ${status}.`, "success");
    } catch (err) {
      showToast("Failed to update order status.", "error");
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
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
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
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
        <aside className={`w-64 fixed left-0 top-24 bottom-0 px-8 py-8 border-r border-outline-variant/10 z-40 bg-background transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="space-y-8 overflow-y-auto h-full pb-20">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline mb-6 font-semibold">Core Management</p>
              <ul className="space-y-4">
                <li onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Dashboard' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                  <span className="text-sm font-medium tracking-wide">Dashboard</span>
                </li>
                <li onClick={() => { setActiveTab('Products'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Products' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Products' ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
                  <span className="text-sm font-medium tracking-wide">Products</span>
                </li>
                <li onClick={() => { setActiveTab('Orders'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Orders' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Orders' ? "'FILL' 1" : "'FILL' 0" }}>shopping_cart</span>
                  <span className="text-sm font-medium tracking-wide">Orders</span>
                </li>
                <li onClick={() => { setActiveTab('Customers'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Customers' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Customers' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                  <span className="text-sm font-medium tracking-wide">Customer Feedback</span>
                </li>
                <li onClick={() => { setActiveTab('Coupons'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Coupons' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Coupons' ? "'FILL' 1" : "'FILL' 0" }}>local_activity</span>
                  <span className="text-sm font-medium tracking-wide">Coupons</span>
                </li>
                <li onClick={() => { setActiveTab('Refunds'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Refunds' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Refunds' ? "'FILL' 1" : "'FILL' 0" }}>currency_exchange</span>
                  <span className="text-sm font-medium tracking-wide">Refund Requests</span>
                </li>
                <li onClick={() => { setActiveTab('Notifications'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'Notifications' ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'Notifications' ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
                  <span className="text-sm font-medium tracking-wide flex-1">Notifications</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main className="flex-1 ml-0 md:ml-64 px-8 md:px-12 pb-20">
          <section className="py-10">
            <h1 className="font-headline text-4xl mb-2 text-on-surface">Azhagii {activeTab}</h1>
            <p className="text-on-surface-variant tracking-wide text-sm uppercase">Management Dashboard</p>
          </section>

          {activeTab === 'Dashboard' && (
            <div className="space-y-12">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">Total Earnings</h3>
                  <p className="font-headline text-3xl">₹{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">Payment Methods</h3>
                  <p className="text-sm">Online Orders: <span className="font-bold">{onlineOrders}</span></p>
                  <p className="text-sm">Offline Orders: <span className="font-bold">{offlineOrders}</span></p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5 flex gap-4 items-center">
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
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5">
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

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5">
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
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-2xl text-error flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span> Out of Stock Alerts
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
                          <button onClick={() => handleRestock(alert.product)} className="bg-on-surface text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
                            Restock (Add 10)
                          </button>
                          <button onClick={() => handleDelete(alert.product.$id)} className="bg-error text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-error/80 transition-colors">
                            Remove Product
                          </button>
                          <button onClick={() => handleDismissAlert(alert.alertId)} className="p-2 text-outline hover:text-on-surface">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
                <h3 className="font-headline text-2xl mb-6 text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined">inventory</span> Low Stock Alerts
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
                          <button onClick={() => handleRestock(alert.product)} className="bg-on-surface text-surface px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
                            Restock (Add 10)
                          </button>
                          <button onClick={() => handleDismissAlert(alert.alertId)} className="p-2 text-outline hover:text-on-surface">
                            <span className="material-symbols-outlined text-lg">close</span>
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
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-[10px] uppercase tracking-[0.15em] text-outline font-bold">
                      <th className="px-8 py-4">Image</th>
                      <th className="px-8 py-4">Name</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Price</th>
                      <th className="px-8 py-4">Inventory</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
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
                              <button onClick={() => handleDelete(id)} className="text-error hover:text-error-dim transition-colors material-symbols-outlined text-xl">delete</button>
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
            <section className="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-headline text-xl">Customer Orders</h3>
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-outline mr-2">Date:</label>
                    <input
                      type="date"
                      value={orderDateFilter}
                      onChange={(e) => setOrderDateFilter(e.target.value)}
                      className="bg-surface-container-low border-none rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-secondary outline-none text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-outline mr-2">Sort:</label>
                    <select
                      value={orderSort}
                      onChange={(e) => setOrderSort(e.target.value)}
                      className="bg-surface-container-low border-none rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-secondary outline-none text-on-surface"
                    >
                      <option value="asc">Oldest First</option>
                      <option value="desc">Newest First</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {orders.length === 0 ? (
                  <p className="text-sm text-outline">No orders have been placed yet.</p>
                ) : (
                  orders
                    .filter(order => {
                      if (!orderDateFilter) return true;
                      const orderDate = new Date(order.$createdAt).toISOString().split('T')[0];
                      return orderDate === orderDateFilter;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.$createdAt).getTime();
                      const dateB = new Date(b.$createdAt).getTime();
                      return orderSort === 'asc' ? dateA - dateB : dateB - dateA;
                    })
                    .map(order => {
                      const items = JSON.parse(order.items || '[]');
                      const addr = JSON.parse(order.shippingAddress || '{}');
                      return (
                        <div key={order.$id} className="border border-outline-variant/20 rounded-lg p-6 bg-surface-container-low/30">
                          <div className="flex justify-between items-start mb-6 border-b border-outline-variant/10 pb-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Order ID: {order.$id}</p>
                              <p className="text-sm font-bold mt-1 text-on-surface">{addr.fullName}</p>
                              <p className="text-sm text-on-surface-variant">{addr.address}, {addr.city} {addr.postalCode}</p>
                              <p className="text-xs font-bold uppercase tracking-widest text-secondary mt-2">Payment: {addr.paymentMethod || 'Cash on Delivery'}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold">{order.status}</span>
                              <p className="font-headline text-xl mt-1">₹{order.total.toFixed(2)}</p>

                              {order.status === 'Pending' && (
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleUpdateOrderStatus(order.$id, 'Shipped')} className="bg-on-surface text-surface px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Mark Shipped</button>
                                  <button onClick={() => handleUpdateOrderStatus(order.$id, 'Cancelled')} className="border border-error/50 text-error px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all">Cancel</button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                <img src={item.image} className="w-12 h-16 rounded object-cover border border-outline-variant/20" />
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-widest">{item.name}</p>
                                  <p className="text-xs text-outline mt-1">Size: {item.size} | Price: {item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
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
                            <span key={star} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${star <= review.rating ? 1 : 0}` }}>star</span>
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
                            <span className="material-symbols-outlined text-[14px]">reply</span> Reply to Customer
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
                  onClick={() => setIsCouponModalOpen(true)}
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
                          <p className="text-sm text-on-surface-variant">Discount: ₹{coupon.discountAmount} | Min Price: ₹{coupon.minPrice}</p>
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
                          }} className="text-error/50 hover:text-error hover:bg-error-container p-2 rounded-full transition-all">
                            <span className="material-symbols-outlined">delete</span>
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

              <div className="grid grid-cols-3 gap-6">
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Color</label>
                  <select name="color" className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none">
                    <option value="">Any</option>
                    <option value="Cream">Cream</option>
                    <option value="Blush">Blush</option>
                    <option value="Terra">Terra</option>
                    <option value="Soft Black">Soft Black</option>
                    <option value="Pure White">Pure White</option>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-3">Size Inventory *</label>
                  <div className="grid grid-cols-5 gap-4">
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <div key={size}>
                        <label className="block text-[10px] text-center font-bold mb-1">{size}</label>
                        <input type="number" min="0" value={inventory[size]} onChange={(e) => handleInventoryChange(size, e.target.value)} className="w-full bg-surface-container-low border-none rounded p-2 text-center text-sm outline-none" />
                      </div>
                    ))}
                  </div>
                </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Product Images (Max 3) *</label>
                <input name="images" type="file" accept="image/*" multiple required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
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
                  expiryDate: formData.get('expiryDate')
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
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Discount (₹) *</label>
                  <input name="discountAmount" type="number" min="1" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Min Price (₹) *</label>
                  <input name="minPrice" type="number" min="0" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" />
                </div>
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { fetchProducts, saveProduct, deleteProduct } from "@/lib/catalog";
import Link from "next/link";

export default function Admin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getUser();
        if (!user) {
          router.push('/account');
          return;
        }
        if (user.email !== 'madhu9940984501@gmail.com') {
          alert('Access Denied: You do not have administrator privileges.');
          router.push('/');
          return;
        }
        setIsAdmin(true);
        loadProducts();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  async function loadProducts() {
    try {
      const catalog = await fetchProducts();
      setProducts(catalog || {});
    } catch (e) {
      console.error(e);
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this dress?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    let price = formData.get('price');
    const size = formData.get('size');
    const img1 = formData.get('img1');
    const img2 = formData.get('img2');
    const img3 = formData.get('img3');

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!price.startsWith('₹')) price = '₹' + price;

    const newProduct = {
      id,
      name,
      price,
      size,
      image: img1,
      images: [img1, img2, img3],
      desc: `A newly added ${name} in size ${size}.`
    };

    try {
      await saveProduct(newProduct);
      e.target.reset();
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert('Failed to save product.');
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

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 px-12 py-6 bg-[#fbf9f7]/70 dark:bg-[#303331]/70 backdrop-blur-md flex justify-between items-center max-w-[1920px] mx-auto">
        <Link href="/" className="font-['Noto_Serif'] italic text-2xl tracking-tighter text-[#303331] dark:text-[#fbf9f7]">AZHAGII</Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 font-label uppercase tracking-[0.1em] text-xs">
            <Link className="text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/admin">Dashboard</Link>
            <Link className="text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/admin">Reports</Link>
            <Link className="text-[#303331] dark:text-[#fbf9f7] hover:text-[#7e572e] transition-colors duration-300" href="/admin">Settings</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/account"><span className="material-symbols-outlined cursor-pointer hover:text-secondary text-on-surface">person</span></Link>
            <span className="material-symbols-outlined cursor-pointer hover:text-secondary relative text-on-surface">
              notifications
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex pt-24 flex-grow">
        {/* Management Sidebar */}
        <aside className="w-64 fixed left-0 top-24 bottom-0 px-8 py-8 border-r border-outline-variant/10 hidden md:block z-40 bg-background">
          <nav className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline mb-6 font-semibold">Core Management</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-secondary group cursor-pointer">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                  <span className="text-sm font-medium tracking-wide">Sales Overview</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group cursor-pointer">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                  <span className="text-sm font-medium tracking-wide">Products</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group cursor-pointer">
                  <span className="material-symbols-outlined text-xl">shopping_cart</span>
                  <span className="text-sm font-medium tracking-wide">Orders</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group cursor-pointer">
                  <span className="material-symbols-outlined text-xl">group</span>
                  <span className="text-sm font-medium tracking-wide">Customers</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline mb-6 font-semibold">Marketing & Data</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group cursor-pointer">
                  <span className="material-symbols-outlined text-xl">confirmation_number</span>
                  <span className="text-sm font-medium tracking-wide">Coupons</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group cursor-pointer">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                  <span className="text-sm font-medium tracking-wide">Analytics</span>
                </li>
              </ul>
            </div>
          </nav>
          <div className="absolute bottom-12 left-8 right-8">
            <div className="p-4 bg-surface-container-low rounded-xl">
              <p className="text-xs font-semibold mb-1">Stock Alert</p>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">4 items are currently low in stock.</p>
              <div className="mt-3 w-full bg-outline-variant/20 h-1 rounded-full overflow-hidden">
                <div className="bg-error w-3/4 h-full"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 ml-0 md:ml-64 px-8 md:px-12 pb-20">
          <section className="py-10">
            <h1 className="font-headline text-4xl mb-2 text-on-surface">Azhagiii Performance</h1>
            <p className="text-on-surface-variant tracking-wide text-sm uppercase">Commercial Insights & Global Logistics</p>
          </section>

          {/* Sales Overview Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-lg font-medium">Revenue Trends</h3>
                  <p className="text-xs text-on-surface-variant">Last 30 days vs previous period</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> Current
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-outline-variant"></span> Target
                  </span>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                <div className="w-full bg-surface-container h-[40%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[65%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[55%] rounded-t-sm"></div>
                <div className="w-full bg-secondary h-[85%] rounded-t-sm relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹12.4k</div>
                </div>
                <div className="w-full bg-surface-container h-[70%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[90%] rounded-t-sm"></div>
                <div className="w-full bg-secondary/80 h-[100%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[60%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[75%] rounded-t-sm"></div>
                <div className="w-full bg-secondary h-[80%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[45%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container h-[65%] rounded-t-sm"></div>
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-outline tracking-tighter uppercase">
                <span>Week 01</span>
                <span>Week 02</span>
                <span>Week 03</span>
                <span>Week 04</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-medium mb-6">Top Categories</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1UhpsatoT5wFqF4erKE4zBAfR5nUoLRlD-8tM_8wUNY9ACpN_fa-0mdyJ5dzIj1IwsqxXZFZOvS1P-symoM2_FebWHZBzzogwrWTXUGIva0C5zXTkEjetl3fRYGQ-lLk7iBkudPVV-8D49Pi9J4EU4ASQ0QduV1VpjZ_SS6WBTb62eYi4e_BO-Hibz05WKTwM0tNd44IWCP3eGYepG6A7J7_P4fZbwvgLS7WZmRKpBG9alYbJQYhsaOV-Yu9RKGw7JajQyQoMX_A" alt="Evening Gowns" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Evening Gowns</p>
                        <p className="text-[10px] text-on-surface-variant">42% of total sales</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzi5u8a8RXR84Pyq-XUmxUcPLDBuBN3DYO3_nV6wyzdcf_qNEG6zT3nFk5G4KITAqKgQlSlksSD8LMDbjjLFmMrDFA3TlOowlTWz5Ha-KflQ7t3tpe4rZN_sq_SYOkxExF46EoGr3d6eBaQZCaND8ULeVRdKEatS4GaOfw_2oOs9qRisszCUcwOoHdQaqC5-rIcyssh6VrS5uAdghiQdsD0ZdNHWZmKV-oDnWpzbVJsa18eWAqquGYCK_3fP77lMNhCh7Id0-3Csw" alt="Ready-to-Wear" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Ready-to-Wear</p>
                        <p className="text-[10px] text-on-surface-variant">28% of total sales</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline">trending_flat</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbxeqJBPd4YarbZQCIC9Is3m80cUruwoZAZdrm6L3JJz81aJh10k0WuCTdUbCKrw-O4QSYJOQfuSc6oVCgXZbdHK6LnUfnwv5E-m7s7UhypeE5iJyNaFWYD3O6ipqAEpPPBlmOHzSubrMXxeB1fOMxlAtNCm4fAN8pT4-vQAkqbFsDA55fCVOYapnBMc4ZKtTMdeR1DIurM8fTIs8ljyo7kfBEOtzPfgzcpAaJeybWBu-8pu4uj6P9QTUT8dSehNlSMQyWtxTIA8M" alt="Accessories" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Accessories</p>
                        <p className="text-[10px] text-on-surface-variant">15% of total sales</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                  </div>
                </div>
              </div>
              <button className="mt-8 text-[11px] uppercase tracking-widest font-bold text-secondary border-b border-secondary/20 pb-1 self-start hover:border-secondary transition-all">View Full Report</button>
            </div>
          </section>

          <section className="mb-12">
            <div className="bg-error-container/10 border-l-4 border-error p-6 rounded-r-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-error mt-1">warning</span>
                <div>
                  <h4 className="font-bold text-on-error-container text-sm uppercase tracking-wide">Critical Inventory Alert</h4>
                  <p className="text-sm text-on-error-container/80">"Midnight Silk Wrap" and "Ivory Tea Dress" are below safety stock thresholds in London Hub.</p>
                </div>
              </div>
              <button className="bg-error text-on-error px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all">Restock Now</button>
            </div>
          </section>

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
                    <th className="px-8 py-4">Price</th>
                    <th className="px-8 py-4">Size</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {Object.keys(products).length === 0 ? (
                    <tr><td colSpan="5" className="px-8 py-5 text-center text-sm text-outline">No products found.</td></tr>
                  ) : (
                    Object.entries(products).map(([id, product]) => {
                      const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
                      const size = product.size || 'One Size';
                      return (
                        <tr key={id} className="group hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="w-12 h-16 rounded overflow-hidden bg-surface-container">
                              <img src={imgUrl} className="w-full h-full object-cover" alt={product.name} />
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-semibold">{product.name}</td>
                          <td className="px-8 py-5 text-sm">{product.price}</td>
                          <td className="px-8 py-5 text-sm text-outline">{size}</td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => handleDelete(id)} 
                              className="text-error hover:text-error-dim transition-colors material-symbols-outlined text-xl"
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>

      <footer className="w-full pt-20 pb-10 px-12 border-t border-[#303331]/5 bg-[#fbf9f7] dark:bg-[#1a1c1b] mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="md:col-span-1">
            <span className="font-['Noto_Serif'] text-xl mb-4 block">AZHAGII</span>
            <p className="text-[#5f5e5e] dark:text-[#7e572e] font-label text-sm tracking-wide opacity-80">
              A digital destination for curated luxury fashion and administrative excellence.
            </p>
          </div>
          <div className="md:col-span-1 flex flex-col gap-3 font-label text-sm tracking-wide">
            <h5 className="text-[#303331] font-bold uppercase text-[10px] mb-2">Internal Tools</h5>
            <Link className="text-[#5f5e5e] dark:text-[#7e572e] hover:text-[#303331] transition-all" href="/admin">Inventory</Link>
            <Link className="text-[#5f5e5e] dark:text-[#7e572e] hover:text-[#303331] transition-all" href="/admin">HR Portal</Link>
            <Link className="text-[#5f5e5e] dark:text-[#7e572e] hover:text-[#303331] transition-all" href="/admin">API Docs</Link>
          </div>
          <div className="md:col-span-1 flex flex-col gap-3 font-label text-sm tracking-wide">
            <h5 className="text-[#303331] font-bold uppercase text-[10px] mb-2">Legal</h5>
            <Link className="text-[#5f5e5e] dark:text-[#7e572e] hover:text-[#303331] transition-all" href="/admin">Privacy Policy</Link>
            <Link className="text-[#5f5e5e] dark:text-[#7e572e] hover:text-[#303331] transition-all" href="/admin">Cookie Settings</Link>
          </div>
          <div className="md:col-span-1">
            <h5 className="text-[#303331] font-bold uppercase text-[10px] mb-4">Systems Status</h5>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-label">All Nodes Operational</span>
            </div>
          </div>
        </div>
        <div className="mt-20 text-center text-[#5f5e5e] dark:text-[#7e572e] font-label text-[10px] tracking-[0.2em] opacity-60">
          © 2024 AZHAGII. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Add New Dress Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline text-xl">Add New Dress</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="material-symbols-outlined text-outline hover:text-on-surface"
              >
                close
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Dress Name *</label>
                  <input name="name" type="text" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. Silk Saree" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Price *</label>
                  <input name="price" type="text" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. ₹450" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Size *</label>
                <input name="size" type="text" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. XS, S, M, L" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 1 URL (Main) *</label>
                <input name="img1" type="url" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 2 URL *</label>
                <input name="img2" type="url" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 3 URL *</label>
                <input name="img3" type="url" required className="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="https://..." />
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface">Cancel</button>
                <button type="submit" className="bg-on-surface text-surface px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Save Dress</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

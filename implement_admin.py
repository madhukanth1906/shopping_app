import os
import re

# 1. Update catalog.js
catalog_content = """
const defaultCatalog = {
    "banarasi-saree": {
        "name": "Banarasi Saree",
        "price": "₹420",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDCY-Ime_BoGNLMJr891uAjy_m2hH9ep67EXxueXb10edQbKEMhMP0430dlHkeI8RGgNEi-eiJhA7R9UQX_KWh2_ZxUwihM0BWVaHSXTlrxJzstjl0ypRgP61qw1RcXU-LhV8iTLvR85KMSt3zjKH0kqzp_0bYA7Fv6aJRuCWbwR8pOhIniJYLh3Nkeew7gl4YytTBjxs_QJXqVK3A9pj7dQCEvNp9o9GIxUgce7GswXVwuRVgnUpU1jB2Be45kHrnWQLjPdVO6CPg",
        "desc": "A luxurious silk saree draped elegantly, perfect for any special occasion."
    },
    "embroidered-lehenga": {
        "name": "Embroidered Lehenga",
        "price": "₹385",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBrnUaiUtdZzkMe9n8KA7RH_Y0wGfJSTduT1iO0Fm4A5pCcKpXieoVYn9tjXYMaW_i4okmVxnRMO1rQx30fMvUk2-pyKitEw84is_19cFXrvfXwSdPAXL5Iq2-nILMnjp-scpe9XQ-axd-6H-yLnok3LQTySitNODF_gSzmsTkXX-XodzsRSewObu8SY_F-9dqGk2WUsxWkJT8dODg-hcCsFFdHtP-2yGTEp-S6tU7CeiU60jS4HXfJOK1idfvSBxHh1biWh1SmCvc",
        "desc": "Elegant beige and embroidered lehenga with delicate details for a modern festive look."
    },
    "chanderi-kurta-set": {
        "name": "Chanderi Kurta Set",
        "price": "₹590",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuB_eCVGH3rXDMC_AuGYBpCB-72kZHUllTQIeKZxV142tI6Iyu0MIh90JT8aenXdvFn71sybilBudKtMF_i2wNAeNme-bpkRyElcajd3LbzEDtmY1x5p9A854l0VLrGgo-1otiKiZlsNn4SrCUVc_ZN6aJwFy-mvgRyRXscIr8Tu-yRMIh8RAUJlDldnE-Vyu56bK5dPk-ztt5ysy_On0AOz6wWjeFdTvVvHRQNigMr4gwP42EX0o9zUqAMy8Qgh5LWa_Rk_3aOvFZw",
        "desc": "Sophisticated Chanderi kurta set in soft hues, providing unparalleled elegance."
    },
    "velvet-lehenga": {
        "name": "Velvet Lehenga",
        "price": "₹295",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAqaMEjS1zDGrWjLQgHzSflwJ5QCDAYQcs_3gDH0MqyYE8jCiIvJScAGSk6gtjeHP4bCSjTqI3fevJ44ujQdMXYKBmuzrJ97FmUqATswqz05pYSawN08k0JdOqBxRnuQmqq_mtQ_FHG3LtEduQNcjVH4MA28lg1otnsoauwZyg-5-KtNEZwQXsREGFXQgVpl_zennaMqnZ3E9DZvRgLh7BuAiy_hsba3oMkvd7QJvzITrh26G2GDHRPjMppfOejs-GGo1dlcTrnE80",
        "desc": "Dramatic high-fashion velvet lehenga with delicate lace details."
    },
    "banarasi-silk-saree": {
        "name": "Banarasi Silk Saree",
        "price": "₹320",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnQIY1k_xUciqxBKRWC06k2YELPZAbiOUA2-ZO-AlZueJwnUR5sAo8jGtHd1-_Zw3-nBC7hrPANOzxLO3Vj34D_auXhcAMQYhZuFmCzzz42cnglKDm312f8hkSZlPrGDUA58KWyK6WJnFk7208Fns7C51gJN_8dzmqEFvs_PubcSeB-fAArLkpdAWDpSLTzNKc6ujPaXIE0TKwSIMtjl0Qm4i2evi8z10hh4mBowXOqwJ4kKa4uJe-lqZZHIQmBQOY56TLNGVTHc",
        "desc": "Classic Banarasi Silk Saree featuring intricate weaves."
    },
    "pastel-embroidered-lehenga": {
        "name": "Pastel Embroidered Lehenga",
        "price": "₹285",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBtfeZCXw4_8Dn0IFUwEFEl_YlJUCApInOzi6yTRVI577MemwfBypk5FrGY6rCEFaBgVTqJPtC2qSbKwuTIU_iJnaav3_O5sIx8g8ROmuu56sQ4XfaPvijMJh8UWF2tid3RjETxv5TK5kKFphMLKbwZSnsohAB5J8TK_5C98A91OYreIYqQctDH21zzQ3zE49AXD8pUCQfWMDKC2o4ApvI3KNAJRZ1_JW7zqAS6GQcXQgT1g5uA79WEb43M7p0Y5S9iFkJ7slv5h7Y",
        "desc": "Delicate pastel embroidered lehenga perfect for summer resorts."
    },
    "georgette-anarkali": {
        "name": "Georgette Anarkali",
        "price": "₹550",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuA6IanlpsJnC81Y10jFvDns_Sn8F-dqxsKci43xcRGwbpTrOtuDGBgfv1sLYxtTDruLm6C_0HSHs55wFJxGm_lLq-mS-7Lk6zoQDJQYbvlC3L5kVGAFP36akrxlwbCAOF2T5nDdHxhk_uSIq4QH9zEwv3mdPS2kSjoAAwe1p2W5r4GAD-mE5peoDZIb15Z4EKxMhnxpA5gbccmASW8EavUu_dD2qWdrXtpskO8GMOyuM4_3l4Zfph_A02MUAOPoHEj_VKE5VSg_qfI",
        "desc": "Artisanal Georgette Anarkali, crafted with timeless craftsmanship."
    },
    "kanjeevaram-saree": {
        "name": "Kanjeevaram Saree",
        "price": "₹195",
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfTqNWbi1bV878mhbofCYi_52Sp8rALT_DW-yZlf3vHnPKoAgY-6pYkNMXwP-CAZrrRglrOXJhXZ-5j0FAJIlli5ZNlpxJv8xfx3VmeZxm1d0lB0_ar9Qa45wroqxq_5rxyir-Q83cNRRib3ECtJu72a61tjCNxsHnRB_uyPnBLXsLEXZowAbVmHc6JobaA5DP24j3JRI6xZH9CFWXk0eRPemwXE57dciGiI8MjVbMu1hWerIW1wXgQlVajTwjudB4uO-BS2JNcOc",
        "desc": "A beautiful Kanjeevaram Saree featuring timeless elegance."
    }
};

let ATELIER_CATALOG = {};
const stored = localStorage.getItem('ATELIER_CATALOG');
if (stored) {
    try {
        ATELIER_CATALOG = JSON.parse(stored);
    } catch(e) {
        ATELIER_CATALOG = defaultCatalog;
        localStorage.setItem('ATELIER_CATALOG', JSON.stringify(ATELIER_CATALOG));
    }
} else {
    ATELIER_CATALOG = defaultCatalog;
    localStorage.setItem('ATELIER_CATALOG', JSON.stringify(ATELIER_CATALOG));
}

window.ATELIER_CATALOG = ATELIER_CATALOG;

window.saveCatalog = function(newCatalog) {
    window.ATELIER_CATALOG = newCatalog;
    localStorage.setItem('ATELIER_CATALOG', JSON.stringify(window.ATELIER_CATALOG));
};
"""

with open('public/catalog.js', 'w', encoding='utf-8') as f:
    f.write(catalog_content)


# 2. Update admin.html
# We'll replace the "Order Management Table" with "Product Management"
# Look for: <section class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
admin_html_file = 'admin.html'
with open(admin_html_file, 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Replace the Order Table Section completely
order_section_pattern = re.compile(
    r'<!-- Order Management Table -->[\s\S]*?(?=</main>)',
    re.IGNORECASE
)

new_product_management_html = """<!-- Product Management Section -->
<section class="mb-12 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
    <div class="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
        <h3 class="serif text-xl">Product Inventory</h3>
        <button onclick="document.getElementById('add-dress-modal').classList.remove('hidden')" class="bg-on-surface text-surface px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Add New Dress</button>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-surface-container-low/50 text-[10px] uppercase tracking-[0.15em] text-outline font-bold">
                    <th class="px-8 py-4">Image</th>
                    <th class="px-8 py-4">Name</th>
                    <th class="px-8 py-4">Price</th>
                    <th class="px-8 py-4">Size</th>
                    <th class="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody id="admin-product-table" class="divide-y divide-outline-variant/5">
                <!-- Products will be injected here -->
            </tbody>
        </table>
    </div>
</section>

<!-- Add New Dress Modal -->
<div id="add-dress-modal" class="fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 class="serif text-xl">Add New Dress</h3>
            <button onclick="document.getElementById('add-dress-modal').classList.add('hidden')" class="material-symbols-outlined text-outline hover:text-on-surface">close</button>
        </div>
        <form id="add-dress-form" class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Dress Name *</label>
                    <input id="dress-name" type="text" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="e.g. Silk Saree">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Price *</label>
                    <input id="dress-price" type="text" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="e.g. ₹450">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Size *</label>
                <input id="dress-size" type="text" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="e.g. XS, S, M, L">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 1 URL (Main) *</label>
                <input id="dress-img1" type="url" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="https://...">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 2 URL *</label>
                <input id="dress-img2" type="url" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="https://...">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface mb-2">Image 3 URL *</label>
                <input id="dress-img3" type="url" required class="w-full bg-surface-container-low border-none rounded p-3 text-sm focus:ring-1 focus:ring-secondary" placeholder="https://...">
            </div>
            <div class="pt-4 flex justify-end gap-4">
                <button type="button" onclick="document.getElementById('add-dress-modal').classList.add('hidden')" class="px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface">Cancel</button>
                <button type="submit" class="bg-on-surface text-surface px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Save Dress</button>
            </div>
        </form>
    </div>
</div>

<script src="/catalog.js"></script>
<script>
    function renderAdminTable() {
        const tbody = document.getElementById('admin-product-table');
        tbody.innerHTML = '';
        const catalog = window.ATELIER_CATALOG;
        
        for (const [id, product] of Object.entries(catalog)) {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-surface-container-low/30 transition-colors';
            
            // Image
            const imgUrl = Array.isArray(product.images) ? product.images[0] : product.image;
            const size = product.size || 'One Size';
            
            tr.innerHTML = `
                <td class="px-8 py-5">
                    <div class="w-12 h-16 rounded overflow-hidden bg-surface-container">
                        <img src="${imgUrl}" class="w-full h-full object-cover" />
                    </div>
                </td>
                <td class="px-8 py-5 text-sm font-semibold">${product.name}</td>
                <td class="px-8 py-5 text-sm">${product.price}</td>
                <td class="px-8 py-5 text-sm text-outline">${size}</td>
                <td class="px-8 py-5 text-right">
                    <button onclick="deleteProduct('${id}')" class="text-error hover:text-error-dim transition-colors material-symbols-outlined text-xl">delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }

    function deleteProduct(id) {
        if(confirm('Are you sure you want to delete this dress?')) {
            const newCatalog = {...window.ATELIER_CATALOG};
            delete newCatalog[id];
            window.saveCatalog(newCatalog);
            renderAdminTable();
        }
    }

    document.getElementById('add-dress-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('dress-name').value;
        const price = document.getElementById('dress-price').value;
        const size = document.getElementById('dress-size').value;
        const img1 = document.getElementById('dress-img1').value;
        const img2 = document.getElementById('dress-img2').value;
        const img3 = document.getElementById('dress-img3').value;
        
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const newCatalog = {...window.ATELIER_CATALOG};
        newCatalog[id] = {
            id: id,
            name: name,
            price: price.startsWith('₹') ? price : '₹' + price,
            size: size,
            image: img1, // fallback
            images: [img1, img2, img3],
            desc: `A newly added ${name} in size ${size}.`
        };
        
        window.saveCatalog(newCatalog);
        
        // Reset and close
        this.reset();
        document.getElementById('add-dress-modal').classList.add('hidden');
        renderAdminTable();
    });

    document.addEventListener('DOMContentLoaded', () => {
        renderAdminTable();
    });
</script>
"""

admin_content = order_section_pattern.sub(new_product_management_html, admin_content)

with open(admin_html_file, 'w', encoding='utf-8') as f:
    f.write(admin_content)


# 3. Update shop.html
shop_html_file = 'shop.html'
with open(shop_html_file, 'r', encoding='utf-8') as f:
    shop_content = f.read()

# Replace everything inside <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8"> ... </div>
# with an id="shop-product-grid" and empty contents, plus inject the catalog.js script
grid_pattern = re.compile(
    r'(<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">)[\s\S]*?(</div>\s*<!-- Pagination -->)',
    re.IGNORECASE
)

new_grid_html = r"""\1
</div>
<script src="/catalog.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const grid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
        grid.innerHTML = ''; // clear any static items just in case
        
        for (const [id, product] of Object.entries(window.ATELIER_CATALOG)) {
            const imgUrl = Array.isArray(product.images) ? product.images[0] : product.image;
            const html = `
            <div class="product-card group cursor-pointer" onclick="window.location.href='/product.html?id=${id}'">
                <div class="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low rounded-lg">
                    <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div class="quick-shop-overlay absolute inset-0 flex items-end p-6 bg-gradient-to-t from-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="w-full py-4 bg-on-surface text-surface font-label text-[10px] uppercase tracking-widest rounded-full hover:bg-secondary transition-colors">View Details</button>
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-headline text-lg italic text-on-surface">${product.name}</h3>
                        <span class="font-headline text-sm">${product.price}</span>
                    </div>
                </div>
            </div>
            `;
            grid.innerHTML += html;
        }
    });
</script>
\2"""

shop_content = grid_pattern.sub(new_grid_html, shop_content)

with open(shop_html_file, 'w', encoding='utf-8') as f:
    f.write(shop_content)

# 4. Update product.html script to handle multiple images
product_html_file = 'product.html'
with open(product_html_file, 'r', encoding='utf-8') as f:
    product_content = f.read()

new_product_script = """
            // Update Main Image
            const mainImg = document.getElementById('main-image');
            const imgUrl1 = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
            if (mainImg) mainImg.src = imgUrl1;
            
            // Update Thumbnails
            const thumbs = document.querySelectorAll('img.thumb-image');
            thumbs.forEach((thumb, index) => {
                let tUrl = imgUrl1;
                if(Array.isArray(product.images) && product.images.length > index) {
                    tUrl = product.images[index];
                }
                thumb.src = tUrl;
            });
"""

product_content = re.sub(
    r'// Update Main Image[\s\S]*?// Update breadcrumb',
    new_product_script + '\n            // Update breadcrumb',
    product_content
)

with open(product_html_file, 'w', encoding='utf-8') as f:
    f.write(product_content)

print("Admin panel and dynamic shop successfully implemented!")

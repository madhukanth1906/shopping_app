import os
import re
import shutil

# Move image
src_image = r'C:\Users\dhara\.gemini\antigravity-ide\brain\d0fa1c56-c7ae-4663-a025-238f306292d2\saree_1782974307827.png'
dest_dir = r'g:\projects\shopping\the-atelier\public\assets'
dest_image = os.path.join(dest_dir, 'hero-saree.png')

os.makedirs(dest_dir, exist_ok=True)
if os.path.exists(src_image):
    shutil.copy2(src_image, dest_image)

html_files = ['index.html', 'shop.html', 'product.html', 'cart.html', 'account.html', 'admin.html']

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Hero Image in index.html
    if file == 'index.html':
        content = re.sub(
            r'src="https://lh3\.googleusercontent\.com/aida-public/AB6AXuB90KrcgNp9OAzlIJSWJpcX082oUtxSsn_sK0oNL7e2OMDwoPQ2xovdKiQvpcgaLNQbrHjrBnYMvbmjMDcaocLpGdA65zotaaOi5Z9eRRCNzQIdKhlFOPryRqSAlQ_Db6FblYwSuI3gtmoiGFrcGGZo4G7ZHuja-Z3CfaCGJfDW_YXFJmBAWOKPP5ZPHiKRtkJrTcnMx7pWAjJzua-oNTXDVyQCS8zroB41qIjJOEsOiC4cUgIEI5LcxeW-6g8IMr7_xjjZZky-BnI"',
            r'src="/assets/hero-saree.png"',
            content
        )

    # 2. Link Logo to Home
    content = re.sub(
        r'<span class="(font-\[\'Noto_Serif\'\] italic text-2xl tracking-tighter text-\[#303331\] dark:text-\[#fbf9f7\])">THE ATELIER</span>',
        r'<a href="/" class="\1">THE ATELIER</a>',
        content
    )
    
    # Also handle the logo in admin.html which might have different classes
    content = re.sub(
        r'<span class="(font-serif italic text-2xl tracking-tighter)">THE ATELIER</span>',
        r'<a href="/" class="\1">THE ATELIER</a>',
        content
    )

    # 3. Link Nav links
    content = re.sub(r'href="#"([^>]*)>New Arrivals</a>', r'href="/shop.html"\1>New Arrivals</a>', content)
    content = re.sub(r'href="#"([^>]*)>Shop</a>', r'href="/shop.html"\1>Shop</a>', content)
    content = re.sub(r'href="#"([^>]*)>Collections</a>', r'href="/shop.html"\1>Collections</a>', content)
    content = re.sub(r'href="#"([^>]*)>Editorial</a>', r'href="/shop.html"\1>Editorial</a>', content)
    
    # 4. Link Icons
    # Person icon
    content = re.sub(
        r'(<span class="material-symbols-outlined[^>]*>person</span>)',
        r'<a href="/account.html">\1</a>',
        content
    )
    # Heart icon
    content = re.sub(
        r'(<span class="material-symbols-outlined[^>]*>favorite</span>)',
        r'<a href="/shop.html">\1</a>',
        content
    )
    # Bag icon
    content = re.sub(
        r'(<span class="material-symbols-outlined[^>]*>shopping_bag</span>)',
        r'<a href="/cart.html">\1</a>',
        content
    )

    # 5. Link Hero Buttons (in index.html)
    if file == 'index.html':
        # Shop Now button
        content = re.sub(
            r'<button class="bg-on-surface text-surface px-10 py-4 rounded-full font-label uppercase tracking-widest text-xs hover:bg-secondary transition-all transform hover:scale-105">\s*Shop Now\s*</button>',
            r'<a href="/shop.html" class="bg-on-surface text-surface px-10 py-4 rounded-full font-label uppercase tracking-widest text-xs hover:bg-secondary transition-all transform hover:scale-105 inline-block text-center">\n                        Shop Now\n                    </a>',
            content
        )
        # New Arrivals button
        content = re.sub(
            r'<button class="bg-surface/20 backdrop-blur-sm text-surface border border-surface/30 px-10 py-4 rounded-full font-label uppercase tracking-widest text-xs hover:bg-surface/30 transition-all transform hover:scale-105">\s*New Arrivals\s*</button>',
            r'<a href="/shop.html" class="bg-surface/20 backdrop-blur-sm text-surface border border-surface/30 px-10 py-4 rounded-full font-label uppercase tracking-widest text-xs hover:bg-surface/30 transition-all transform hover:scale-105 inline-block text-center">\n                        New Arrivals\n                    </a>',
            content
        )

    # 6. Link shop/product page images and titles
    # "Shop Now" or generic anchor wrapping products
    # This is slightly complex, but let's make the "VIEW PRODUCT" buttons in product pages link to /product.html
    # In index.html, there might be 'href="#"' for shop items.
    # Replace all remaining 'href="#"' with 'href="/product.html"' just to be safe.
    content = content.replace('href="#"', 'href="/product.html"')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Navigation and hero image updated successfully.")

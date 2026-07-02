import os
import re

product_html = 'product.html'
if not os.path.exists(product_html):
    print("product.html not found!")
    exit(0)

with open(product_html, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add IDs to elements
# Title
content = re.sub(
    r'(<h2 class="font-headline text-4xl lg:text-5xl text-on-surface leading-tight mb-4">)',
    r'<h2 id="product-title" class="font-headline text-4xl lg:text-5xl text-on-surface leading-tight mb-4">',
    content
)

# Price
content = re.sub(
    r'(<span class="font-headline text-2xl text-on-surface">)₹420\.00(</span>)',
    r'\1<span id="product-price">₹420.00</span>\2',
    content
)

# Description (find The Aurelia Silk Slip...)
content = re.sub(
    r'<p>The Aurelia Silk Slip is a masterclass in minimalist luxury\. Crafted from heavy-weight 100% mulberry silk, it features a fluid silhouette that skims the body, creating an elegant, liquid-like drape\. Perfect for evening editorial looks or elevated everyday wear\.</p>',
    r'<p id="product-desc">The Aurelia Silk Slip is a masterclass in minimalist luxury. Crafted from heavy-weight 100% mulberry silk, it features a fluid silhouette that skims the body, creating an elegant, liquid-like drape. Perfect for evening editorial looks or elevated everyday wear.</p>',
    content
)

# Images
content = re.sub(
    r'(<img class="w-full h-auto aspect-\[3/4\] object-cover transition-transform duration-700 group-hover:scale-105"[^>]*src=")[^"]+(")',
    r'\1https://lh3.googleusercontent.com/aida-public/AB6AXuCy_Tf2881HZ4Va5_je0eDOMfxu4DOkHgriZHdWFrvZDX717wDuKml5lLW2TohggKWvE31xqQoq85-Nj5eGCYu5jQ8wU-jCT0xNzqj35iIjpoBHypujeKxaIFnzcndj5k8knzmg583VAhb3cOaABcrUyUWa6waTYxdUmxivUHNMncwSSTXUtAWP3jx83NJPNETLUWRLDagfFcWT98tKEqQNNJolppNlgmkXrSrM_XcFxLQVTOoMGiNM8n9o0qrhVHCl-onKsja8L0o"\2 id="main-image"',
    content
)

content = re.sub(
    r'(<img class="w-full h-full object-cover"[^>]*src=")[^"]+(")',
    r'\1https://lh3.googleusercontent.com/aida-public/AB6AXuCy_Tf2881HZ4Va5_je0eDOMfxu4DOkHgriZHdWFrvZDX717wDuKml5lLW2TohggKWvE31xqQoq85-Nj5eGCYu5jQ8wU-jCT0xNzqj35iIjpoBHypujeKxaIFnzcndj5k8knzmg583VAhb3cOaABcrUyUWa6waTYxdUmxivUHNMncwSSTXUtAWP3jx83NJPNETLUWRLDagfFcWT98tKEqQNNJolppNlgmkXrSrM_XcFxLQVTOoMGiNM8n9o0qrhVHCl-onKsja8L0o"\2 class="thumb-image w-full h-full object-cover"',
    content
)

# 2. Inject JS script before </body>
script = """
<script src="/catalog.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId && window.ATELIER_CATALOG && window.ATELIER_CATALOG[productId]) {
            const product = window.ATELIER_CATALOG[productId];
            
            // Update Title
            const titleEl = document.getElementById('product-title');
            if (titleEl) titleEl.textContent = product.name;
            
            // Update Price
            const priceEl = document.getElementById('product-price');
            if (priceEl) priceEl.textContent = product.price;
            
            // Update Description
            const descEl = document.getElementById('product-desc');
            if (descEl) descEl.textContent = product.desc;
            
            // Update Main Image
            const mainImg = document.getElementById('main-image');
            if (mainImg) mainImg.src = product.image;
            
            // Update Thumbnails
            const thumbs = document.querySelectorAll('img.thumb-image');
            thumbs.forEach(thumb => {
                thumb.src = product.image;
            });
            
            // Update breadcrumb
            const breadcrumb = document.querySelector('nav a[href="/product.html"]');
            if(breadcrumb) breadcrumb.textContent = product.name;
        }
    });
</script>
"""

content = content.replace('</body>', script + '\n</body>')

with open(product_html, 'w', encoding='utf-8') as f:
    f.write(content)

print("product.html updated successfully.")

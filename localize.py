import os
import re

replacements = {
    r'\$': '₹',
    r'The Silk Slip': 'Banarasi Silk Saree',
    r'Linen Midi': 'Embroidered Lehenga',
    r'Cotton Pleat': 'Chanderi Kurta Set',
    r'Embroidered White': 'Georgette Anarkali',
    r'Linen Shirt Dress': 'Kanjeevaram Saree',
    r'Evening Lace': 'Velvet Lehenga',
    r'Minimalist Black Evening Gown': 'Black Sequined Saree',
    r'minimalist black evening gown': 'black sequined saree',
    r'cream silk slip dress': 'rich red Banarasi saree',
    r'blush pink linen midi dress': 'pastel embroidered lehenga',
    r'cotton dress': 'kurta set',
    r'white embroidered sundress': 'white georgette anarkali',
    r'linen shirt dress': 'kanjeevaram saree',
    r'black structural gown': 'velvet lehenga',
    r'silk wrap dress': 'silk saree',
    r'beige midi dress': 'beige kurta set',
    r'chiffon dress': 'chiffon saree',
    r'satin slip dress': 'satin saree',
    r'red tiered dress': 'red lehenga',
}

# Image URL replacements (replacing Google user content URLs with Unsplash images for Indian clothing)
image_map = {
    # Replace various image URLs with these standard Unsplash URLs
    # Since we can't map exactly which URL is which without complex parsing,
    # we'll use a round-robin replacement for all googleusercontent images.
}

unsplash_images = [
    'https://images.unsplash.com/photo-1610030469983-98e550d61dc0?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733958-d15f00e96ce0?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617267156947-f316bf802118?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621315271772-28b1e3eb8cd5?auto=format&fit=crop&q=80'
]

html_files = ['index.html', 'shop.html', 'product.html', 'cart.html', 'account.html', 'admin.html']

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Text replacements
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    # Replace all aida-public images with Unsplash images in a round-robin
    def image_replacer(match):
        img_url = unsplash_images[image_replacer.counter % len(unsplash_images)]
        image_replacer.counter += 1
        return f'src="{img_url}"'
    image_replacer.counter = 0
    
    content = re.sub(r'src="https://lh3.googleusercontent.com/aida-public/[^"]+"', image_replacer, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Localization complete.")

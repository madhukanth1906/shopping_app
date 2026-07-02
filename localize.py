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
    # New additions from screenshot:
    r'The Seraphina Wrap': 'Banarasi Saree',
    r'Modern Muse Midi': 'Embroidered Lehenga',
    r'Aurelia Pleated Gown': 'Chanderi Kurta Set',
    r'Nocturnal Slip': 'Velvet Lehenga',
}

html_files = ['index.html', 'shop.html', 'product.html', 'cart.html', 'account.html', 'admin.html']

for file in html_files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Text replacements
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Text localization complete. Image URLs retained.")

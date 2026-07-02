import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        shop: 'shop.html',
        product: 'product.html',
        cart: 'cart.html',
        account: 'account.html',
        admin: 'admin.html'
      }
    }
  }
});

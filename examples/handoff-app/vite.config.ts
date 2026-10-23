import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // The product images (workshop/assets/products/*.png) are served from the
  // site root, so `products/banana.png` in products.json works as a URL.
  publicDir: fileURLToPath(new URL('../../workshop/assets', import.meta.url)),
  resolve: {
    // `file:../..` installs the package as a symlink to the repo root, which
    // has its own copy of React in its node_modules. Two Reacts break hooks,
    // so always use this app's copy.
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // products.json lives in workshop/assets, outside this app's folder.
    fs: { allow: [repoRoot] },
  },
});

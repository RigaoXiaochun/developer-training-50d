import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./frontend', import.meta.url));
const proxy = { '/api/training': 'http://127.0.0.1:4781' };
export default defineConfig({
  root,
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 4780, strictPort: true, proxy },
  preview: { host: '127.0.0.1', port: 4780, strictPort: true, proxy },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { static: root + '/index.html', vue: root + '/vue.html' },
    },
  },
});

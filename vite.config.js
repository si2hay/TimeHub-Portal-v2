import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/TimeHub-Portal-v2/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'), // Теперь в корне
        app: resolve(__dirname, 'pages/app.html'),
        admin: resolve(__dirname, 'pages/admin.html')
      }
    }
  },
  server: {
    port: 3000,
    cors: true
  }
});
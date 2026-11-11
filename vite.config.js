import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/TimeHub-Portal-v2/',
  define: {
    // Вшиваем дату сборки при каждом билде
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleString('ru-RU', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }))
  },
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
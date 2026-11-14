import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  // При сборке используем твой путь для GitHub Pages. Локально — корень.
  base: command === 'build' ? '/TimeHub-Portal-v2/' : '/',
  
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Volgograd'
    }))
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'pages/app.html'),
        admin: resolve(__dirname, 'pages/admin.html')
      }
    }
  },
  server: {
    port: 3000,
    cors: true
  }
}));
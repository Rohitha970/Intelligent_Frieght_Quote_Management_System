// vite.config.js - Updated & Cleaned
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // You only need this one now
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Make sure it doesn't accidentally remove /api
        // rewrite: (path) => path.replace(/^\/api/, ''), // DON'T DO THIS
      },
    },
  },
});
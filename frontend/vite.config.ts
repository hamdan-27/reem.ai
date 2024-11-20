import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': {
        target: 'https://bot.viewit.ae', // Your backend API
        changeOrigin: true, // Ensures the host header is updated to match the target
        rewrite: (path) => path.replace(/^\/chat/, ''), // Optional: rewrites the API path
      },
    },
  },
});

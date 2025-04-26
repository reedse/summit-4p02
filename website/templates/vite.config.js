import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '^/login': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.method === 'POST') return undefined;
          return req.url;
        }
      },
      '^/logout': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '^/sign-up': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  esbuild: {
    loader: 'jsx',
    include: /\.[jt]sx?$/
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});

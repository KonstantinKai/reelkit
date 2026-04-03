import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/example-react',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/cdn': {
        target: 'https://cdn.reelkit.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-RK-Token', process.env.VITE_CDN_TOKEN || '');
            proxyReq.setHeader('Origin', 'http://localhost:4200');
          });
        },
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Web Analytics for react-demo.reelkit.dev, added to the built page
// only: the dev server, which the e2e suite runs too, never reports to the live
// site. The token is public, it only names the site the views count for.
const cloudflareWebAnalytics = (): Plugin => ({
  name: 'cloudflare-web-analytics',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'script',
      attrs: {
        type: 'module',
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': '{"token": "f2f501d1210741028328ae5eb6f9bee6"}',
      },
      injectTo: 'head',
    },
  ],
});

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
            proxyReq.setHeader(
              'X-RK-Token',
              process.env['VITE_CDN_TOKEN'] || '',
            );
            proxyReq.setHeader('Origin', 'http://localhost:4200');
          });
        },
      },
    },
  },
  preview: {
    port: 4201,
    host: 'localhost',
  },
  plugins: [react(), cloudflareWebAnalytics()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

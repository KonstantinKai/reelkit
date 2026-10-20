import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Cloudflare Web Analytics for vue-demo.reelkit.dev, added to the built page
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
        'data-cf-beacon': '{"token": "7fe214528af24d1d8a7c57df77a1939a"}',
      },
      injectTo: 'head',
    },
  ],
});

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/example-vue',
  server: {
    port: 4220,
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
            proxyReq.setHeader('Origin', 'http://localhost:4220');
          });
        },
      },
    },
  },
  preview: {
    port: 4221,
    host: 'localhost',
  },
  plugins: [vue(), nxViteTsPaths(), cloudflareWebAnalytics()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

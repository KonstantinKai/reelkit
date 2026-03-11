import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/reelkit/' : '/',
  cacheDir: '../../node_modules/.vite/apps/docs',
  server: {
    port: 4206,
    host: 'localhost',
  },
  preview: {
    port: 4306,
    host: 'localhost',
  },
  build: {
    outDir: './dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));

/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import {
  asBeforeWriteFile,
  createSpecifierRewriter,
} from '../../scripts/lib/dtsSpecifiers.mjs';
import tsconfigPaths from 'vite-tsconfig-paths';

const beforeWriteFile = asBeforeWriteFile(
  createSpecifierRewriter({
    outDir: path.join(import.meta.dirname, 'dist'),
    srcDir: path.join(import.meta.dirname, 'src'),
  }),
);

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/reelkit-vue-stories-player',
  plugins: [
    vue(),
    tsconfigPaths({ projects: ['../../tsconfig.base.json'] }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
      beforeWriteFile,
    }),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: 'reelkit-vue-stories-player',
      fileName: 'index',
      formats: ['es' as const],
    },
    rollupOptions: {
      external: [
        'vue',
        '@reelkit/core',
        '@reelkit/vue',
        '@reelkit/stories-core',
        'lucide-vue-next',
      ],
    },
  },
  test: {
    name: 'reelkit-vue-stories-player',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/reelkit-vue-stories-player',
      provider: 'v8' as const,
    },
  },
}));

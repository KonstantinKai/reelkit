/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/reelkit-vue',
  plugins: [
    tsconfigPaths({ projects: ['../../tsconfig.base.json'] }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ tsconfigPaths({ projects: ['../../tsconfig.base.json'] }) ],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // The router adapter is a separate entry so the main entry never pulls
      // `vue-router`. An app without a router imports only `index`.
      entry: {
        index: 'src/index.ts',
        'vue-router-url-adapter': 'src/vue-router-url-adapter.ts',
      },
      formats: ['es' as const],
    },
    rollupOptions: {
      external: ['vue', '@reelkit/core', 'vue-router'],
    },
  },
  test: {
    name: 'reelkit-vue',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/reelkit-vue',
      provider: 'v8' as const,
    },
  },
}));

/// <reference types='vitest' />
import { defineConfig } from 'vite';
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
  cacheDir: '../../node_modules/.vite/packages/reelkit-stories-core',
  plugins: [
    tsconfigPaths({ projects: ['../../tsconfig.base.json'] }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
      beforeWriteFile,
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
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'reelkit-stories-core',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['@reelkit/core'],
    },
  },
  test: {
    name: 'reelkit-stories-core',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/reelkit-stories-core',
      provider: 'v8' as const,
    },
  },
}));

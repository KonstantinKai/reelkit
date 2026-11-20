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
  cacheDir: '../../node_modules/.vite/packages/reelkit-core',
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
      name: 'reelkit-core',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [],
    },
  },
  test: {
    name: 'reelkit-core',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    // A runtime spec proves nothing about a type: the transform strips types
    // before the test runs, so an expectation that a call must not compile
    // passes whether or not it does. These files are compiled instead of run.
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      // Its own project rather than the spec one, which pulls in every runtime
      // spec — those are compiled away before they run, so they carry type
      // errors nothing has ever reported, and they would arrive here as noise
      // from files this gate is not about.
      tsconfig: './tsconfig.test-d.json',
    },
    coverage: {
      reportsDirectory: '../../coverage/packages/reelkit-core',
      provider: 'v8' as const,
      exclude: ['**/index.ts', '**/noop.ts'],
    },
  },
}));

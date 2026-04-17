/// <reference types='vitest' />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

function reelkitVersionsPlugin(): Plugin {
  const virtualId = 'virtual:reelkit-versions';
  const resolvedId = '\0' + virtualId;
  const packagesDir = join(import.meta.dirname, '../../packages');

  const loadVersions = (): Record<string, string> => {
    const versions: Record<string, string> = {};
    for (const entry of readdirSync(packagesDir)) {
      const pkgPath = join(packagesDir, entry, 'package.json');
      try {
        if (!statSync(pkgPath).isFile()) continue;
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        if (pkg.name?.startsWith('@reelkit/') && pkg.version) {
          versions[pkg.name] = pkg.version;
        }
      } catch {
        // skip missing/unreadable package.json
      }
    }
    return versions;
  };

  return {
    name: 'reelkit-versions',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
      return null;
    },
    load(id) {
      if (id !== resolvedId) return null;
      const versions = loadVersions();
      return `export const REELKIT_VERSIONS = Object.freeze(${JSON.stringify(versions, null, 2)});\n`;
    },
    configureServer(server) {
      server.watcher.add(join(packagesDir, '*/package.json'));
      server.watcher.on('change', (path) => {
        if (path.startsWith(packagesDir) && path.endsWith('package.json')) {
          const mod = server.moduleGraph.getModuleById(resolvedId);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../node_modules/.vite/docs',
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
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    reelkitVersionsPlugin(),
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../dist/docs',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'docs',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/docs',
      provider: 'v8' as const,
    },
  },
}));

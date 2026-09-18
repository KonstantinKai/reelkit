/// <reference types='vitest' />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import mdx from '@mdx-js/rollup';
import { kDefaultLocale, kSiteOrigin } from './src/i18n/locale';
import { kSitePages } from './src/content/manifest';
import { renderSitemap, sitemapEntries } from './src/content/sitePages';
import {
  loadLlmsEntries,
  renderLlmsFullTxt,
  renderLlmsTxt,
  type LlmsEntry,
} from './src/content/llmsText';
import {
  kMdxComponentsPath,
  kMdxComponentsSpecifier,
  mdxOptions,
} from './mdx.config';

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

/**
 * Every llms.txt frontmatter `url` must name a docs page the site actually
 * routes. The page manifest is the route source, so the check reads it
 * rather than the route config. Privacy, terms and home are never backed by
 * an llms file, so only `docs/` pages count.
 */
function crossCheckRoutePaths(entries: LlmsEntry[]): void {
  const routeUrls = new Set(
    kSitePages
      .filter((page) => page.path.startsWith('docs/'))
      .map((page) => `${kSiteOrigin}/${page.path}`),
  );

  const missing: string[] = [];
  for (const entry of entries) {
    if (!routeUrls.has(entry.url)) {
      missing.push(`    - ${entry.url} (from content/<slug> = ${entry.slug})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      [
        '[llms-txt] content/frontmatter url has no matching page in src/content/manifest.ts:',
        ...missing,
        '  → either fix the frontmatter `url` or add the page to the manifest',
      ].join('\n'),
    );
  }
}

function crossCheckSitemap(entries: LlmsEntry[]): void {
  // The llms files are English-only by design, so a translated mirror has no
  // counterpart to drift from.
  const sitemapUrls = new Set(
    sitemapEntries()
      .filter((entry) => entry.locale === kDefaultLocale)
      .map((entry) => entry.url),
  );
  const llmsUrls = new Set(entries.map((e) => e.url));

  const missingInLlms: string[] = [];
  for (const url of sitemapUrls) {
    if (url === `${kSiteOrigin}/`) continue;
    if (!llmsUrls.has(url)) missingInLlms.push(url);
  }
  const missingInSitemap: string[] = [];
  for (const url of llmsUrls) {
    if (!sitemapUrls.has(url)) missingInSitemap.push(url);
  }
  if (missingInLlms.length > 0 || missingInSitemap.length > 0) {
    const lines: string[] = ['[llms-txt] sitemap/content drift:'];
    if (missingInLlms.length > 0) {
      lines.push(
        '  in sitemap.xml but no content/llms/*.md:',
        ...missingInLlms.map((u) => `    - ${u}`),
      );
    }
    if (missingInSitemap.length > 0) {
      lines.push(
        '  in content/llms/*.md but no sitemap.xml entry:',
        ...missingInSitemap.map((u) => `    - ${u}`),
      );
    }
    // Soft warn — drift is expected while pages still need their llms md
    // backfilled; surface in the dev/build log without blocking.
    console.warn(lines.join('\n'));
  }
}

/**
 * Serves `sitemap.xml` in dev and emits it at build, rendered from the page
 * manifest and the locale registry — there is no hand-kept copy under
 * `public/`.
 */
function reelkitSitemapPlugin(): Plugin {
  return {
    name: 'reelkit-sitemap',
    configureServer(server) {
      server.middlewares.use('/sitemap.xml', (_req, res) => {
        res.setHeader('content-type', 'application/xml; charset=utf-8');
        res.end(renderSitemap());
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: renderSitemap(),
      });
    },
  };
}

function reelkitLlmsTxtPlugin(): Plugin {
  const contentDir = join(import.meta.dirname, 'src/content/llms');

  const compose = (): { index: string; full: string; count: number } => {
    const entries = loadLlmsEntries(contentDir);
    crossCheckSitemap(entries);
    crossCheckRoutePaths(entries);
    return {
      index: renderLlmsTxt(entries),
      full: renderLlmsFullTxt(entries),
      count: entries.length,
    };
  };

  return {
    name: 'reelkit-llms-txt',
    apply() {
      return true;
    },
    configureServer(server) {
      const serve = (
        which: 'index' | 'full',
      ): ((
        req: import('node:http').IncomingMessage,
        res: import('node:http').ServerResponse,
      ) => void) => {
        return (_req, res) => {
          try {
            const { index, full } = compose();
            res.setHeader('content-type', 'text/plain; charset=utf-8');
            res.end(which === 'index' ? index : full);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('content-type', 'text/plain; charset=utf-8');
            res.end(String(err instanceof Error ? err.message : err));
          }
        };
      };
      server.middlewares.use('/llms.txt', serve('index'));
      server.middlewares.use('/llms-full.txt', serve('full'));
      server.watcher.add(contentDir);
    },
    generateBundle() {
      const { index, full, count } = compose();
      if (count === 0) {
        this.warn(
          `[llms-txt] no content files found at ${contentDir} — emitting empty llms.txt / llms-full.txt`,
        );
      }
      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: index,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'llms-full.txt',
        source: full,
      });
    },
  };
}

const _kIsTest = process.env['VITEST'] === 'true';

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
  resolve: {
    alias: { [kMdxComponentsSpecifier]: kMdxComponentsPath },
  },
  plugins: [
    // Content files must be JavaScript before the router plugin reads their
    // exports, so the MDX compiler goes first.
    { enforce: 'pre', ...mdx(mdxOptions) },
    reelkitVersionsPlugin(),
    reelkitSitemapPlugin(),
    reelkitLlmsTxtPlugin(),
    // The React Router plugin owns the app entry and the route module graph,
    // neither of which exists when Vitest imports a component directly — it
    // fails looking for its own preamble. Component tests get the plain React
    // transform instead.
    ...(_kIsTest ? [react()] : [reactRouter()]),
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
    setupFiles: ['./src/test-setup.ts'],
    // Vitest replaces every stylesheet import with an empty module unless
    // told otherwise, `?raw` included — and the CSS code samples on the docs
    // pages are exactly such imports.
    css: { include: [/content\/snippets\//] },
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/docs',
      provider: 'v8' as const,
    },
  },
}));

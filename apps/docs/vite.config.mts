/// <reference types='vitest' />
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
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

interface LlmsEntry {
  slug: string;
  title: string;
  url: string;
  section: string;
  order: number;
  desc: string;
  body: string;
}

const _kLlmsSiteTitle = 'Reelkit';
const _kLlmsTagline =
  'Headless, virtualized, TikTok-style vertical slider component library for React, Vue, and Angular. Zero dependencies in core; renders only 3 slides to the DOM at any time via virtualization.';
const _kLlmsIntro =
  'This file indexes the Reelkit documentation so LLM agents can consume it without scraping the React-rendered site. Each link points at the public docs URL; fetch `llms-full.txt` for the same index with embedded per-page summaries.';
const _kLlmsSectionOrder = [
  'Getting started',
  'Core',
  'React',
  'Vue',
  'Angular',
  'Meta',
];

function parseLlmsFile(path: string): LlmsEntry {
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(
      `[llms-txt] ${path}: missing or malformed YAML frontmatter (expected \`---\\n<keys>\\n---\\n<body>\`)`,
    );
  }
  const [, head, rest] = match;
  const meta: Record<string, string> = {};
  for (const line of head.split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[kv[1]] = value;
  }
  const required = ['title', 'url', 'section', 'desc'] as const;
  for (const key of required) {
    if (!meta[key]) {
      throw new Error(
        `[llms-txt] ${path}: missing required frontmatter key \`${key}\``,
      );
    }
  }
  const slug = basename(path).replace(/\.mdx?$/, '');
  const order = meta['order'] ? Number(meta['order']) : 999;
  if (Number.isNaN(order)) {
    throw new Error(
      `[llms-txt] ${path}: \`order\` must be numeric, got \`${meta['order']}\``,
    );
  }
  return {
    slug,
    title: meta['title'],
    url: meta['url'],
    section: meta['section'],
    order,
    desc: meta['desc'],
    body: rest.trim(),
  };
}

function loadLlmsEntries(contentDir: string): LlmsEntry[] {
  if (!existsSync(contentDir)) return [];
  // Skip caveman-compress backup files (`<slug>.original.md`) — they share
  // the same frontmatter as the live page and would emit a duplicate entry.
  const files = readdirSync(contentDir).filter(
    (f) => f.endsWith('.md') && !f.endsWith('.original.md'),
  );
  return files
    .map((f) => parseLlmsFile(join(contentDir, f)))
    .sort((a, b) => {
      const sa = _kLlmsSectionOrder.indexOf(a.section);
      const sb = _kLlmsSectionOrder.indexOf(b.section);
      const aa = sa === -1 ? _kLlmsSectionOrder.length : sa;
      const bb = sb === -1 ? _kLlmsSectionOrder.length : sb;
      if (aa !== bb) return aa - bb;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
}

/**
 * Extract the `docs/...` route paths declared in `src/routes.ts` so the
 * llms.txt frontmatter `url` values can be validated against the real
 * router config. Regex instead of AST keeps the plugin dependency-free.
 * We only surface routes under `docs/` — privacy, terms, index, and the
 * 404 wildcard are never backed by content md.
 */
function loadAppRoutePaths(appPath: string): string[] {
  if (!existsSync(appPath)) return [];
  const src = readFileSync(appPath, 'utf8');
  const paths: string[] = [];
  // React Router framework `route('docs/foo', '...')` calls.
  for (const m of src.matchAll(/route\(\s*['"]([^'"]+)['"]/g)) {
    const p = m[1].trim();
    if (p.startsWith('docs/')) paths.push(p);
  }
  return paths;
}

function crossCheckRoutePaths(
  appPath: string,
  entries: LlmsEntry[],
  origin: string,
): void {
  const routePaths = loadAppRoutePaths(appPath);
  if (routePaths.length === 0) return;
  const routeUrls = new Set(routePaths.map((p) => `${origin}/${p}`));

  const missing: string[] = [];
  for (const entry of entries) {
    if (!routeUrls.has(entry.url)) {
      missing.push(`    - ${entry.url} (from content/<slug> = ${entry.slug})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      [
        '[llms-txt] content/frontmatter url has no matching route in app.tsx:',
        ...missing,
        '  → either fix the frontmatter `url` or add the route to app/app.tsx',
      ].join('\n'),
    );
  }
}

function crossCheckSitemap(sitemapPath: string, entries: LlmsEntry[]): void {
  if (!existsSync(sitemapPath)) return;
  const xml = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = new Set<string>();
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapUrls.add(m[1].trim());
  }
  const llmsUrls = new Set(entries.map((e) => e.url));

  const missingInLlms: string[] = [];
  for (const url of sitemapUrls) {
    if (url === 'https://reelkit.dev/') continue;
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

function groupBySection(entries: LlmsEntry[]): Map<string, LlmsEntry[]> {
  const groups = new Map<string, LlmsEntry[]>();
  for (const e of entries) {
    const bucket = groups.get(e.section) ?? [];
    bucket.push(e);
    groups.set(e.section, bucket);
  }
  return groups;
}

function renderLlmsTxt(entries: LlmsEntry[]): string {
  const lines: string[] = [
    `# ${_kLlmsSiteTitle}`,
    '',
    `> ${_kLlmsTagline}`,
    '',
    _kLlmsIntro,
    '',
  ];
  const groups = groupBySection(entries);
  for (const section of _kLlmsSectionOrder) {
    const bucket = groups.get(section);
    if (!bucket || bucket.length === 0) continue;
    lines.push(`## ${section}`, '');
    for (const e of bucket) {
      lines.push(`- [${e.title}](${e.url}): ${e.desc}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderLlmsFullTxt(entries: LlmsEntry[]): string {
  const lines: string[] = [
    `# ${_kLlmsSiteTitle}`,
    '',
    `> ${_kLlmsTagline}`,
    '',
    _kLlmsIntro,
    '',
    'Each section below embeds the full hand-authored summary for every page — fetch this file instead of `llms.txt` when you want content inline.',
    '',
  ];
  const groups = groupBySection(entries);
  for (const section of _kLlmsSectionOrder) {
    const bucket = groups.get(section);
    if (!bucket || bucket.length === 0) continue;
    lines.push(`## ${section}`, '');
    for (const e of bucket) {
      lines.push(`### ${e.title}`);
      lines.push('');
      lines.push(`URL: ${e.url}`);
      lines.push('');
      lines.push(e.body);
      lines.push('');
    }
  }
  return lines.join('\n');
}

function reelkitLlmsTxtPlugin(): Plugin {
  const contentDir = join(import.meta.dirname, 'src/content/llms');
  const sitemapPath = join(import.meta.dirname, 'public/sitemap.xml');
  const appPath = join(import.meta.dirname, 'src/routes.ts');
  const _kOrigin = 'https://reelkit.dev';

  const compose = (): { index: string; full: string; count: number } => {
    const entries = loadLlmsEntries(contentDir);
    crossCheckSitemap(sitemapPath, entries);
    crossCheckRoutePaths(appPath, entries, _kOrigin);
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
    reelkitLlmsTxtPlugin(),
    reactRouter(),
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
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/docs',
      provider: 'v8' as const,
    },
  },
}));

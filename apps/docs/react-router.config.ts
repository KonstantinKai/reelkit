import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from '@react-router/dev/config';

/**
 * Read the public sitemap to derive the prerender route list. Single
 * source of truth — `public/sitemap.xml` already drives the
 * `reelkitLlmsTxtPlugin` cross-checks, so the SSG step inherits the
 * same set of URLs and stays aligned automatically.
 */
function readPrerenderRoutes(): string[] {
  const sitemapPath = join(import.meta.dirname, 'public/sitemap.xml');
  if (!existsSync(sitemapPath)) return ['/'];
  const xml = readFileSync(sitemapPath, 'utf8');
  const origin = 'https://reelkit.dev';
  const routes: string[] = [];
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = m[1].trim();
    if (!url.startsWith(origin)) continue;
    const path = url.slice(origin.length) || '/';
    routes.push(path);
  }
  // Always include the root.
  if (!routes.includes('/')) routes.push('/');
  return [...new Set(routes)];
}

export default {
  ssr: false,
  prerender: readPrerenderRoutes(),
  appDirectory: 'src',
} satisfies Config;

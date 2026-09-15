#!/usr/bin/env node
/**
 * Checks how a host serves the built docs site: every sitemap page, the
 * trailing-slash forms, a missing page, the plain-text files and a hashed
 * asset. Compares bodies with the local build when it is present.
 *
 *   node scripts/docs-probe.mjs <origin> [--dist apps/dist/docs]
 *
 * <origin> is where the site is served, for example http://localhost:8787 or
 * https://reelkit.dev. Sitemap entries always name https://reelkit.dev, so
 * each one is requested on <origin> under the same path and its canonical tag
 * must still name the production URL. Exits with 1 when any check fails.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const kProductionOrigin = 'https://reelkit.dev';

const args = process.argv.slice(2);
const origin = args.find((arg) => !arg.startsWith('--'))?.replace(/\/$/, '');
const distIndex = args.indexOf('--dist');
const dist = distIndex === -1 ? 'apps/dist/docs' : args[distIndex + 1];

if (!origin) {
  console.error('usage: node scripts/docs-probe.mjs <origin> [--dist <dir>]');
  process.exit(2);
}

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

async function get(path) {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
  const body = Buffer.from(await response.arrayBuffer());
  return {
    status: response.status,
    location: response.headers.get('location'),
    cacheControl: response.headers.get('cache-control') ?? '',
    body,
  };
}

const canonicalOf = (html) =>
  html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ??
  html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/i)?.[1] ??
  null;

/** Location header resolved against the probed origin, as a path. */
const locationPath = (location) =>
  location ? new URL(location, `${origin}/`).pathname : null;

const localFile = (path) => {
  const file = join(dist, path);
  return existsSync(file) ? readFileSync(file) : null;
};

// Every page the sitemap lists is served directly, as the page itself.
const sitemap = await get('/sitemap.xml');
check('sitemap.xml is served', sitemap.status === 200, `${sitemap.status}`);
const locs = [
  ...sitemap.body.toString('utf8').matchAll(/<loc>([^<]+)<\/loc>/g),
].map((match) => match[1]);
check('sitemap lists pages', locs.length > 0, `${locs.length} entries`);

let longCachedHtml = null;
for (const loc of locs) {
  const path = new URL(loc).pathname;
  const page = await get(path);
  const canonical = canonicalOf(page.body.toString('utf8'));
  const ok = page.status === 200 && canonical === loc;
  if (!ok) {
    check(
      `page ${path}`,
      false,
      `${page.status}${page.location ? ` → ${page.location}` : ''}, canonical ${canonical}`,
    );
  }
  const maxAge = Number(page.cacheControl.match(/max-age=(\d+)/)?.[1] ?? 0);
  if (maxAge > 3600 || /immutable/.test(page.cacheControl)) {
    longCachedHtml ??= `${path}: ${page.cacheControl}`;
  }
}
check(
  `all ${locs.length} sitemap pages answer 200 with their own canonical URL`,
  !results.some((result) => result.name.startsWith('page ')),
);
check(
  'pages are not cached for long',
  longCachedHtml === null,
  longCachedHtml ?? '',
);

// The slash form of a page leads to the page, in a single step.
for (const path of ['/docs/ssr/', '/uk/', '/zh/docs/getting-started/']) {
  const response = await get(path);
  const target = locationPath(response.location);
  const expected = path.replace(/\/$/, '');
  check(
    `${path} redirects to ${expected}`,
    response.status >= 300 && response.status < 400 && target === expected,
    `${response.status}${response.location ? ` → ${response.location}` : ''}`,
  );
}

// A page that does not exist says so.
const missing = await get('/docs/this-page-does-not-exist');
const notFoundFile = localFile('404.html');
check(
  'missing page answers 404 with the fallback page',
  missing.status === 404 &&
    (!notFoundFile || Buffer.compare(missing.body, notFoundFile) === 0),
  `${missing.status}`,
);

// Plain-text files arrive exactly as built.
for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt']) {
  const response = file === 'sitemap.xml' ? sitemap : await get(`/${file}`);
  const built = localFile(file);
  check(
    `${file} matches the build`,
    response.status === 200 &&
      (!built || Buffer.compare(response.body, built) === 0),
    `${response.status}${built ? '' : ', no local build to compare'}`,
  );
}

// A hashed asset is served as built and cached for good.
const assetsDir = join(dist, 'assets');
const asset = existsSync(assetsDir)
  ? readdirSync(assetsDir).find((name) => name.endsWith('.js'))
  : null;
if (asset) {
  const response = await get(`/assets/${asset}`);
  check(
    'hashed asset matches the build and is cached as immutable',
    response.status === 200 &&
      Buffer.compare(response.body, localFile(`assets/${asset}`)) === 0 &&
      /immutable/.test(response.cacheControl),
    `${response.status}, ${response.cacheControl || 'no cache-control'}`,
  );
} else {
  check('hashed asset', false, `no local build under ${dist}`);
}

const failed = results.filter((result) => !result.ok);
for (const { name, ok, detail } of results) {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? `  (${detail})` : ''}`);
}
console.log(
  `\n${origin}: ${results.length - failed.length} passed, ${failed.length} failed` +
    (origin === kProductionOrigin
      ? ''
      : ` (canonical URLs expected on ${kProductionOrigin})`),
);
process.exit(failed.length ? 1 : 0);

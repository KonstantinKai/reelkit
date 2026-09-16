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

// Asked for explicitly, because the edge also speaks Zstandard, which not
// every Node release can decode. Bodies arrive decoded either way, so the
// byte comparisons below hold whatever the transfer encoding was.
const kAcceptEncoding = 'br, gzip';

async function get(path, headers = {}) {
  const response = await fetch(`${origin}${path}`, {
    redirect: 'manual',
    headers: { 'Accept-Encoding': kAcceptEncoding, ...headers },
  });
  const body = Buffer.from(await response.arrayBuffer());
  return {
    status: response.status,
    location: response.headers.get('location'),
    cacheControl: response.headers.get('cache-control') ?? '',
    contentEncoding: response.headers.get('content-encoding') ?? '',
    vary: response.headers.get('vary') ?? '',
    setCookie: response.headers.get('set-cookie'),
    body,
  };
}

// Cloudflare injects its JavaScript detections script under this path into any
// page served without `no-transform`, Bot Fight Mode or not. The pages must
// reach the reader as built.
const kInjectedScript = '/cdn-cgi/challenge-platform';

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
let injectedPage = null;
for (const loc of locs) {
  const path = new URL(loc).pathname;
  const page = await get(path);
  const html = page.body.toString('utf8');
  if (html.includes(kInjectedScript)) injectedPage ??= path;
  const canonical = canonicalOf(html);
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
check(
  'no page carries an injected Cloudflare script',
  injectedPage === null,
  injectedPage ? `${kInjectedScript} in ${injectedPage}` : '',
);

// The home page decodes to exactly what was built. Its stylesheet, its scripts
// and the large text file travel compressed; the HTML itself does not, because
// `no-transform` on pages is what keeps the injected script out. A local
// runtime serves files as they are, so only a deployed host is held to the
// compression half.
{
  const home = await get('/');
  const builtHome = localFile('index.html');
  check(
    'home page matches the build once decoded',
    home.status === 200 &&
      (!builtHome || Buffer.compare(home.body, builtHome) === 0),
    `${home.status}${builtHome ? '' : ', no local build to compare'}`,
  );

  const html = home.body.toString('utf8');

  // The home demo's first slide is the page's largest paint. It has to be in
  // the HTML as an image fetched early, preloaded from the head, and small.
  for (const path of ['/', '/uk']) {
    const page = path === '/' ? home : await get(path);
    const pageHtml = page.body.toString('utf8');
    const slide = pageHtml.match(
      /<img[^>]*src="(\/assets\/slide-1-[^"]+)"[^>]*>/,
    );
    const preloaded =
      slide &&
      new RegExp(
        `<link[^>]*rel="preload"[^>]*as="image"[^>]*href="${slide[1]}"`,
      ).test(pageHtml);
    const image = slide ? await get(slide[1]) : null;
    check(
      `${path} ships its first demo slide as an early, preloaded, small image`,
      Boolean(
        slide &&
          /fetchpriority="high"/.test(slide[0]) &&
          !/loading="lazy"/.test(slide[0]) &&
          preloaded &&
          image?.status === 200 &&
          image.body.length <= 40 * 1024,
      ),
      slide
        ? `${slide[1]}, preload ${preloaded ? 'yes' : 'no'}, ${image?.body.length ?? 0} B`
        : 'no slide image in the HTML',
    );
  }

  const stylesheet = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
  const scripts = [...html.matchAll(/(?:href|src)="(\/assets\/[^"]+\.js)"/g)]
    .map((match) => match[1])
    .filter((path) => localFile(path.slice(1)));
  const largestScript = scripts.sort(
    (a, b) => localFile(b.slice(1)).length - localFile(a.slice(1)).length,
  )[0];

  const deployed = !/^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin);
  for (const [name, response] of [
    ['llms-full.txt', await get('/llms-full.txt')],
    ['stylesheet', stylesheet ? await get(stylesheet) : null],
    ['largest home script', largestScript ? await get(largestScript) : null],
  ]) {
    if (!response) {
      check(`${name} is compressed`, false, 'not found in the home page');
      continue;
    }
    check(
      `${name} is compressed`,
      !deployed || /^(br|gzip|zstd)$/.test(response.contentEncoding),
      deployed
        ? `content-encoding ${response.contentEncoding || 'none'}`
        : 'local runtime, not checked',
    );
  }
}

// Pages the sitemap leaves out are still prerendered and served directly.
for (const path of ['/privacy', '/terms']) {
  const page = await get(path);
  const canonical = canonicalOf(page.body.toString('utf8'));
  check(
    `unlisted page ${path} answers 200 with its own canonical URL`,
    page.status === 200 && canonical === `${kProductionOrigin}${path}`,
    `${page.status}, canonical ${canonical}`,
  );
}

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

// Language redirect: a browser that prefers a served language is sent there
// from an English page, once, without caching or a cookie. A remembered
// choice, a crawler, a prefixed page and a file are always left alone.
const kBrowser =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const reader = (extra) => ({ 'User-Agent': kBrowser, ...extra });

{
  const response = await get(
    '/docs/ssr?framework=vue',
    reader({ 'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8' }),
  );
  check(
    'English page redirects a Ukrainian browser to /uk, temporarily and uncached',
    response.status === 302 &&
      locationPath(response.location) === '/uk/docs/ssr' &&
      new URL(response.location, `${origin}/`).search === '?framework=vue' &&
      /accept-language/i.test(response.vary) &&
      /cookie/i.test(response.vary) &&
      /no-store/.test(response.cacheControl) &&
      !response.setCookie,
    `${response.status} → ${response.location}, vary ${response.vary}, cache ${response.cacheControl}`,
  );
}
{
  const response = await get('/', reader({ 'Accept-Language': 'zh-CN' }));
  check(
    'home redirects a Chinese browser to /zh',
    response.status === 302 && locationPath(response.location) === '/zh',
    `${response.status} → ${response.location}`,
  );
}
for (const [name, path, headers] of [
  [
    'remembered English choice',
    '/docs/ssr',
    reader({ 'Accept-Language': 'uk', Cookie: 'rk-locale=en' }),
  ],
  [
    'English browser',
    '/docs/ssr',
    reader({ 'Accept-Language': 'en-US,uk;q=0.5' }),
  ],
  [
    'crawler',
    '/docs/ssr',
    {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept-Language': 'uk',
    },
  ],
  ['prefixed page', '/zh/docs/ssr', reader({ 'Accept-Language': 'uk' })],
  ['sitemap', '/sitemap.xml', reader({ 'Accept-Language': 'uk' })],
]) {
  const response = await get(path, headers);
  check(
    `${name} is served without a language redirect`,
    response.status === 200,
    `${response.status}${response.location ? ` → ${response.location}` : ''}`,
  );
}
{
  const response = await get('/docs/ssr', reader({ 'Accept-Language': 'en' }));
  check(
    'English page served as built varies by language',
    response.status === 200 &&
      /accept-language/i.test(response.vary) &&
      /cookie/i.test(response.vary),
    `vary ${response.vary || 'none'}`,
  );
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

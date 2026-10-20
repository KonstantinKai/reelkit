import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kLocaleTags, kLocales } from './i18n/locale';

// `Meta`, `Links` and `Scripts` read the framework router context, which a
// plain render has no way to provide. Everything under test — the canonical
// and the alternate set — is built by `Layout` itself.
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  Meta: () => null,
  Links: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}));

// Both come from the mocked module so the router and `useLocation` share one
// context instance; importing the router from `react-router-dom` would give
// `Layout` a context its own `useLocation` never sees.
const { MemoryRouter } = await import('react-router');
const { Layout, links } = await import('./root');

function headOf(pathname: string) {
  const markup = renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <Layout>
        <div />
      </Layout>
    </MemoryRouter>,
  );
  return {
    lang: markup.match(/<html[^>]*\slang="([^"]+)"/)?.[1],
    canonical: markup.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
    originTrial: markup.match(
      /<meta http-equiv="origin-trial" content="([^"]+)"/,
    )?.[1],
    alternates: [
      ...markup.matchAll(
        /<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g,
      ),
    ].map(([, hrefLang, href]) => ({ hrefLang, href })),
  };
}

/** One entry per locale plus the x-default fallback. */
const expectedAlternates = kLocales.length + 1;

describe('document head', () => {
  it.each(kLocales)('tags the %s page with its own language', (locale) => {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    expect(headOf(`${prefix}/docs/ssr`).lang).toBe(kLocaleTags[locale]);
  });

  // A page canonicalised to another language is folded into that one, and its
  // alternate set never surfaces.
  it.each(kLocales)('canonicalises the %s page to itself', (locale) => {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    const expected =
      locale === 'en'
        ? 'https://reelkit.dev/docs/ssr'
        : `https://reelkit.dev/${locale}/docs/ssr`;
    expect(headOf(`${prefix}/docs/ssr`).canonical).toBe(expected);
  });

  // Search engines drop the whole set when a return link is missing, so every
  // page lists every locale — itself included.
  it.each(kLocales)('lists every locale on the %s page', (locale) => {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    const { alternates } = headOf(`${prefix}/docs/ssr`);
    expect(alternates).toHaveLength(expectedAlternates);
    for (const alternate of kLocales) {
      expect(
        alternates.some((link) => link.hrefLang === kLocaleTags[alternate]),
        `no alternate for "${alternate}"`,
      ).toBe(true);
    }
  });

  it('points x-default at the English page', () => {
    const { alternates } = headOf('/uk/docs/ssr');
    const fallback = alternates.find((link) => link.hrefLang === 'x-default');
    expect(fallback?.href).toBe('https://reelkit.dev/docs/ssr');
  });

  // Prerendering hands the layout a trailing slash while the sitemap lists
  // none; a canonical that disagrees names a second address for one page.
  it('normalises the trailing slash prerendering adds', () => {
    expect(headOf('/uk/docs/ssr/').canonical).toBe(
      'https://reelkit.dev/uk/docs/ssr',
    );
  });

  it('keeps the home page canonical on the site root', () => {
    expect(headOf('/').canonical).toBe('https://reelkit.dev/');
    expect(headOf('/uk').canonical).toBe('https://reelkit.dev/uk');
  });

  // The token is signed for one origin and one feature; a token pasted for
  // another site or trial would silently do nothing.
  it.each(['/', '/docs/llms', '/uk/docs/ssr', '/privacy'])(
    'carries the WebMCP origin trial token on %s',
    (pathname) => {
      const token = headOf(pathname).originTrial;
      expect(token).toBeTruthy();
      const signed = Buffer.from(token as string, 'base64');
      const payload = JSON.parse(
        signed.subarray(signed.indexOf('{')).toString('utf8'),
      );
      expect(payload).toMatchObject({
        origin: 'https://reelkit.dev:443',
        feature: 'WebMCP',
      });
    },
  );
});

describe('connection hints', () => {
  const preconnects = () => links().filter((link) => link.rel === 'preconnect');

  // The star count is a CORS fetch, and a connection warmed without
  // `crossorigin` would not be reused for it.
  it('warms the GitHub API connection the star button uses', () => {
    expect(preconnects()).toContainEqual({
      rel: 'preconnect',
      href: 'https://api.github.com',
      crossOrigin: 'anonymous',
    });
  });

  // Each hint opens a connection up front. Beyond a few they compete with
  // the page's own requests, and analytics or images the home page no longer
  // loads first do not earn one.
  it('keeps the hints to the few that speed up what readers see', () => {
    expect(preconnects().length).toBeLessThanOrEqual(4);
    const hosts = preconnects().map((link) => new URL(link.href).host);
    expect(hosts).not.toContain('static.cloudflareinsights.com');
    expect(hosts).not.toContain('cdn.reelkit.dev');
  });
});

describe('analytics', () => {
  const markup = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={['/docs/ssr']}>
        <Layout>
          <div />
        </Layout>
      </MemoryRouter>,
    );
  const beacons = (html: string) =>
    html.match(
      /<script[^>]*src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*>/g,
    ) ?? [];

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads the Cloudflare beacon once in a production build', () => {
    vi.stubEnv('PROD', true);
    const [beacon, ...more] = beacons(markup());

    expect(more).toHaveLength(0);
    expect(beacon).toContain('type="module"');
    expect(beacon).toContain(
      'data-cf-beacon="{&quot;token&quot;: &quot;67429e0d8e34477fb8e53f782d74f10a&quot;}"',
    );
  });

  // A dev server would otherwise report every local session to the live site.
  it('leaves the beacon out of the dev server', () => {
    vi.stubEnv('PROD', false);
    expect(beacons(markup())).toEqual([]);
  });

  // The privacy page is the reader's account of what the beacon does, so it
  // has to name the service and the host a blocker would stop.
  it('is the analytics the privacy page describes', () => {
    const privacy = readFileSync(
      join(import.meta.dirname, 'pages/Privacy.tsx'),
      'utf8',
    );
    expect(privacy).toContain('Cloudflare Web Analytics');
    expect(privacy).toContain('static.cloudflareinsights.com');
    expect(privacy).toContain('Core Web Vitals');
    expect(privacy.toLowerCase()).not.toContain('plausible');
    expect(privacy).not.toContain('StackBlitz Open');
  });

  it('carries nothing of the analytics it replaced', () => {
    vi.stubEnv('PROD', true);
    const html = markup();
    expect(html).not.toContain('plausible');
    expect(html).not.toContain('/js/p.js');
  });
});

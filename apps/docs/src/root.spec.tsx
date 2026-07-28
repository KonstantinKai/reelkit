import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
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
const { Layout } = await import('./root');

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
});

import {
  kDefaultLocale,
  kLocales,
  localeUrl,
  withLocale,
  type Locale,
} from '../i18n/locale';
import { kSitePages, type ChangeFrequency, type SitePage } from './manifest';

/**
 * Route module that serves a page in one locale, relative to the app
 * directory — the form React Router's route config expects. A docs page is
 * its content file; any other page is its page module, under the locale's
 * own folder outside English.
 */
export function pageFile(page: SitePage, locale: Locale): string {
  if (page.content !== undefined) {
    return `content/${locale}/${page.content}.mdx`;
  }
  if (page.module === undefined) {
    throw new Error(
      `Page "/${page.path}" names neither a content file nor a page module`,
    );
  }
  return locale === kDefaultLocale
    ? `pages/${page.module}`
    : `pages/${locale}/${page.module}`;
}

export interface SitemapEntry {
  locale: Locale;
  /** Prefixed path as the router and the prerenderer see it. */
  path: string;
  url: string;
  changefreq: ChangeFrequency;
  priority: string;
}

/** Every listed page in every locale, English first, then registry order. */
export function sitemapEntries(): SitemapEntry[] {
  return kLocales.flatMap((locale) =>
    kSitePages.flatMap((page) => {
      if (!page.sitemap) return [];
      const { englishOnly, changefreq, priority } = page.sitemap;
      if (englishOnly && locale !== kDefaultLocale) return [];
      const shared = `/${page.path}`;
      return [
        {
          locale,
          path: withLocale(locale, shared),
          url: localeUrl(locale, shared),
          changefreq,
          priority,
        },
      ];
    }),
  );
}

/** The `sitemap.xml` document served at the site root. */
export function renderSitemap(): string {
  const urls = sitemapEntries().map((entry) =>
    [
      '  <url>',
      `    <loc>${entry.url}</loc>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * Every English page path, `/` included, without a trailing slash. On the
 * Cloudflare host these are the only requests the edge script runs for;
 * everything else is served straight from the build.
 */
export function englishPagePaths(): string[] {
  return kSitePages.map((page) => (page.path === '' ? '/' : `/${page.path}`));
}

/**
 * Paths rendered to static HTML at build time: every page in every locale,
 * listed in the sitemap or not. A page left out would reach the reader as the
 * single-page fallback with a 404 status, and a crawler as an empty shell.
 */
export function prerenderPaths(): string[] {
  return kLocales.flatMap((locale) =>
    kSitePages.map((page) => withLocale(locale, `/${page.path}`)),
  );
}

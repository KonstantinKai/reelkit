import {
  kDefaultLocale,
  kLocales,
  localeUrl,
  withLocale,
  type Locale,
} from '../i18n/locale';
import { kSitePages, type ChangeFrequency, type SitePage } from './manifest';

/** Page module path for one locale, relative to the app directory. */
function moduleFile(module: string, locale: Locale): string {
  return locale === kDefaultLocale
    ? `pages/${module}`
    : `pages/${locale}/${module}`;
}

function hasContent(page: SitePage, locale: Locale): boolean {
  return (
    page.content !== undefined &&
    (page.contentLocales === undefined || page.contentLocales.includes(locale))
  );
}

/**
 * Route modules a page contributes in one locale, relative to the app
 * directory — the form React Router's route config expects. `main` serves
 * the page at its path; `legacy`, when present, is the page module a content
 * file replaced, still mounted at `<path>-legacy`.
 */
export function pageFiles(
  page: SitePage,
  locale: Locale,
): { main: string; legacy: string | null } {
  if (hasContent(page, locale)) {
    return {
      main: `content/${locale}/${page.content}.mdx`,
      legacy: page.module ? moduleFile(page.module, locale) : null,
    };
  }
  if (!page.module) {
    throw new Error(
      `Page "/${page.path}" has no content file for "${locale}" and no page module to fall back to`,
    );
  }
  return { main: moduleFile(page.module, locale), legacy: null };
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
      const shared = `/${page.path}`;
      return [
        {
          locale,
          path: withLocale(locale, shared),
          url: localeUrl(locale, shared),
          ...page.sitemap,
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
 * Paths rendered to static HTML at build time. The static host has no
 * rewrites, so a listed page that is not prerendered would answer with the
 * single-page fallback and a 404 status.
 */
export function prerenderPaths(): string[] {
  return sitemapEntries().map((entry) => entry.path);
}

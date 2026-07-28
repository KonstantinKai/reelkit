/**
 * URL-derived locale. English keeps the original unprefixed paths so every
 * existing link, bookmark and search-engine result stays valid; every other
 * language mirrors the same tree under its own prefix.
 *
 * This list and the records below it are the whole locale registry. Adding a
 * language is a data change here plus its own content — the switcher, the
 * hreflang set and the canonical builder all read from these, so none of them
 * grows a branch per language.
 */
export const kLocales = ['en', 'uk', 'zh'] as const;

export type Locale = (typeof kLocales)[number];

export const kDefaultLocale: Locale = 'en';

/**
 * BCP 47 tag used for `<html lang>` and `hreflang`. Ukrainian stays
 * unregioned: `uk-UA` would scope the page to one country, and the docs are
 * written for anyone who reads the language.
 */
export const kLocaleTags: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
  uk: 'uk',
};

/** Name of each language, written in that language. */
export const kLocaleNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  uk: 'Українська',
};

const _kPrefixes: Record<Locale, string> = {
  en: '',
  zh: '/zh',
  uk: '/uk',
};

/** URL prefix for a locale — empty for English, `/zh` or `/uk` otherwise. */
export function localePrefix(locale: Locale): string {
  return _kPrefixes[locale];
}

function isLocale(value: string): value is Locale {
  return (kLocales as readonly string[]).includes(value);
}

/**
 * Which locale a pathname belongs to. Anything that does not open with a
 * known prefix is English, so unknown paths fall through to the English
 * not-found page rather than a locale guess.
 */
export function readLocaleFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) && first !== kDefaultLocale ? first : kDefaultLocale;
}

/**
 * Drop the locale prefix, leaving the shared path that identifies a page
 * across locales. `/zh/docs/ssr` and `/docs/ssr` both yield `/docs/ssr`.
 *
 * A trailing slash goes too. Prerendering hands the root layout `/docs/ssr/`
 * while the sitemap lists `/docs/ssr`, and a canonical that disagrees with
 * the sitemap points search engines at a second address for one page.
 */
export function stripLocaleFromPath(pathname: string): string {
  const locale = readLocaleFromPath(pathname);
  const rest =
    locale === kDefaultLocale
      ? pathname
      : pathname.slice(localePrefix(locale).length);
  const trimmed = rest.endsWith('/') ? rest.slice(0, -1) : rest;
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Point a shared path at one locale. Accepts an already-prefixed path so
 * callers can re-target a link without stripping it first.
 */
export function withLocale(locale: Locale, pathname: string): string {
  const shared = stripLocaleFromPath(pathname);
  const prefix = localePrefix(locale);
  if (!prefix) return shared;
  return shared === '/' ? prefix : `${prefix}${shared}`;
}

/**
 * Re-target a full location — path, query string and hash — at another
 * locale. The query string carries the live `?framework=` contract read by
 * the bootstrap script in `root.tsx`, and the hash carries the section a
 * reader is looking at, so both survive the switch.
 */
export function withLocaleLocation(
  locale: Locale,
  location: { pathname: string; search?: string; hash?: string },
): string {
  return `${withLocale(locale, location.pathname)}${location.search ?? ''}${
    location.hash ?? ''
  }`;
}

const _kOrigin = 'https://reelkit.dev';

/** Absolute URL of a shared path in one locale, for canonical and hreflang. */
export function localeUrl(locale: Locale, pathname: string): string {
  const path = withLocale(locale, pathname);
  return path === '/' ? `${_kOrigin}/` : `${_kOrigin}${path}`;
}

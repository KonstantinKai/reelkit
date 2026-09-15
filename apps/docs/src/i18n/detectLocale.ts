import {
  kDefaultLocale,
  kLocaleTags,
  kLocales,
  withLocale,
  type Locale,
} from './locale';
import { readLocalePreference } from './localePreference';
import { englishPagePaths } from '../content/sitePages';

export interface LocaleRequest {
  /** Request path, without a trailing slash; the asset layer strips it. */
  pathname: string;
  /** Query string including its leading `?`, or empty. */
  search: string;
  acceptLanguage: string | null;
  cookie: string | null;
  userAgent: string | null;
}

/**
 * Crawlers and link-preview fetchers index and quote the English page they
 * asked for. Redirecting them by a guessed language would hide that page, so
 * anything that names itself one of these is never redirected.
 */
const _kAutomatedClient =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|lighthouse|headless|curl|wget|python-requests|node-fetch/i;

const _kEnglishPages = new Set(englishPagePaths());

/** The site's locale for one Accept-Language tag, by its primary subtag. */
function localeForTag(tag: string): Locale | null {
  const primary = tag.split('-')[0].toLowerCase();
  return (
    kLocales.find(
      (locale) => kLocaleTags[locale].split('-')[0].toLowerCase() === primary,
    ) ?? null
  );
}

/**
 * The first supported language in an Accept-Language header, by quality and
 * then by the order the browser listed them. Wildcards, malformed entries
 * and languages with a quality of zero say nothing about a preference.
 */
export function preferredLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const ranked = acceptLanguage
    .split(',')
    .map((entry, order) => {
      const [tag, ...params] = entry.trim().split(';');
      const qualityParam = params
        .map((param) => param.trim())
        .find((param) => param.startsWith('q='));
      const quality = qualityParam ? Number(qualityParam.slice(2)) : 1;
      return { tag: tag.trim(), quality, order };
    })
    .filter(
      ({ tag, quality }) =>
        /^[a-z]{1,8}(-[a-z0-9]{1,8})*$/i.test(tag) &&
        Number.isFinite(quality) &&
        quality > 0 &&
        quality <= 1,
    )
    .sort((a, b) => b.quality - a.quality || a.order - b.order);
  for (const { tag } of ranked) {
    const locale = localeForTag(tag);
    if (locale) return locale;
  }
  return null;
}

/**
 * Where a first-time reader of an English page should land instead, or
 * `null` to serve the English page as asked.
 *
 * A remembered choice from the language switcher always wins, English
 * included. Automated clients, pages outside the English page set and
 * readers whose browser prefers English, or no language the site serves,
 * stay where they are.
 */
export function detectLocale(request: LocaleRequest): string | null {
  if (readLocalePreference(request.cookie)) return null;
  if (!request.userAgent || _kAutomatedClient.test(request.userAgent)) {
    return null;
  }
  if (!_kEnglishPages.has(request.pathname)) return null;
  const locale = preferredLocale(request.acceptLanguage);
  if (!locale || locale === kDefaultLocale) return null;
  return `${withLocale(locale, request.pathname)}${request.search}`;
}

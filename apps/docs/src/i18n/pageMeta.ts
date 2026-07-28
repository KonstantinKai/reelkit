import { localeUrl, type Locale } from './locale';

interface LocalePageMetaOptions {
  /** Shared, unprefixed path of the page — `/docs/ssr`, not `/zh/docs/ssr`. */
  path: string;
  title: string;
  description: string;
}

/**
 * Open Graph carries a language_TERRITORY pair, so it needs a region even
 * where the page's own language tag deliberately has none.
 */
const _kOpenGraphLocales: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  uk: 'uk_UA',
};

/**
 * Meta descriptors for a translated page.
 *
 * A route's `meta` export replaces the root export rather than merging with
 * it, so this repeats the document-level tags the root supplies. Everything
 * that describes the page itself — title, description, social cards — comes
 * back in the page's own language and points at that language's URL.
 */
export function localePageMeta(
  locale: Locale,
  { path, title, description }: LocalePageMetaOptions,
) {
  const url = localeUrl(locale, path);
  const image = 'https://reelkit.dev/og-image.png';

  return [
    { charSet: 'utf-8' },
    { title },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: 'ReelKit' },
    { property: 'og:locale', content: _kOpenGraphLocales[locale] },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];
}

/** Meta descriptors for a Chinese page. */
export function zhPageMeta(options: LocalePageMetaOptions) {
  return localePageMeta('zh', options);
}

/** Meta descriptors for a Ukrainian page. */
export function ukPageMeta(options: LocalePageMetaOptions) {
  return localePageMeta('uk', options);
}

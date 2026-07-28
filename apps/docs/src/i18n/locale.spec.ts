import { describe, expect, it } from 'vitest';
import {
  kLocaleNames,
  kLocaleTags,
  kLocales,
  localePrefix,
  localeUrl,
  readLocaleFromPath,
  stripLocaleFromPath,
  withLocale,
  withLocaleLocation,
} from './locale';

describe('locale helpers', () => {
  it('treats unprefixed paths as English', () => {
    expect(readLocaleFromPath('/')).toBe('en');
    expect(readLocaleFromPath('/docs/ssr')).toBe('en');
  });

  it('reads the Chinese locale from the path prefix', () => {
    expect(readLocaleFromPath('/zh')).toBe('zh');
    expect(readLocaleFromPath('/zh/docs/ssr')).toBe('zh');
  });

  it('does not mistake a page whose slug starts with the prefix', () => {
    expect(readLocaleFromPath('/zhuangzi')).toBe('en');
  });

  it('strips the prefix down to the shared path', () => {
    expect(stripLocaleFromPath('/zh/docs/ssr')).toBe('/docs/ssr');
    expect(stripLocaleFromPath('/zh')).toBe('/');
    expect(stripLocaleFromPath('/docs/ssr')).toBe('/docs/ssr');
  });

  // Prerendering hands the layout a trailing slash; the sitemap has none.
  it('normalises the trailing slash prerendering adds', () => {
    expect(stripLocaleFromPath('/docs/ssr/')).toBe('/docs/ssr');
    expect(stripLocaleFromPath('/zh/docs/ssr/')).toBe('/docs/ssr');
    expect(stripLocaleFromPath('/zh/')).toBe('/');
    expect(localeUrl('en', '/docs/ssr/')).toBe('https://reelkit.dev/docs/ssr');
    expect(localeUrl('zh', '/zh/docs/ssr/')).toBe(
      'https://reelkit.dev/zh/docs/ssr',
    );
  });

  it('leaves English paths byte-identical when re-targeted', () => {
    for (const path of ['/', '/docs/ssr', '/privacy']) {
      expect(withLocale('en', path)).toBe(path);
    }
  });

  it('round-trips a path through both locales', () => {
    const path = '/docs/react/api';
    expect(withLocale('en', withLocale('zh', path))).toBe(path);
  });

  it('preserves search params and hash across a locale switch', () => {
    const location = {
      pathname: '/docs/reel-player',
      search: '?framework=vue',
      hash: '#props',
    };
    expect(withLocaleLocation('zh', location)).toBe(
      '/zh/docs/reel-player?framework=vue#props',
    );
    expect(
      withLocaleLocation('en', {
        ...location,
        pathname: '/zh/docs/reel-player',
      }),
    ).toBe('/docs/reel-player?framework=vue#props');
  });

  it('builds same-language absolute URLs', () => {
    expect(localeUrl('en', '/docs/ssr')).toBe('https://reelkit.dev/docs/ssr');
    expect(localeUrl('zh', '/docs/ssr')).toBe(
      'https://reelkit.dev/zh/docs/ssr',
    );
    expect(localeUrl('en', '/')).toBe('https://reelkit.dev/');
    expect(localeUrl('zh', '/')).toBe('https://reelkit.dev/zh');
  });

  it('reads the Ukrainian locale from the path prefix', () => {
    expect(readLocaleFromPath('/uk')).toBe('uk');
    expect(readLocaleFromPath('/uk/docs/ssr')).toBe('uk');
    expect(stripLocaleFromPath('/uk/docs/ssr')).toBe('/docs/ssr');
    expect(localeUrl('uk', '/docs/ssr')).toBe(
      'https://reelkit.dev/uk/docs/ssr',
    );
  });

  // A page named `ukraine` is English prose, not the Ukrainian tree.
  it('does not mistake an English slug that opens with a locale prefix', () => {
    expect(readLocaleFromPath('/ukraine')).toBe('en');
  });

  it('has a language tag, a name and a prefix for every locale', () => {
    for (const locale of kLocales) {
      expect(kLocaleTags[locale]).toBeTruthy();
      expect(kLocaleNames[locale]).toBeTruthy();
      expect(typeof localePrefix(locale)).toBe('string');
    }
  });

  // A region subtag would scope the page to one country; the docs are for
  // anyone who reads the language.
  it('tags Ukrainian without a region', () => {
    expect(kLocaleTags.uk).toBe('uk');
  });

  it('gives every non-English locale its own prefix', () => {
    const prefixes = kLocales
      .filter((locale) => locale !== 'en')
      .map(localePrefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    expect(prefixes.every((prefix) => prefix.startsWith('/'))).toBe(true);
  });
});

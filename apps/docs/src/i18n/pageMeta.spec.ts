import { describe, expect, it } from 'vitest';
import { kLocales } from './locale';
import { localePageMeta, ukPageMeta, zhPageMeta } from './pageMeta';

const options = {
  path: '/docs/ssr',
  title: 'Заголовок',
  description: 'Опис',
};

type MetaEntry = Record<string, string | undefined>;

function contentOf(
  meta: ReturnType<typeof localePageMeta>,
  key: 'property' | 'name',
  value: string,
) {
  return (meta as MetaEntry[]).find((item) => item[key] === value)?.content;
}

describe('page meta', () => {
  // A page canonicalised or advertised at another language's address is
  // deduplicated out of the index, taking its hreflang set with it.
  it('points the page URL at the locale that owns it', () => {
    expect(contentOf(localePageMeta('uk', options), 'property', 'og:url')).toBe(
      'https://reelkit.dev/uk/docs/ssr',
    );
    expect(contentOf(localePageMeta('zh', options), 'property', 'og:url')).toBe(
      'https://reelkit.dev/zh/docs/ssr',
    );
    expect(contentOf(localePageMeta('en', options), 'property', 'og:url')).toBe(
      'https://reelkit.dev/docs/ssr',
    );
  });

  // Open Graph wants a region even where the language tag has none.
  it('stamps the Ukrainian Open Graph locale', () => {
    expect(
      contentOf(localePageMeta('uk', options), 'property', 'og:locale'),
    ).toBe('uk_UA');
  });

  it('carries the page title and description into the social tags', () => {
    const meta = localePageMeta('uk', options);
    expect(contentOf(meta, 'property', 'og:title')).toBe(options.title);
    expect(contentOf(meta, 'name', 'twitter:description')).toBe(
      options.description,
    );
    expect(contentOf(meta, 'name', 'description')).toBe(options.description);
  });

  it('has an Open Graph locale for every language', () => {
    for (const locale of kLocales) {
      expect(
        contentOf(localePageMeta(locale, options), 'property', 'og:locale'),
        `Open Graph locale for "${locale}"`,
      ).toBeTruthy();
    }
  });

  it('gives the per-language helpers the same output as the general one', () => {
    expect(zhPageMeta(options)).toEqual(localePageMeta('zh', options));
    expect(ukPageMeta(options)).toEqual(localePageMeta('uk', options));
  });
});

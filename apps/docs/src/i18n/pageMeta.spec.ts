import { describe, expect, it } from 'vitest';
import { kLocales } from './locale';
import { localePageMeta, pageMeta } from './pageMeta';

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
    expect(contentOf(localePageMeta('pt', options), 'property', 'og:url')).toBe(
      'https://reelkit.dev/pt/docs/ssr',
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

  it('stamps the Brazilian Open Graph locale for Portuguese', () => {
    expect(
      contentOf(localePageMeta('pt', options), 'property', 'og:locale'),
    ).toBe('pt_BR');
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

  // A content file names no locale and no path; both come from the address
  // the prerenderer hands the route, trailing slash included.
  it('reads the locale and the page path from the rendered address', () => {
    const frontmatter = { title: 'Заголовок', description: 'Опис' };
    const meta = pageMeta(frontmatter, {
      location: { pathname: '/uk/docs/ssr/' },
    });
    expect(meta).toEqual(
      localePageMeta('uk', {
        path: '/docs/ssr',
        title: 'Заголовок · ReelKit',
        description: 'Опис',
      }),
    );
  });
});

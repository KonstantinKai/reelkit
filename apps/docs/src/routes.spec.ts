import { describe, expect, it } from 'vitest';
import routes from './routes';
import { kDefaultLocale, kLocales, localePrefix } from './i18n/locale';
import { sitemapEntries } from './content/sitePages';

interface FlatRoute {
  path?: string;
  index?: boolean;
  children?: FlatRoute[];
}

function leaves(entries: FlatRoute[]): FlatRoute[] {
  return entries.flatMap((entry) =>
    entry.children ? leaves(entry.children) : [entry],
  );
}

const all = leaves(routes as unknown as FlatRoute[]);

// A page mid-migration to a content file keeps its old module mounted at
// `<path>-legacy` for a side-by-side check. Those twins go with the old
// modules and are not part of the public route set.
const paths = all
  .map((entry) => entry.path ?? '')
  .filter((path) => !path.endsWith('-legacy'));

/** Prefixes without the leading slash — route paths carry none. */
const translated = kLocales
  .filter((locale) => locale !== kDefaultLocale)
  .map((locale) => ({ locale, prefix: localePrefix(locale).slice(1) }));

const belongsTo = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

const english = paths.filter(
  (path) => !translated.some(({ prefix }) => belongsTo(path, prefix)),
);

const pathsFor = (prefix: string) =>
  new Set(paths.filter((path) => belongsTo(path, prefix)));

describe('route tree', () => {
  it.each(translated)(
    'mirrors every English route under the "$locale" prefix',
    ({ prefix }) => {
      const mirrored = pathsFor(prefix);
      for (const path of english) {
        const expected = path === '' ? prefix : `${prefix}/${path}`;
        expect(
          mirrored.has(expected),
          `missing "${prefix}" route for "/${path}"`,
        ).toBe(true);
      }
    },
  );

  it.each(translated)(
    'adds no "$locale" route without an English counterpart',
    ({ prefix }) => {
      const englishSet = new Set(english);
      for (const path of pathsFor(prefix)) {
        const shared = path === prefix ? '' : path.slice(`${prefix}/`.length);
        expect(englishSet.has(shared), `stray route "/${path}"`).toBe(true);
      }
    },
  );

  // Routes are generated from the page manifest, so their order follows it;
  // the router ranks by specificity, and only the set of addresses matters.
  it('leaves the English paths untouched', () => {
    const sorted = (list: string[]) => [...list].sort();
    expect(sorted(english)).toEqual(
      sorted([
        '',
        'docs/getting-started',
        'docs/installation',
        'docs/ssr',
        'docs/core/guide',
        'docs/core/api',
        'docs/react/guide',
        'docs/react/api',
        'docs/angular/guide',
        'docs/angular/api',
        'docs/reel-player',
        'docs/lightbox',
        'docs/angular-reel-player',
        'docs/angular-lightbox',
        'docs/stories-core',
        'docs/stories-player',
        'docs/angular-stories-player',
        'docs/vue/guide',
        'docs/vue/api',
        'docs/vue-reel-player',
        'docs/vue-lightbox',
        'docs/vue-stories-player',
        'docs/troubleshooting',
        'docs/llms',
        'docs/changelog',
        'privacy',
        'terms',
        '*',
      ]),
    );
  });

  // A missing sitemap entry means the route is never prerendered, because
  // `react-router.config.ts` derives its prerender list from the sitemap.
  it.each(translated)(
    'lists a "$locale" sitemap entry wherever English has one',
    ({ prefix }) => {
      const listed = new Set(sitemapEntries().map((entry) => entry.path));
      const sitemapPath = (path: string) =>
        path === '' ? '/' : `/${path}`.replace(/\/$/, '');

      for (const path of english) {
        if (path === '*') continue;
        const en = sitemapPath(path);
        const mirrored = en === '/' ? `/${prefix}` : `/${prefix}${en}`;
        expect(listed.has(mirrored), `sitemap misses "${mirrored}"`).toBe(
          listed.has(en),
        );
      }
    },
  );

  // A route id defaults to its file path, so the pages reused across locales
  // collide unless they carry an explicit id.
  it('gives every route a unique id', () => {
    const ids = all.map((entry) => {
      const { id, file } = entry as { id?: string; file?: string };
      return id ?? file ?? '';
    });
    expect(new Set(ids).size).toBe(ids.length);
  });
});

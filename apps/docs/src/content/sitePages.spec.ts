import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kDefaultLocale, kLocales } from '../i18n/locale';
import * as pageMetaModule from '../i18n/pageMeta';
import { kSitePages } from './manifest';
import { pageFiles, renderSitemap, sitemapEntries } from './sitePages';

const appDir = join(import.meta.dirname, '..');
const docsDir = join(appDir, '..');
const read = (path: string) => readFileSync(path, 'utf8');

describe('page manifest', () => {
  // The Vite config and the React Router config load these two files before
  // the app bundle exists. A single import would drag the app's module graph
  // into config evaluation, which is how the old hand-synced copies of the
  // locale list came about in the first place.
  it('keeps the locale registry and the manifest free of imports', () => {
    for (const file of ['i18n/locale.ts', 'content/manifest.ts']) {
      expect(read(join(appDir, file)), file).not.toMatch(/^\s*import\s/m);
    }
  });

  it('gives every page a body in every locale', () => {
    for (const page of kSitePages) {
      expect(
        page.module ?? page.content,
        `"/${page.path}" names neither a module nor a content file`,
      ).toBeTruthy();
      for (const locale of kLocales) {
        const { main, legacy } = pageFiles(page, locale);
        for (const file of [main, legacy]) {
          if (file === null) continue;
          expect(existsSync(join(appDir, file)), `${locale}: ${file}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('lists every content locale in the registry', () => {
    for (const page of kSitePages) {
      for (const locale of page.contentLocales ?? []) {
        expect(kLocales as readonly string[], `"/${page.path}"`).toContain(
          locale,
        );
      }
    }
  });
});

describe('sitemap', () => {
  // Today's English entries, frequency and priority included. The generator
  // replaced a hand-kept file; this is what that file said.
  it('lists the English pages it always listed', () => {
    expect(
      sitemapEntries()
        .filter((entry) => entry.locale === kDefaultLocale)
        .map(({ path, changefreq, priority }) =>
          [path, changefreq, priority].join(' '),
        ),
    ).toEqual([
      '/ weekly 1.0',
      '/docs/getting-started monthly 0.9',
      '/docs/installation monthly 0.8',
      '/docs/ssr monthly 0.6',
      '/docs/core/guide monthly 0.8',
      '/docs/core/api monthly 0.7',
      '/docs/stories-core monthly 0.7',
      '/docs/react/guide monthly 0.8',
      '/docs/react/api monthly 0.7',
      '/docs/reel-player monthly 0.8',
      '/docs/lightbox monthly 0.8',
      '/docs/stories-player monthly 0.8',
      '/docs/vue/guide monthly 0.8',
      '/docs/vue/api monthly 0.7',
      '/docs/vue-reel-player monthly 0.8',
      '/docs/vue-lightbox monthly 0.8',
      '/docs/vue-stories-player monthly 0.8',
      '/docs/angular/guide monthly 0.8',
      '/docs/angular/api monthly 0.7',
      '/docs/angular-reel-player monthly 0.8',
      '/docs/angular-lightbox monthly 0.8',
      '/docs/angular-stories-player monthly 0.8',
      '/docs/troubleshooting monthly 0.5',
      '/docs/llms monthly 0.5',
      '/docs/changelog weekly 0.6',
    ]);
  });

  it('carries one entry per listed page in every locale', () => {
    const listed = kSitePages.filter((page) => page.sitemap).length;
    const xml = renderSitemap();
    expect(xml.match(/<loc>/g)).toHaveLength(listed * kLocales.length);
    expect(xml).toContain('<loc>https://reelkit.dev/</loc>');
    expect(xml).toContain('<loc>https://reelkit.dev/uk/docs/ssr</loc>');
  });

  // A copy under `public/` would be served ahead of the generated one in dev
  // and copied over it at build, silently reviving the hand-kept list.
  it('has no hand-kept sitemap file', () => {
    expect(existsSync(join(docsDir, 'public/sitemap.xml'))).toBe(false);
  });
});

describe('locale-specific code', () => {
  // The build configs used to carry their own copy of the locale list as a
  // regular expression alternation, kept in step by hand.
  it('keeps the build configs free of a locale list', () => {
    const translated = kLocales.filter((locale) => locale !== kDefaultLocale);
    for (const file of ['vite.config.mts', 'react-router.config.ts']) {
      const source = read(join(docsDir, file));
      for (const locale of translated) {
        expect(source, `${file} names "${locale}"`).not.toMatch(
          new RegExp(`['"/|(]${locale}['"/|)]`),
        );
      }
    }
  });

  it('exposes one page meta helper, not one per language', () => {
    const perLanguage = Object.keys(pageMetaModule).filter((name) =>
      /^[a-z]{2}PageMeta$/.test(name),
    );
    expect(perLanguage).toEqual([]);
  });
});

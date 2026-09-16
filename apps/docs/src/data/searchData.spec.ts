import { describe, expect, it } from 'vitest';
import {
  foldForSearch,
  matchesSearch,
  searchItems,
  searchItemsFor,
} from './searchData';
import { zhCategories, zhKeywords, zhTitles } from './searchData.zh';
import { ukCategories, ukKeywords, ukTitles } from './searchData.uk';
import { ptCategories, ptKeywords, ptTitles } from './searchData.pt';
import { jaCategories, jaKeywords, jaTitles } from './searchData.ja';
import { hiCategories, hiKeywords, hiTitles } from './searchData.hi';
import {
  kDefaultLocale,
  kLocales,
  localePrefix,
  type Locale,
} from './../i18n/locale';

interface Dictionary {
  titles: Record<string, string>;
  categories: Record<string, string>;
  keywords: Record<string, string[]>;
}

// Typed by the registry rather than by what happens to be imported, so a
// language added to `kLocales` without a dictionary is a type error here
// before it is a silently English palette in the browser.
const dictionaries: Record<Exclude<Locale, 'en'>, Dictionary> = {
  zh: { titles: zhTitles, categories: zhCategories, keywords: zhKeywords },
  uk: { titles: ukTitles, categories: ukCategories, keywords: ukKeywords },
  pt: { titles: ptTitles, categories: ptCategories, keywords: ptKeywords },
  ja: { titles: jaTitles, categories: jaCategories, keywords: jaKeywords },
  hi: { titles: hiTitles, categories: hiCategories, keywords: hiKeywords },
};

const translated = kLocales
  .filter((locale) => locale !== kDefaultLocale)
  .map((locale) => ({
    locale,
    prefix: localePrefix(locale),
    ...dictionaries[locale as Exclude<Locale, 'en'>],
  }));

/**
 * The English keywords of every entry that shares a path. A path can hold
 * several entries — a page plus its sections — and they all ride along with
 * the same localized list.
 */
const englishKeywords = new Map<string, Set<string>>();
for (const item of searchItems) {
  const words = englishKeywords.get(item.path) ?? new Set<string>();
  for (const keyword of item.keywords) words.add(keyword);
  englishKeywords.set(item.path, words);
}

describe('localised search index', () => {
  // The English keywords already ride along from the shared index, so a
  // localized list that only repeats them adds nothing — its whole job is to
  // let a reader find the page in the words they would actually type. Asking
  // for a non-ASCII character instead would only fit the languages that
  // happen not to share our alphabet.
  it.each(translated)(
    'adds keywords in the "$locale" language',
    ({ keywords }) => {
      for (const [path, words] of Object.entries(keywords)) {
        // A path the English index does not carry has nothing to repeat, so
        // every word it lists is its own. `/docs/vue-stories-player` is one:
        // the sidebar announces the page, the index does not cover it yet.
        const english = englishKeywords.get(path) ?? new Set<string>();
        const localized = words.filter((word) => !english.has(word));
        expect(
          localized.length,
          `"${path}" only repeats the English keywords`,
        ).toBeGreaterThan(0);
      }
    },
  );

  it('keeps the English index untouched', () => {
    expect(searchItemsFor('en')).toBe(searchItems);
  });

  it('has a dictionary for every non-English locale', () => {
    expect(translated.map((entry) => entry.locale)).toEqual(
      kLocales.filter((locale) => locale !== kDefaultLocale),
    );
    for (const entry of translated) {
      expect(entry.titles, `no dictionary for "${entry.locale}"`).toBeTruthy();
    }
  });

  it.each(translated)(
    'mirrors the English index entry for entry in "$locale"',
    ({ locale }) => {
      const items = searchItemsFor(locale);
      expect(items).toHaveLength(searchItems.length);
      items.forEach((item, index) => {
        expect(item.sectionAnchor).toBe(searchItems[index].sectionAnchor);
        expect(item.framework).toBe(searchItems[index].framework);
      });
    },
  );

  it.each(translated)(
    'points every "$locale" entry at a route in that locale',
    ({ locale, prefix }) => {
      for (const item of searchItemsFor(locale)) {
        expect(item.path.startsWith(prefix)).toBe(true);
      }
    },
  );

  it.each(translated)(
    'keeps the English keywords in "$locale" so API names stay searchable',
    ({ locale }) => {
      searchItemsFor(locale).forEach((item, index) => {
        for (const keyword of searchItems[index].keywords) {
          expect(item.keywords).toContain(keyword);
        }
      });
    },
  );

  it.each(translated)(
    'translates every category in "$locale"',
    ({ categories }) => {
      for (const item of searchItems) {
        expect(categories[item.category]).toBeTruthy();
      }
    },
  );

  // A page or section added to the English index without a translated label
  // would silently surface English text in that locale's palette.
  it.each(translated)(
    'translates every page and section title in "$locale"',
    ({ titles }) => {
      for (const item of searchItems) {
        expect(titles[item.title], `no label for "${item.title}"`).toBeTruthy();
        if (item.sectionTitle) {
          expect(
            titles[item.sectionTitle],
            `no label for section "${item.sectionTitle}"`,
          ).toBeTruthy();
        }
      }
    },
  );

  it.each(translated)(
    'carries no "$locale" label that the English index never uses',
    ({ titles }) => {
      const used = new Set<string>();
      for (const item of searchItems) {
        used.add(item.title);
        if (item.sectionTitle) used.add(item.sectionTitle);
      }
      for (const key of Object.keys(titles)) {
        expect(used.has(key), `unused label "${key}"`).toBe(true);
      }
    },
  );
});

describe('palette matching', () => {
  // A reader typing on a keyboard without accents, or on one that produces
  // full-width letters, is looking for the same page as everyone else.
  it('finds a title through missing accents and full-width letters', () => {
    expect(foldForSearch('Instalação')).toBe('instalacao');
    expect(foldForSearch('ＡＰＩ')).toBe('api');
    expect(foldForSearch('Configuração Básica')).toBe('configuracao basica');
  });

  // Stripping every combining mark would take the dakuten with it and fold
  // two different kana together, so the fold stays inside the Latin range.
  it('keeps kana that differ only by their mark apart', () => {
    expect(foldForSearch('ダ')).not.toBe(foldForSearch('タ'));
    expect(foldForSearch('ダウンロード')).not.toBe(
      foldForSearch('タウンロード'),
    );
  });

  // A Devanagari nukta letter has a precomposed code point and a two-part
  // spelling. The fold has to match them to each other, and it must not drop
  // the nukta, which would turn za into the different letter ja.
  it('matches both spellings of a nukta letter and keeps the nukta', () => {
    const precomposed = 'रिली\u095b';
    const decomposed = 'रिलीज\u093c';
    expect(foldForSearch(precomposed)).toBe(foldForSearch(decomposed));
    expect(foldForSearch(decomposed)).not.toBe(foldForSearch('रिलीज'));
  });

  it('answers a query that matches a title, a category or a keyword', () => {
    const item = {
      title: 'Instalação',
      path: '/pt/docs/installation',
      category: 'Visão geral',
      keywords: ['npm', 'instalar'],
    };
    expect(matchesSearch(item, 'instalacao')).toBe(true);
    expect(matchesSearch(item, 'visao')).toBe(true);
    expect(matchesSearch(item, 'INSTALAR')).toBe(true);
    expect(matchesSearch(item, 'lightbox')).toBe(false);
  });

  // The fold is only allowed to add matches nobody could type before. Every
  // query that found a page yesterday still finds it, in every language.
  it.each(kLocales)('keeps the "%s" results it already had', (locale) => {
    const items = searchItemsFor(locale);
    const queries = [
      'install',
      'ssr',
      'lightbox',
      'reel',
      'keyboard',
      'api',
      'stories',
      'встановлення',
      '安装',
      'インストール',
      'इंस्टॉल',
      'इन्स्टॉल',
    ];
    for (const query of queries) {
      const q = query.toLowerCase().trim();
      const before = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.sectionTitle?.toLowerCase().includes(q) ||
          item.keywords.some((keyword) => keyword.includes(q)),
      );
      const after = items.filter((item) => matchesSearch(item, query));
      for (const item of before) {
        expect(after, `"${query}" lost ${item.path}`).toContain(item);
      }
    }
  });

  // Hindi writes a nasal either as a dot above or as a half letter, and both
  // spellings are in everyday use. The fold cannot tell them apart without a
  // Hindi-only rule, so the keyword list carries both.
  it('finds a Hindi page under either common spelling', () => {
    const items = searchItemsFor('hi');
    const pathsFor = (query: string) =>
      items
        .filter((item) => matchesSearch(item, query))
        .map((item) => item.path);
    expect(pathsFor('इंस्टॉल')).toContain('/hi/docs/installation');
    expect(pathsFor('इन्स्टॉल')).toContain('/hi/docs/installation');
    expect(pathsFor('शुरुआत')).toContain('/hi/docs/getting-started');
  });
});

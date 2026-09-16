import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { glob } from 'node:fs/promises';
import { kDefaultLocale, kLocales, type Locale } from '../i18n/locale';

const appDir = join(import.meta.dirname, '..');
const pagesDir = join(appDir, 'pages');
const contentDir = join(appDir, 'content');

async function filesUnder(dir: string, pattern: string) {
  const found: string[] = [];
  for await (const entry of glob(pattern, { cwd: dir })) found.push(entry);
  return found.sort();
}

const read = (path: string) => readFileSync(path, 'utf8');

const translated = kLocales.filter((locale) => locale !== kDefaultLocale);

/** Backticks before an offset — an odd count means it sits in a template literal. */
const inTemplateLiteral = (source: string, offset: number) =>
  (source.slice(0, offset).match(/`/g) ?? []).length % 2 === 1;

/**
 * Prose with the code taken out — an identifier is English everywhere. Not
 * every one of them arrives in backticks: a prop written plainly mid-sentence
 * still splits into English-looking words, and `v-model:is-open` holds an
 * "is" that no translator put there.
 */
const withoutCode = (text: string) =>
  text
    .replace(/`[^`]*`/g, ' ')
    .replace(/\S*[-_:]\S*/g, ' ')
    .replace(/\b[a-z]+[A-Z]\w*/g, ' ');

// A run of Latin words used to mean English, which held while every
// translation was written in Cyrillic or Han. It cannot survive a language
// written in the same letters as English, so the tell is a function word
// instead: English prose long enough to describe a page carries one, and a
// translation carries none. `for` is missing on purpose — Portuguese
// conjugates both ser and ir into it.
const englishFunctionWords =
  /\b(the|and|with|when|from|that|this|of|is|are|you|your|or|to)\b/i;

/**
 * A word the language uses and English does not. Absence of English is only
 * half the check: a description can carry no function word and still be the
 * English one, lightly reworded. This is the other half — proof the sentence
 * is written in the language it claims.
 */
const localeMarkers: Record<Exclude<Locale, 'en'>, RegExp> = {
  uk: /[А-Яа-яЇїІіЄєҐґ]/,
  zh: /[一-鿿]/,
  // Latin script like English, so the marker is a word no English sentence
  // uses. `do`, `no`, `a` and `e` stay out even though Portuguese leans on
  // them: each is also an English word, and an untranslated "No runtime
  // dependencies" would pass as Portuguese.
  pt: /(?<!\p{L})(de|da|para|com|que|não|uma|na|em|por)(?!\p{L})/iu,
  // Kana, not kanji: every Japanese sentence carries kana particles and
  // Chinese carries none, so a page copied over from the Chinese tree fails.
  ja: /[\u3040-\u30ff]/,
  hi: /[\u0900-\u097f]/,
};

const markerFor = (locale: Locale) =>
  localeMarkers[locale as Exclude<Locale, 'en'>];

/**
 * Text that is English rather than this language. A sentence carrying the
 * language's own words is translated, whatever English it quotes along the
 * way — a row may well say `codec` or `locator` in the middle of its own
 * grammar. Without such a word, an English function word gives it away.
 */
const readsAsEnglish = (text: string, locale: Locale) => {
  const prose = withoutCode(text);
  return !markerFor(locale).test(prose) && englishFunctionWords.test(prose);
};

const frontmatterValue = (source: string, key: string) => {
  const block = source.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  const raw = block.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1] ?? '';
  return raw.replace(/^'(.*)'$/, '$1').replace(/''/g, "'");
};

// Reel Player, Lightbox and the Stories pair name shipped packages, not
// concepts. A reader searching npm, GitHub or the API types the English
// name, and a page that renders it three different ways across its sidebar,
// its heading and its next-step cards reads as three different products.
const translatedProductNames = [
  'Reel-плеєр',
  'Лайтбокс',
  'лайтбокс',
  'Плеєр Stories',
  'Ядро Stories',
  'Reel 播放器',
  '灯箱',
  'Stories 播放器',
  'Stories 核心',
  'Reprodutor de Reels',
  'reprodutor de reels',
  'Leitor de Reels',
  'leitor de reels',
  'Caixa de Luz',
  'caixa de luz',
  'Reprodutor de Stories',
  'Núcleo de Stories',
  'リールプレイヤー',
  'リール プレイヤー',
  'ライトボックス',
  'ストーリーズプレイヤー',
  'ストーリーズ プレイヤー',
  'ストーリーズコア',
  'ストーリーズ コア',
  'रील प्लेयर',
  'रील्स प्लेयर',
  'लाइटबॉक्स',
  'लाइट बॉक्स',
  'स्टोरीज़ प्लेयर',
  'स्टोरीज प्लेयर',
  'स्टोरीज़ कोर',
  'स्टोरीज कोर',
  'रीलकिट',
];

describe.each(translated)('%s page modules', (locale) => {
  const modules = () => filesUnder(pagesDir, `${locale}/**/*.tsx`);

  it('exports page meta from every module', async () => {
    const pages = await modules();
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(read(join(pagesDir, page)), `${page} exports no meta`).toContain(
        'export const meta',
      );
    }
  });

  // Anchoring an insertion on the last `import` in the file lands inside a
  // code sample, because a snippet in a template literal carries its own
  // import lines. The file still parses, so nothing else catches it.
  it('keeps the meta export out of the code samples', async () => {
    for (const page of await modules()) {
      const source = read(join(pagesDir, page));
      expect(
        inTemplateLiteral(source, source.indexOf('export const meta')),
        `${page} declares its meta inside a code sample`,
      ).toBe(false);
    }
  });

  // Privacy and Terms stay English because a translated legal text is a
  // second document to keep accurate, and the changelog is generated from the
  // release notes. The home page owns its prose.
  it('re-exports the English body only for the pages that stay English', async () => {
    const staysEnglish = ['Privacy.tsx', 'Terms.tsx', 'docs/Changelog.tsx'];
    for (const page of await modules()) {
      const reExports = read(join(pagesDir, page)).includes(
        'export { default } from',
      );
      expect(
        reExports,
        reExports
          ? `${page} still renders the English page`
          : `${page} no longer needs its re-export exemption`,
      ).toBe(staysEnglish.includes(page.slice(`${locale}/`.length)));
    }
  });

  // A translated page starts as a copy of the English one, so every in-page
  // link it inherits still points at the English tree. Following one drops
  // the reader out of their language mid-journey, and nothing in the build
  // complains — the target route exists, it is just the wrong one.
  it('keeps its in-page links inside the locale', async () => {
    const internalLink =
      /(?:to|href)=(["'])(\/(?:docs|privacy|terms)[^"']*)\1/g;
    const strays: string[] = [];
    for (const page of await modules()) {
      const source = read(join(pagesDir, page));
      for (const match of source.matchAll(internalLink)) {
        // Links inside a code sample are documentation, not navigation.
        if (inTemplateLiteral(source, match.index)) continue;
        strays.push(`${page}: ${match[2]}`);
      }
    }
    expect(strays, strays.slice(0, 5).join('\n')).toEqual([]);
  });

  it('leaves the product names in English', async () => {
    const offenders: string[] = [];
    for (const page of await modules()) {
      const source = read(join(pagesDir, page));
      for (const name of translatedProductNames) {
        if (source.includes(name)) offenders.push(`${page}: ${name}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});

describe.each(translated)('%s content files', (locale) => {
  const contentFiles = async () =>
    (await filesUnder(join(contentDir, locale), '**/*.mdx')).map((file) => ({
      name: `${locale}/${file}`,
      source: read(join(contentDir, locale, file)),
      english: read(join(contentDir, kDefaultLocale, file)),
    }));

  // The description is the search result snippet and the social card text.
  // Left in English it is the one line of the page a reader sees before
  // choosing to open it. Titles may legitimately match, they are often a
  // product name.
  it('translates the page description', async () => {
    const marker = markerFor(locale);
    const untranslated: string[] = [];
    for (const { name, source, english } of await contentFiles()) {
      const description = frontmatterValue(source, 'description');
      if (
        description === frontmatterValue(english, 'description') ||
        readsAsEnglish(description, locale) ||
        !marker.test(withoutCode(description))
      ) {
        untranslated.push(`${name}: ${description}`);
      }
    }
    expect(untranslated, untranslated.join('\n')).toEqual([]);
  });

  // Half the prose on a reference page sits in its tables: props, theming
  // tokens, CSS classes, keyboard shortcuts. A row is recognised by an
  // identifier in its first cell; the last cell is the description the reader
  // came for. Short labels such as "Overlay z-index" do not read as English
  // to a word pattern, so a description is also untranslated when it is
  // exactly the English row's text. A cell that is only code, a type shape
  // for instance, stays as it is.
  it('translates the prose in its tables', async () => {
    const rowsOf = (source: string) =>
      [...source.matchAll(/^\| `[^\n]*\|\s*$/gm)].map(([row]) =>
        row
          .split(/(?<!\\)\|/)
          .slice(1, -1)
          .map((cell) => cell.trim()),
      );
    const untranslated: string[] = [];
    for (const { name, source, english } of await contentFiles()) {
      const englishRows = rowsOf(english);
      rowsOf(source).forEach((cells, index) => {
        if (cells.length < 2) return;
        const description = cells[cells.length - 1];
        const englishCells = englishRows[index];
        const sameAsEnglish =
          englishCells?.[0] === cells[0] &&
          englishCells[englishCells.length - 1] === description &&
          /[A-Za-z]{3}/.test(description.replace(/`[^`]*`/g, ''));
        if (sameAsEnglish || readsAsEnglish(description, locale)) {
          untranslated.push(`${name}: ${cells[0]} ${description}`);
        }
      });
    }
    expect(untranslated, untranslated.slice(0, 5).join('\n')).toEqual([]);
  });

  it('leaves the product names in English', async () => {
    const offenders: string[] = [];
    for (const { name, source } of await contentFiles()) {
      for (const product of translatedProductNames) {
        if (source.includes(product)) offenders.push(`${name}: ${product}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  // Prose links are written unprefixed and land in the reader's locale
  // through the components map. A hand-written prefix still works today but
  // doubles up the moment the map adds one, and a copied English prefix would
  // not exist at all.
  it('writes its links without a locale prefix', async () => {
    const prefixed = new RegExp(
      `\\]\\(/(?:${kLocales.join('|')})/|(?:to|path)=?:?\\s*["']/(?:${kLocales.join('|')})/`,
    );
    const offenders: string[] = [];
    for (const { name, source } of await contentFiles()) {
      source.split('\n').forEach((line, index) => {
        if (prefixed.test(line)) offenders.push(`${name}:${index + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it('has a content file for every English page', async () => {
    const english = await filesUnder(
      join(contentDir, kDefaultLocale),
      '**/*.mdx',
    );
    const own = await filesUnder(join(contentDir, locale), '**/*.mdx');
    expect(own, relative(appDir, join(contentDir, locale))).toEqual(english);
  });
});

// Devanagari spells a nukta letter such as za two ways: one precomposed code
// point, or the base letter followed by the nukta sign. Both render the same,
// but the checks above compare raw text, so a product name typed one way
// slips past a guard written the other way. Normalization always yields the
// two-code-point form, which makes it the one spelling every file agrees on.
describe('Devanagari source text', () => {
  const precomposedNukta = /[\u0958-\u095f]/;

  const sources = async () => [
    ...(await filesUnder(join(contentDir, 'hi'), '**/*.mdx')).map((file) =>
      join(contentDir, 'hi', file),
    ),
    ...(await filesUnder(join(pagesDir, 'hi'), '**/*.tsx')).map((file) =>
      join(pagesDir, 'hi', file),
    ),
    ...(
      await filesUnder(appDir, '{data/searchData.hi.ts,i18n/messages.ts}')
    ).map((file) => join(appDir, file)),
  ];

  it('keeps every Hindi file in one normalized spelling', async () => {
    const offenders: string[] = [];
    for (const path of await sources()) {
      const source = read(path);
      if (source !== source.normalize('NFC') || precomposedNukta.test(source)) {
        offenders.push(relative(appDir, path));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('writes the product-name guard in the same spelling', () => {
    for (const name of translatedProductNames) {
      expect(name, name).toBe(name.normalize('NFC'));
      expect(precomposedNukta.test(name), name).toBe(false);
    }
  });
});

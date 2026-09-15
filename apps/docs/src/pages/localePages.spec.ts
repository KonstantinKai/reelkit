import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { glob } from 'node:fs/promises';
import { kDefaultLocale, kLocales } from '../i18n/locale';

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

/** A run of lowercase Latin words and no letter of the translated scripts. */
const readsAsEnglish = (text: string) =>
  /[a-z]{3}\s+[a-z]{2}/.test(text) && !/[А-Яа-яЇїІіЄєҐґ一-鿿]/.test(text);

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
    const untranslated: string[] = [];
    for (const { name, source, english } of await contentFiles()) {
      const description = frontmatterValue(source, 'description');
      if (
        description === frontmatterValue(english, 'description') ||
        readsAsEnglish(description)
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
        if (sameAsEnglish || readsAsEnglish(description)) {
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

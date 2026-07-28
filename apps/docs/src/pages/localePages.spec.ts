import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';
import { kDefaultLocale, kLocales } from '../i18n/locale';

const pagesDir = join(import.meta.dirname);

async function pagesFor(locale: string) {
  const found: string[] = [];
  for await (const entry of glob(`${locale}/**/*.tsx`, { cwd: pagesDir })) {
    found.push(entry);
  }
  return found.sort();
}

const translated = kLocales.filter((locale) => locale !== kDefaultLocale);

/** Backticks before an offset — an odd count means it sits in a template literal. */
const inTemplateLiteral = (source: string, offset: number) =>
  (source.slice(0, offset).match(/`/g) ?? []).length % 2 === 1;

describe.each(translated)('%s pages', (locale) => {
  it('exports page meta from every module', async () => {
    const pages = await pagesFor(locale);
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      expect(source, `${page} exports no meta`).toContain('export const meta');
    }
  });

  // Anchoring an insertion on the last `import` in the file lands inside a
  // code sample, because a snippet in a template literal carries its own
  // import lines. The file still parses, so nothing else catches it.
  it('keeps the meta export out of the code samples', async () => {
    const pages = await pagesFor(locale);
    for (const page of pages) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      const offset = source.indexOf('export const meta');
      expect(
        inTemplateLiteral(source, offset),
        `${page} declares its meta inside a code sample`,
      ).toBe(false);
    }
  });

  // Privacy and Terms stay English because a translated legal text is a
  // second document to keep accurate, and the changelog is generated from the
  // release notes. Every other page owns its prose.
  it('re-exports the English body only for the pages that stay English', async () => {
    const staysEnglish = ['Privacy.tsx', 'Terms.tsx', 'docs/Changelog.tsx'];
    const pages = await pagesFor(locale);
    for (const page of pages) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      const reExports = source.includes('export { default } from');
      const shared = page.slice(`${locale}/`.length);
      expect(
        reExports,
        reExports
          ? `${page} still renders the English page`
          : `${page} no longer needs its re-export exemption`,
      ).toBe(staysEnglish.includes(shared));
    }
  });

  // Half the prose on a reference page sits in the objects that build its API
  // tables, not in markup — and a description carrying an apostrophe flips to
  // double quotes, a shape easy to skip and impossible to spot by eye. Rows
  // are recognised by a sibling `type`/`prop`/`method`/`name` field, which
  // leaves the English captions in demo data alone; those are sample content,
  // not documentation.
  it('translates the prose in its API tables', async () => {
    const rowObject = /\{[^{}]*\}/gs;
    const isTableRow = /\b(type|prop|method|name):/;
    const proseKey = /\b(desc|description|useCase|notes):\s*(['"])([^'"]+)\2/g;
    const readsAsEnglish = (text: string) =>
      /[a-z]{3}\s+[a-z]{2}/.test(text) && !/[А-Яа-яЇїІіЄєҐґ一-鿿]/.test(text);

    const untranslated: string[] = [];
    for (const page of await pagesFor(locale)) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      if (source.includes('export { default } from')) continue;
      for (const [row] of source.matchAll(rowObject)) {
        if (!isTableRow.test(row)) continue;
        for (const [, , , value] of row.matchAll(proseKey)) {
          if (readsAsEnglish(value)) untranslated.push(`${page}: ${value}`);
        }
      }
    }
    expect(untranslated, untranslated.slice(0, 5).join('\n')).toEqual([]);
  });

  // Reel Player, Lightbox and the Stories pair name shipped packages, not
  // concepts. A reader searching npm, GitHub or the API types the English
  // name, and a page that renders it three different ways across its sidebar,
  // its heading and its next-step cards reads as three different products.
  it('leaves the product names in English', async () => {
    const translations = [
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
    const offenders: string[] = [];
    for (const page of await pagesFor(locale)) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      for (const translated of translations) {
        if (source.includes(translated))
          offenders.push(`${page}: ${translated}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  // A translated page is a copy of the English one, so every in-page link it
  // inherits still points at the English tree. Following one drops the reader
  // out of their language mid-journey, and nothing in the build complains —
  // the target route exists, it is just the wrong one.
  it('keeps its in-page links inside the locale', async () => {
    const internalLink =
      /(?:to|href)=(["'])(\/(?:docs|privacy|terms)[^"']*)\1/g;
    const strays: string[] = [];
    for (const page of await pagesFor(locale)) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      for (const match of source.matchAll(internalLink)) {
        // Links inside a code sample are documentation, not navigation.
        if (inTemplateLiteral(source, match.index)) continue;
        strays.push(`${page}: ${match[2]}`);
      }
    }
    expect(strays, strays.slice(0, 5).join('\n')).toEqual([]);
  });

  it('shows no page-meta import inside a code sample', async () => {
    const pages = await pagesFor(locale);
    for (const page of pages) {
      const source = readFileSync(join(pagesDir, page), 'utf8');
      for (const match of source.matchAll(/import \{ \w+PageMeta \}/g)) {
        expect(
          inTemplateLiteral(source, match.index),
          `${page} imports page meta inside a code sample`,
        ).toBe(false);
      }
    }
  });
});

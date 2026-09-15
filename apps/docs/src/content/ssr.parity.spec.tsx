import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { kLocales } from '../i18n/locale';
import EnglishContent from './en/docs/ssr.mdx';
import UkrainianContent from './uk/docs/ssr.mdx';
import EnglishLegacy from '../pages/docs/SSR';
import UkrainianLegacy from '../pages/uk/docs/SSR';

/*
 * Migration guard for a page moved from a tsx module to a content file.
 * Layout is checked by eye against the `-legacy` twin route; this proves
 * nothing was lost on the way: the same prose, in the same order, and the
 * same code samples, in the same order. Deleted with the legacy modules.
 */

const pages = [
  { locale: 'en', content: EnglishContent, legacy: EnglishLegacy },
  { locale: 'uk', content: UkrainianContent, legacy: UkrainianLegacy },
];

function visibleText(element: React.ReactElement) {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/docs/ssr']}>{element}</MemoryRouter>,
  );
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function legacyCodeSamples(locale: string) {
  const file = locale === 'en' ? 'docs/SSR.tsx' : `${locale}/docs/SSR.tsx`;
  const source = readFileSync(
    join(import.meta.dirname, '../pages', file),
    'utf8',
  );
  return [...source.matchAll(/code=\{`([\s\S]*?)`\}/g)].map((match) =>
    match[1].replace(/\\`/g, '`').trim(),
  );
}

function contentCodeSamples(locale: string) {
  const dir = join(import.meta.dirname, locale, 'docs');
  const source = readFileSync(join(dir, 'ssr.mdx'), 'utf8');
  const imports = new Map(
    [...source.matchAll(/^import (\w+) from '([^']+)\?raw';$/gm)].map(
      (match) => [match[1], match[2]],
    ),
  );
  return [...source.matchAll(/<CodeBlock code=\{(\w+)\}/g)].map((match) => {
    const specifier = imports.get(match[1]);
    if (!specifier) throw new Error(`no snippet import for ${match[1]}`);
    return readFileSync(join(dir, specifier), 'utf8').trim();
  });
}

describe.each(pages)('$locale server-side rendering page', (page) => {
  it('is a locale the registry knows', () => {
    expect(kLocales).toContain(page.locale);
  });

  it('keeps every word of the legacy page, in order', () => {
    const legacy = visibleText(<page.legacy />);
    const content = visibleText(<page.content />);
    // The legacy page rendered the title inside its own body; the content
    // page's shell renders it from the frontmatter, so both include it.
    expect(content).toBe(legacy);
  });

  it('shows the same code samples, in the same order', () => {
    expect(contentCodeSamples(page.locale)).toEqual(
      legacyCodeSamples(page.locale),
    );
  });
});

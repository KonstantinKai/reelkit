import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { kDefaultLocale, kLocales } from '../i18n/locale';

// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../CHANGELOG.md?raw';
import themingCss from './snippets/stories-player/theming.css?raw';

const contentDir = import.meta.dirname;
const appDir = join(contentDir, '..');
const repoRoot = join(appDir, '../../..');
const read = (path: string) => readFileSync(path, 'utf8');

function walk(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, keep);
    return keep(entry.name) ? [path] : [];
  });
}

describe('heading ids across locales', () => {
  // A shared link to `/docs/lightbox#theming` has to land on the same
  // section whichever language the reader switches to. Translated headings
  // carry the English slug for exactly that reason, so a page's set of ids is
  // the same in every locale.
  const idsOf = (source: string) =>
    [...source.matchAll(/^#{2,3} .*\[#([\w-]+)\]\s*$/gm)]
      .map((match) => match[1])
      .sort();

  const englishDir = join(contentDir, kDefaultLocale);
  const pages = walk(englishDir, (name) => name.endsWith('.mdx')).map((path) =>
    relative(englishDir, path),
  );

  it.each(pages)('%s has the English heading ids in every locale', (page) => {
    const english = idsOf(read(join(englishDir, page)));
    for (const locale of kLocales) {
      if (locale === kDefaultLocale) continue;
      expect(idsOf(read(join(contentDir, locale, page))), locale).toEqual(
        english,
      );
    }
  });
});

describe('locale parity configuration', () => {
  // `docs:check` compares every translated page against its English original.
  // Its locale list is hand-kept JSON, so a language added to the registry
  // and forgotten here is checked by nothing, and the gap is invisible —
  // the check passes, it just never looks at that language.
  it('checks every translated locale the registry serves', () => {
    const config = JSON.parse(
      read(join(repoRoot, 'scripts/docs-check.config.json')),
    );
    expect([...config.localeParity.locales].sort()).toEqual(
      kLocales.filter((locale) => locale !== kDefaultLocale).sort(),
    );
  });
});

describe('content toolchain', () => {
  const toolchain = [
    '@mdx-js/rollup',
    'remark-frontmatter',
    'remark-gfm',
    'remark-mdx-frontmatter',
    'acorn',
  ];
  const manifests = [
    join(repoRoot, 'package.json'),
    join(appDir, '../package.json'),
  ].map((path) => ({ path, json: JSON.parse(read(path)) }));

  // Content compiles at build time, so nothing of the toolchain belongs in
  // what the site ships or what a consumer of the workspace installs.
  it('keeps the MDX toolchain in dev dependencies only', () => {
    const [root] = manifests;
    for (const name of toolchain) {
      expect(root.json.devDependencies?.[name], name).toBeDefined();
    }
    for (const { path, json } of manifests) {
      for (const name of toolchain) {
        expect(json.dependencies?.[name], `${path}: ${name}`).toBeUndefined();
      }
    }
  });

  // Components reach content through the compiler's `providerImportSource`
  // and a static map, not a React context provider — which is what the
  // runtime package would add.
  it('uses no MDX runtime provider', () => {
    for (const { path, json } of manifests) {
      for (const field of ['dependencies', 'devDependencies']) {
        expect(json[field]?.['@mdx-js/react'], `${path} ${field}`).toBe(
          undefined,
        );
      }
    }
    const offenders = walk(
      appDir,
      (name) => /\.(tsx?|mdx)$/.test(name) && !name.includes('.spec.'),
    )
      .filter((path) => read(path).includes("from '@mdx-js/react'"))
      .map((path) => relative(appDir, path));
    expect(offenders).toEqual([]);
  });

  // The MDX plugin runs before every other transform. Left to its defaults
  // it also claims `.md` files, and the changelog imported as raw text would
  // arrive as a compiled component instead of the string the page renders.
  it('leaves markdown imported as raw text alone', () => {
    expect(typeof changelogRaw).toBe('string');
    expect(changelogRaw).toMatch(/^#/m);
    expect(changelogRaw).not.toMatch(/^export /m);
  });

  // Vitest swaps every stylesheet for an empty module unless told otherwise,
  // `?raw` imports included, and a CSS code sample would then render blank.
  it('loads a stylesheet code sample as its text', () => {
    expect(themingCss).toContain('--rk-stories-');
  });
});

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

// A binding page is written from its sibling, and the gate compares sections,
// tables and code samples — not the callouts between them. The caveats are
// exactly what a reader cannot infer from the API tables: that the player
// preloads and remembers a broken URL, and that the heart cannot be replaced.
// Dropped on the way across, they are missing where nothing else says them.
describe('caveats shared by the stories player pages', () => {
  const pages = [
    'stories-player.mdx',
    'vue-stories-player.mdx',
    'angular-stories-player.mdx',
  ].map((page) => join(contentDir, kDefaultLocale, 'docs', page));

  it.each([
    ['preloading the next story', /preload the next story in the background/i],
    ['the heart cannot be replaced', /heart animation cannot be replaced/i],
    // The accessibility section is prose the API tables never imply, so a
    // port written from the structure alone comes out a paragraph long and
    // reads complete. These three facts are what the other two ports say.
    ['returning focus to the trigger', /returns it to the trigger on close/i],
    ['how the focus trap is built', /captureFocusForReturn.*createFocusTrap/is],
    ['the carousel card label', /button labelled "Open stories by"/i],
  ])('every stories page carries the caveat about %s', (_, caveat) => {
    for (const page of pages) {
      expect(read(page), relative(repoRoot, page)).toMatch(caveat);
    }
  });
});

describe('feature cards', () => {
  // A card is `{ icon, label, desc }`. Guess at `title`/`description` and MDX
  // still compiles, the page still builds, every other check still passes —
  // and the grid renders a row of empty cards, which only a human opening the
  // page would notice.
  const kCardKeys = new Set(['icon', 'label', 'desc']);

  const gridsIn = (source: string) =>
    [
      ...source.matchAll(/<FeatureGrid[^>]*items=\{\[([\s\S]*?)\]\}\s*\/>/g),
    ].map((match) => match[1]);

  const pages = walk(join(contentDir, kDefaultLocale), (name) =>
    name.endsWith('.mdx'),
  );

  it('are written with the keys the card component reads', () => {
    const wrong: string[] = [];

    for (const page of pages) {
      for (const grid of gridsIn(read(page))) {
        for (const [, key] of grid.matchAll(/^\s*(\w+):/gm)) {
          if (!kCardKeys.has(key)) {
            wrong.push(`${relative(repoRoot, page)}: ${key}`);
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  // Guards the check itself: no grids found would pass on nothing.
  it('are present on the pages that open with one', () => {
    const withGrid = pages.filter((page) => gridsIn(read(page)).length > 0);
    expect(withGrid.length).toBeGreaterThan(0);
  });
});

describe('braces in content', () => {
  // MDX reads a bare `{` as the start of an expression, so prose escapes it.
  // A code span is verbatim, though: the escape is not consumed there, and
  // the reader sees `\{ story \}` on the page. Both forms compile and the
  // page builds either way, so only the rendered table shows the difference.
  it('leaves an escaped brace out of code spans', () => {
    const offenders: string[] = [];

    for (const page of walk(contentDir, (name) => name.endsWith('.mdx'))) {
      const lines = read(page).split('\n');
      lines.forEach((line, index) => {
        for (const [, span] of line.matchAll(/`([^`]+)`/g)) {
          if (/\\[{}]/.test(span)) {
            offenders.push(`${relative(repoRoot, page)}:${index + 1}`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
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

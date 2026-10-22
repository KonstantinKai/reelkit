import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// The script under test lives with the other repo scripts, outside any
// project; this is the only place in the workspace that can run it.
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  internalExportNames,
  publicExportNames,
} from '../../../../scripts/lib/publicExports.mjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  componentsAfterHooks,
  mentionsAsCode,
  strippedInternals,
} from '../../../../scripts/lib/docsRules.mjs';

// docs-check requires every export of a package index to appear on its docs
// page. That guarantee is only as wide as the enumeration: a re-export form
// it does not see is an export it never checks, and the gap looks like a
// clean pass.
describe('docs-check export enumeration', () => {
  it('sees a type-only re-export block', () => {
    const { names } = publicExportNames(
      `export type { Foo, Bar } from './lib/types';`,
    );

    expect(names).toEqual(['Bar', 'Foo']);
  });

  it('sees inline type specifiers and aliases alike', () => {
    const { names } = publicExportNames(
      `export { create, type Options, internal as publicName } from './lib/x';`,
    );

    expect(names).toEqual(['Options', 'create', 'publicName']);
  });

  // The core index groups its re-exports under line comments. A name that
  // follows one must count like any other, or it silently leaves the gate.
  it('sees a name that follows a comment inside the block', () => {
    const { names } = publicExportNames(
      [
        'export {',
        '  // Array',
        '  first,',
        '  last,',
        '  /* Number */ abs,',
        '  // Signals',
        '  type Signal,',
        "} from './lib/utils';",
      ].join('\n'),
    );

    expect(names).toEqual(['Signal', 'abs', 'first', 'last']);
  });

  it('sees what the file declares itself', () => {
    const { names } = publicExportNames(
      `export interface Props {}\nexport const build = () => 1;`,
    );

    expect(names).toEqual(['Props', 'build']);
  });

  it('leaves out what another package publishes', () => {
    const { names } = publicExportNames(
      `export { createSignal, type Signal } from '@reelkit/core';\nexport type { Own } from './own';`,
    );

    expect(names).toEqual(['Own']);
  });

  it('reports a star re-export as not enumerable', () => {
    expect(publicExportNames(`export * from './lib';`).hasStarExport).toBe(
      true,
    );
    expect(publicExportNames(`export { a } from './lib';`).hasStarExport).toBe(
      false,
    );
  });
});

// The tag lives on the declaration, and an index usually re-exports from a
// module that may re-export again, so the lookup has to follow the name.
describe('docs-check internal exports', () => {
  const modules: Record<string, string> = {
    'pkg/lib/utils/index.ts': [
      "export { timeout, type TimeoutFn } from './timeout';",
      "export { clamp } from './number';",
    ].join('\n'),
    'pkg/lib/utils/timeout.ts': [
      '/** Delay with cancel. @internal Plumbing for the controllers. */',
      'export const timeout = () => 0;',
      '/**',
      ' * Callable with cancel.',
      ' * @internal',
      ' */',
      'export type TimeoutFn = () => void;',
    ].join('\n'),
    'pkg/lib/utils/number.ts': [
      '/** Keeps a value in range. */',
      'export const clamp = (v: number) => v;',
    ].join('\n'),
    'pkg/lib/context.ts': [
      '/** @internal */',
      'export const RawContext = 1;',
      'export const useContextValue = () => 1;',
    ].join('\n'),
  };
  const resolve = (fromDir: string, specifier: string) => {
    const base = join(fromDir, specifier);
    for (const path of [`${base}.ts`, join(base, 'index.ts')]) {
      if (path in modules) return { src: modules[path], dir: join(path, '..') };
    }
    return null;
  };

  it('finds a tag through a module that re-exports the name again', () => {
    const index = `export { timeout, type TimeoutFn, clamp } from './lib/utils';`;
    expect(internalExportNames(index, resolve, 'pkg')).toEqual([
      'TimeoutFn',
      'timeout',
    ]);
  });

  it('counts an untagged neighbour in the same export block', () => {
    const index = `export { RawContext, useContextValue } from './lib/context';`;
    expect(internalExportNames(index, resolve, 'pkg')).toEqual(['RawContext']);
  });

  it('reads a tag on a declaration the index makes itself', () => {
    const index = [
      '/** @internal Wiring only. */',
      'export const wiring = 1;',
      '/** Public. */',
      'export const api = 1;',
    ].join('\n');
    expect(internalExportNames(index, resolve, 'pkg')).toEqual(['wiring']);
  });

  it('publishes an alias under its exported name', () => {
    const index = `export { RawContext as Context } from './lib/context';`;
    expect(internalExportNames(index, resolve, 'pkg')).toEqual(['Context']);
  });

  // With stripInternal the tag deletes the published type, so the gate has to
  // refuse it rather than quietly skip the symbol.
  it('refuses a tag in a package that strips internals', () => {
    expect(
      strippedInternals({ compilerOptions: { stripInternal: true } }, ['A']),
    ).toEqual(['A']);
    expect(strippedInternals({ compilerOptions: {} }, ['A'])).toEqual([]);
  });
});

// An API page reads from what a reader renders to what they call, so a
// component filed below the hooks, under utilities, is out of place.
describe('docs-check component order', () => {
  const values = ['Reel', 'SwipeToClose', 'useSoundState', 'createThing'];

  it('reports a component documented after the hooks section', () => {
    const page = [
      '## Reel [#reel]',
      '## Hooks [#hooks]',
      '### useSoundState [#usesoundstate]',
      '## Utilities [#utilities]',
      '### SwipeToClose [#swipetoclose]',
    ].join('\n');
    expect(componentsAfterHooks(page, values)).toEqual(['SwipeToClose']);
  });

  it('accepts components above the hooks and the mirror heading form', () => {
    const mirror = [
      '## Reel',
      '## SwipeToClose',
      '## Composables',
      '### useSoundState',
      '### createThing',
    ].join('\n');
    expect(componentsAfterHooks(mirror, values)).toEqual([]);
  });

  it('ignores a styling group named after a component', () => {
    const page = [
      '## Hooks',
      '### useSoundState',
      '## CSS Theming Tokens',
      '### SwipeToClose',
    ].join('\n');
    expect(componentsAfterHooks(page, values)).toEqual([]);
  });

  it('leaves a page without a hooks section alone', () => {
    expect(componentsAfterHooks('## Utilities\n### Reel', values)).toEqual([]);
  });
});

// A translation drops ordinary words such as "first" but must keep the
// identifier, so only a mention written as code counts toward it.
describe('docs-check mentions written as code', () => {
  it('counts backticks, a component tag and a call', () => {
    expect(mentionsAsCode('Use `first` to read it.', 'first')).toBe(true);
    expect(mentionsAsCode('<Counter class="x" />', 'Counter')).toBe(true);
    expect(mentionsAsCode('const c = clamp(1, 0, 2);', 'clamp')).toBe(true);
    expect(
      mentionsAsCode('const g = useTimeline<Item>();', 'useTimeline'),
    ).toBe(true);
  });

  it('ignores the same name as a plain word', () => {
    expect(mentionsAsCode('The first slide opens.', 'first')).toBe(false);
    expect(mentionsAsCode('A counter in the corner.', 'Counter')).toBe(false);
  });
});

// The README rule asks which capabilities a package hands a reader, so it
// looks at what exists at runtime. A type carrying a capability's name — the
// props of a component, the shape of a controller — is not the capability, and
// counting it would demand a README list prop-type aliases to pass.
describe('docs-check value export enumeration', () => {
  it('leaves out a type-only block and an inline type specifier', () => {
    const { valueNames } = publicExportNames(
      [
        `export type { LightboxUrlOverlayProps } from './lib/x';`,
        `export { LightboxUrlOverlay, type SlideProps } from './lib/x';`,
      ].join('\n'),
    );

    expect(valueNames).toEqual(['LightboxUrlOverlay']);
  });

  it('keeps the declarations that exist at runtime and drops the rest', () => {
    const { valueNames } = publicExportNames(
      [
        'export interface Options {}',
        'export type Mode = 1 | 2;',
        'export const build = () => 1;',
        'export function make() {}',
        'export class Thing {}',
      ].join('\n'),
    );

    expect(valueNames).toEqual(['Thing', 'build', 'make']);
  });

  it('keeps an alias under its published name', () => {
    const { valueNames } = publicExportNames(
      `export { internal as TimelineBar } from './lib/x';`,
    );

    expect(valueNames).toEqual(['TimelineBar']);
  });
});

// A README is the package's whole page on npm. The surfaces rule only proves a
// few flagged exports are named somewhere in it, which a stub does by
// mentioning each once — so the section set is what catches a thin page. The
// baseline is read off the tree rather than invented: these are the sections
// every published package already carried when the rule was written.
describe('package README sections', () => {
  const root = join(import.meta.dirname, '../../../..');
  const config = JSON.parse(
    readFileSync(join(root, 'scripts/docs-check.config.json'), 'utf8'),
  );
  const required: string[] = config.readmeSections;

  const readmes: string[] = config.surfaces
    .map((surface: { package: string }) =>
      surface.package.replace(/\/src\/index\.ts$/, '/README.md'),
    )
    .filter((readme: string) => existsSync(join(root, readme)));

  it.each(readmes)('%s carries every baseline section', (readme) => {
    const headings = [
      ...readFileSync(join(root, readme), 'utf8').matchAll(/^##\s+(.+?)\s*$/gm),
    ].map((match) => match[1]);
    expect(required.filter((section) => !headings.includes(section))).toEqual(
      [],
    );
  });

  // Guards the baseline itself: an empty list would pass every README.
  it('requires a baseline worth checking', () => {
    expect(required.length).toBeGreaterThanOrEqual(4);
    expect(readmes.length).toBeGreaterThan(0);
  });

  // The export map announces nothing, so a package that ships a stylesheet is
  // unstyled for anyone who follows a README that never mentions it.
  it.each(readmes)('%s names the stylesheet it ships', (readme) => {
    const dir = readme.replace(/\/README\.md$/, '');
    const manifest = join(root, dir, 'package.json');
    if (!existsSync(manifest)) return;
    const { name, exports } = JSON.parse(readFileSync(manifest, 'utf8'));
    if (!exports?.['./styles.css']) return;
    expect(readFileSync(join(root, readme), 'utf8')).toContain(
      `${name}/styles.css`,
    );
  });

  // `homepage` is the link npm shows, followed before anything is installed.
  // Two Angular packages pointed at the React docs for their own component,
  // and the four bindings pointed at the site root.
  it.each(readmes)('%s links npm at its own docs section', (readme) => {
    const dir = readme.replace(/\/README\.md$/, '');
    const manifest = join(root, dir, 'package.json');
    if (!existsSync(manifest)) return;
    const { name, homepage } = JSON.parse(readFileSync(manifest, 'utf8'));
    const surface = config.surfaces.find(
      (s: { package: string }) => s.package === `${dir}/src/index.ts`,
    );
    if (!surface) return;
    const section = surface.page
      .replace(/^apps\/docs\/src\/content\/en\/docs\//, '')
      .replace(/\.mdx$/, '')
      .split('/')[0];
    expect(homepage, name).toBeDefined();
    expect(homepage.split('?')[0]).toContain(`/docs/${section}`);
  });

  // Without the parameter the docs site opens an Angular or Vue reader on the
  // React view of the very component they installed.
  it.each(readmes)('%s keeps its docs links on its own binding', (readme) => {
    const manifest = join(
      root,
      readme.replace(/\/README\.md$/, ''),
      'package.json',
    );
    if (!existsSync(manifest)) return;
    const { name } = JSON.parse(readFileSync(manifest, 'utf8'));
    if (!/^@reelkit\/(angular|vue)(-|$)/.test(name)) return;
    const unparameterised = [
      ...readFileSync(join(root, readme), 'utf8').matchAll(
        /https:\/\/reelkit\.dev\/docs\/[^)"\s]+/g,
      ),
    ]
      .map(([link]) => link)
      .filter((link) => !link.includes('framework='));
    expect(unparameterised).toEqual([]);
  });
});

// The module block on an entry point is what an editor shows on hover and what
// a reader meets first in `node_modules`, and the example is the part they act
// on. Every other check here passes on prose alone — the exports are all
// documented, the page and the mirror agree — so a package can ship a header
// that explains itself and never shows a line anyone can paste.
describe('module examples on package entry points', () => {
  const root = join(import.meta.dirname, '../../../..');
  const config = JSON.parse(
    readFileSync(join(root, 'scripts/docs-check.config.json'), 'utf8'),
  );
  const moduleBlock = (pkg: string) =>
    readFileSync(join(root, pkg), 'utf8').match(/^\/\*\*[\s\S]*?\*\//)?.[0] ??
    '';

  const carried: string[] = config.knownMissingModuleExamples ?? [];
  const expected: string[] = config.surfaces
    .map((surface: { package: string }) => surface.package)
    .filter((pkg: string) => !carried.includes(pkg));

  it.each(expected)('%s shows the reader a worked example', (pkg) => {
    expect(moduleBlock(pkg)).toMatch(/@example\b/);
  });

  // The baseline exists to keep pre-existing gaps listed rather than exempt.
  // An entry that quietly gains an example should leave the list, or it goes
  // on excusing a package that no longer needs excusing.
  it.each(carried)('%s is still owed one', (pkg) => {
    expect(moduleBlock(pkg)).not.toMatch(/@example\b/);
  });
});

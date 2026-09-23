import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// The script under test lives with the other repo scripts, outside any
// project; this is the only place in the workspace that can run it.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { publicExportNames } from '../../../../scripts/lib/publicExports.mjs';

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

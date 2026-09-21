import { describe, expect, it } from 'vitest';
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

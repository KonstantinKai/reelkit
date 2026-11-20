import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  asBeforeWriteFile,
  createSpecifierRewriter,
} from '../../../scripts/lib/dtsSpecifiers.mjs';

describe('the beforeWriteFile hook built from a rewrite', () => {
  it('replaces the content and keeps the file path', () => {
    const hook = asBeforeWriteFile(
      (filePath, content) => `${filePath}|${content}`,
    );
    expect(hook('dist/a.d.ts', 'x')).toEqual({ content: 'dist/a.d.ts|x' });
  });

  it('is how every package config hands its rewriter to the declaration plugin', () => {
    const packages = join(import.meta.dirname, '../../../packages');
    const configs = readdirSync(packages)
      .map((name) => join(packages, name, 'vite.config.mts'))
      .filter(existsSync)
      .map((path) => ({ path, text: readFileSync(path, 'utf8') }))
      .filter(({ text }) => text.includes('dts({'));

    expect(configs.length).toBe(10);
    for (const { path, text } of configs) {
      expect(text, path).toContain(
        'const beforeWriteFile = asBeforeWriteFile(',
      );
      expect(text, path).toMatch(/^\s+beforeWriteFile,$/m);
    }
  });
});

describe('relative specifiers in emitted declarations', () => {
  let root: string;
  let rewrite: (filePath: string, content: string) => string;
  let outDir: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'rk-dts-'));
    const src = join(root, 'src');
    mkdirSync(join(src, 'lib/dom'), { recursive: true });
    for (const file of [
      'index.ts',
      'types.ts',
      'Reel.tsx',
      'lib/utils.ts',
      'lib/dom/index.ts',
    ]) {
      writeFileSync(join(src, file), '');
    }
    outDir = join(root, 'dist');
    rewrite = createSpecifierRewriter({ outDir, srcDir: src });
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const atRoot = (content: string) =>
    rewrite(join(outDir, 'index.d.ts'), content);

  it('adds .js to a specifier naming a source file', () => {
    expect(atRoot("export { a } from './types';")).toBe(
      "export { a } from './types.js';",
    );
  });

  it('points a folder specifier at its index', () => {
    expect(atRoot("export * from './lib/dom';")).toBe(
      "export * from './lib/dom/index.js';",
    );
  });

  it('finds a source written as .tsx', () => {
    expect(atRoot("import { Reel } from './Reel';")).toBe(
      "import { Reel } from './Reel.js';",
    );
  });

  it('rewrites type-only exports and double-quoted specifiers', () => {
    expect(atRoot('export type { A } from "./types";')).toBe(
      'export type { A } from "./types.js";',
    );
  });

  it('rewrites import types', () => {
    expect(atRoot("type R = import('./types').A;")).toBe(
      "type R = import('./types.js').A;",
    );
  });

  it('resolves parent specifiers from a nested declaration', () => {
    expect(
      rewrite(
        join(outDir, 'lib/dom/index.d.ts'),
        "export { u } from '../utils';",
      ),
    ).toBe("export { u } from '../utils.js';");
  });

  it('leaves a specifier that already names its file alone', () => {
    const content =
      "export { a } from './types.js';\nexport { b } from './types.d.ts';";
    expect(atRoot(content)).toBe(content);
  });

  it('leaves package specifiers alone', () => {
    const content =
      "import type { Signal } from '@reelkit/core';\nimport { FC } from 'react';";
    expect(atRoot(content)).toBe(content);
  });

  it('leaves imports quoted in comments alone, even ones that name nothing', () => {
    const content = [
      '/**',
      ' * @example',
      " * import { api } from './api';",
      ' */',
      "// export { gone } from './gone';",
      "export { a } from './types';",
    ].join('\n');
    expect(atRoot(content)).toBe(content.replace("'./types'", "'./types.js'"));
  });

  it('does not read a double slash inside a template literal type as a comment', () => {
    expect(
      atRoot("type U = `https://${string}`; export { a } from './types';"),
    ).toBe("type U = `https://${string}`; export { a } from './types.js';");
  });

  it('fails on a specifier that names neither a file nor a folder', () => {
    expect(() => atRoot("export { x } from './missing';")).toThrow(
      /'\.\/missing'/,
    );
  });

  it('decides from the sources without an output folder on disk', () => {
    expect(existsSync(outDir)).toBe(false);
  });
});

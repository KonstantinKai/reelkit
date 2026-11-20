import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

// TypeScript 7 exports neither its binary nor its folder, only its manifest,
// so the compiler is located through the `bin` entry the manifest names.
const compilerBin = (packageName: string) => {
  const manifest = require.resolve(`${packageName}/package.json`);
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8'));
  return join(dirname(manifest), bin.tsc);
};

// The workspace compiler, and TypeScript 7 (the native compiler) installed
// under an alias so the two versions sit side by side.
const compilers = [
  { name: 'TypeScript 5.9', bin: compilerBin('typescript') },
  { name: 'TypeScript 7', bin: compilerBin('typescript-7') },
];

// `nodenext` reads the declarations as ES modules and needs the extensions;
// `bundler` is what Vite, webpack and Next.js consumers use, and must keep
// working with them.
const resolutions = [
  { name: 'nodenext', config: 'tsconfig.fixture.json' },
  { name: 'bundler', config: 'tsconfig.fixture.bundler.json' },
];

describe('published declarations', () => {
  for (const compiler of compilers) {
    for (const resolution of resolutions) {
      it(`type check a consumer on ${resolution.name} resolution with ${compiler.name}, every export typed and none of them any`, () => {
        const result = spawnSync(
          process.execPath,
          [
            compiler.bin,
            '-p',
            join(import.meta.dirname, '..', resolution.config),
          ],
          { encoding: 'utf8' },
        );

        expect(result.stdout + result.stderr).toBe('');
        expect(result.status).toBe(0);
      });
    }
  }
});

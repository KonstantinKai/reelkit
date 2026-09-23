import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kBundleSizes } from '../data/bundleSizes';
import { kLocales } from './locale';

const repoRoot = join(import.meta.dirname, '../../../..');
const homeDir = join(import.meta.dirname, 'home');

/**
 * `scripts/update-sizes.mjs` measures every package and rewrites the README
 * badges, but it knows nothing about this site — so a figure quoted in the
 * docs drifts silently the moment a package grows. The badge is the measured
 * value; everything here is checked against it.
 */
function measuredCoreGzip(): number {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8');
  const badge = readme.match(/core%20gzip-([\d.]+)%20kB/);
  expect(badge, 'README has no core gzip badge to check against').toBeTruthy();
  return Number(badge![1]);
}

/** The chrome dictionaries, which hold the landing page copy per language. */
const dictionaries = kLocales.map((locale) => `${locale}.ts`);

describe('quoted bundle sizes', () => {
  // The landing page sells the number in prose, one translation per locale,
  // none of which any build step reads.
  it('quotes the measured core size in every language', () => {
    const measured = measuredCoreGzip();
    const quoted: string[] = [];

    for (const dictionary of dictionaries) {
      const source = readFileSync(join(homeDir, dictionary), 'utf8');
      for (const [, value] of source.matchAll(/~?\s*([\d.]+)\s*(?:kB|кБ)/g)) {
        quoted.push(`${dictionary}: ${value}`);
        expect(
          Math.abs(Number(value) - measured),
          `${dictionary} quotes ${value} kB, measured is ${measured} kB`,
        ).toBeLessThanOrEqual(0.5);
      }
    }

    // A silent pass because the wording changed and nothing matched would be
    // worse than a wrong number.
    expect(quoted.length, 'no dictionary quotes a core size any more').toBe(
      dictionaries.length,
    );
  });

  // The refresh script rewrites the quoted size in each file it names, and a
  // file it does not name is left at whatever number it was written with. The
  // script reports "no change" for a file it never reads, so a missing path
  // reads exactly like an up-to-date one.
  it('names every dictionary in the size refresh script', () => {
    const script = readFileSync(
      join(repoRoot, 'scripts/update-sizes.mjs'),
      'utf8',
    );
    for (const dictionary of dictionaries) {
      expect(
        script,
        `scripts/update-sizes.mjs never rewrites ${dictionary}`,
      ).toContain(`apps/docs/src/i18n/home/${dictionary}`);
    }
  });

  // The rewrite is a regular expression over the source: a single-quoted
  // description holding a decimal size and an ASCII space before the unit. A
  // translation that writes 3,2 kB, or splits the string, silently stops
  // being updated — and only the next size bump would show it.
  it('leaves every dictionary in the shape the refresh script rewrites', () => {
    const rewrite = /(description:\s*'[^']*?)\d+\.\d+( (?:kB|кБ)[^']*')/;
    for (const dictionary of dictionaries) {
      const source = readFileSync(join(homeDir, dictionary), 'utf8');
      expect(
        rewrite.test(source),
        `${dictionary} quotes no size the refresh script can rewrite`,
      ).toBe(true);
    }
  });

  // The installation page in every locale renders its size table from this
  // one data module, so one check covers them all.
  it('lists the measured core size in the installation table', () => {
    const core = kBundleSizes.find((size) => size.name === '@reelkit/core');
    expect(core, 'installation table has no core row').toBeTruthy();
    expect(Number(core!.gzip.replace(' kB', ''))).toBe(measuredCoreGzip());
  });
});

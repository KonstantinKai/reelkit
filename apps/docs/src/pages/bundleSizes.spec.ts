import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

const repoRoot = join(import.meta.dirname, '../../../..');
const pagesDir = join(import.meta.dirname);

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

describe('quoted bundle sizes', () => {
  // The home page sells the number in prose, one translation per locale, none
  // of which any build step reads.
  it('quotes the measured core size on every home page', async () => {
    const measured = measuredCoreGzip();
    const homes = ['Home.tsx'];
    for await (const entry of glob('*/Home.tsx', { cwd: pagesDir })) {
      homes.push(entry);
    }

    const quoted: string[] = [];
    for (const home of homes) {
      const source = readFileSync(join(pagesDir, home), 'utf8');
      for (const [, value] of source.matchAll(/~?\s*([\d.]+)\s*(?:kB|кБ)/g)) {
        quoted.push(`${home}: ${value}`);
        expect(
          Math.abs(Number(value) - measured),
          `${home} quotes ${value} kB, measured is ${measured} kB`,
        ).toBeLessThanOrEqual(0.5);
      }
    }
    // A silent pass because the wording changed and nothing matched would be
    // worse than a wrong number.
    expect(quoted.length, 'no home page quotes a core size any more').toBe(
      homes.length,
    );
  });

  it('lists the measured core size in the installation table', () => {
    const source = readFileSync(
      join(pagesDir, 'docs/Installation.tsx'),
      'utf8',
    );
    const row = source.match(
      /name: '@reelkit\/core',[\s\S]*?gzip: '([\d.]+) kB'/,
    );
    expect(row, 'installation table has no core row').toBeTruthy();
    expect(Number(row![1])).toBe(measuredCoreGzip());
  });
});

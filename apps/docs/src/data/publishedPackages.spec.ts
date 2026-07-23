import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { publishedPackages } from './publishedPackages';

// Walks up from this file to the workspace root rather than hardcoding a depth,
// so moving the docs app does not silently break the comparison.
const workspaceRoot = (() => {
  let dir = resolve(__dirname);
  while (!existsSync(join(dir, 'nx.json'))) {
    const parent = resolve(dir, '..');
    if (parent === dir) throw new Error('nx.json not found above ' + __dirname);
    dir = parent;
  }
  return dir;
})();

// nx releases `packages/*` minus anything marked private, so that is the set the
// legal pages have to name. Read it from disk instead of restating it here —
// a copy would drift exactly the way the pages did.
const releasedPackageNames = (): string[] => {
  const packagesDir = join(workspaceRoot, 'packages');

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesDir, entry.name, 'package.json'))
    .filter((manifestPath) => existsSync(manifestPath))
    .map(
      (manifestPath) =>
        JSON.parse(readFileSync(manifestPath, 'utf8')) as {
          name: string;
          private?: boolean;
        },
    )
    .filter((manifest) => !manifest.private)
    .map((manifest) => manifest.name);
};

describe('published package list', () => {
  // Both legal pages render this list, so a mismatch here means reelkit.dev is
  // publicly naming the wrong packages.
  it('names exactly the packages the workspace releases', () => {
    const documented = publishedPackages.map((entry) => entry.name).sort();

    expect(documented).toEqual(releasedPackageNames().sort());
  });

  it('describes every package it names', () => {
    const undescribed = publishedPackages.filter(
      (entry) => entry.description.trim() === '',
    );

    expect(undescribed).toEqual([]);
  });

  it('names each package once', () => {
    const names = publishedPackages.map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });
});

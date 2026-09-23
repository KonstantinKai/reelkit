import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The release runs this script, and a changelog is read once — on the day it
// ships — so a wrong order is not something anyone goes back and fixes. The
// script lives with the other repo scripts, outside any project.
// eslint-disable-next-line @nx/enforce-module-boundaries
const script = join(
  import.meta.dirname,
  '../../../../scripts/sort-changelog.mjs',
);

const entry = (name: string, date: string) =>
  `## @reelkit/${name} (${date})\n\nbody for ${name}\n\n`;

/** One release run, in the order nx happens to emit it, plus an older entry. */
const fixture = [
  entry('core@0.8.2', '2026-09-23'),
  entry('angular-stories-player@0.1.0', '2026-09-23'),
  entry('react-reel-player@0.6.3', '2026-09-23'),
  entry('vue-stories-player@0.1.0', '2026-09-23'),
  entry('angular-lightbox@0.6.0', '2026-09-23'),
  entry('react-stories-player@0.5.1', '2026-09-22'),
].join('');

function sort(args: string[] = []): string[] {
  const file = join(
    mkdtempSync(join(tmpdir(), 'rk-changelog-')),
    'CHANGELOG.md',
  );
  writeFileSync(file, fixture, 'utf8');
  execFileSync('node', [script, `--file=${file}`, ...args], { stdio: 'pipe' });
  return [
    ...readFileSync(file, 'utf8').matchAll(/^## @reelkit\/(\S+?)@/gm),
  ].map((match) => match[1]);
}

describe('changelog ordering', () => {
  it('leads with reel players and buries the core, by default', () => {
    expect(sort()).toEqual([
      'react-reel-player',
      'vue-stories-player',
      'angular-stories-player',
      'angular-lightbox',
      'core',
      // Published a day earlier, so it is not part of this run and stays put.
      'react-stories-player',
    ]);
  });

  it('leads with the capability named in --top', () => {
    expect(sort(['--top=stories-player']).slice(0, 2)).toEqual([
      'vue-stories-player',
      'angular-stories-player',
    ]);
  });

  // Promoting a capability must not reshuffle the frameworks inside it, which
  // is the part a reader scans once they have found their player.
  it('keeps framework order inside a promoted capability', () => {
    const promoted = sort(['--top=stories-player']);
    expect(promoted.indexOf('vue-stories-player')).toBeLessThan(
      promoted.indexOf('angular-stories-player'),
    );
  });

  it('honours the order several promoted capabilities are given in', () => {
    expect(sort(['--top=lightbox,core']).slice(0, 2)).toEqual([
      'angular-lightbox',
      'core',
    ]);
  });

  // A typo that sorted anyway would print "already in order" and ship a
  // changelog nobody asked for, which is worse than refusing to run.
  it('refuses a capability it does not know, leaving the file alone', () => {
    const file = join(
      mkdtempSync(join(tmpdir(), 'rk-changelog-')),
      'CHANGELOG.md',
    );
    writeFileSync(file, fixture, 'utf8');

    expect(() =>
      execFileSync('node', [script, `--file=${file}`, '--top=stories-playr'], {
        stdio: 'pipe',
      }),
    ).toThrow();
    expect(readFileSync(file, 'utf8')).toBe(fixture);
  });
});

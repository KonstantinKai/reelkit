#!/usr/bin/env node

/**
 * Orders the entries `nx release` just wrote so the changelog reads by
 * importance rather than by whatever order the release ran the projects in.
 *
 * nx renders one entry per project and appends them as it goes, which puts the
 * core engine above the players and scatters the frameworks. A reader opening
 * the changelog wants the thing they use first. This was reordered by hand
 * after the last two releases; doing it by hand is how it gets forgotten.
 *
 * Only the newest run is touched — the entries sharing the date of the top
 * entry, which is exactly what the release just added. Everything published
 * before stays where it is.
 *
 * Usage:
 *   node scripts/sort-changelog.mjs           # sort the newest run in place
 *   node scripts/sort-changelog.mjs --check   # exit 1 if that run is unsorted
 *   node scripts/sort-changelog.mjs --amend   # sort, then fold into the release commit
 *   node scripts/sort-changelog.mjs --file=x  # operate on another file (tests)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const isCheck = process.argv.includes('--check');
const shouldAmend = process.argv.includes('--amend');
const fileArg = process.argv
  .find((arg) => arg.startsWith('--file='))
  ?.slice('--file='.length);
const file = resolve(root, fileArg ?? 'CHANGELOG.md');

/**
 * Reading order, most-asked-about first. A package's rank is its capability,
 * then its framework, so a release lands as reel players, stories players,
 * lightboxes, the stories engine, the bindings, then the core underneath them
 * all. Extend this when a new capability ships; anything unlisted sorts last,
 * where it is visible rather than silently mixed in.
 */
const kCapabilityOrder = [
  'reel-player',
  'stories-player',
  'lightbox',
  'stories-core',
  'binding',
  'core',
];

/** Frameworks in the order the documentation sidebar lists them. */
const kFrameworkOrder = ['react', 'vue', 'angular'];

/**
 * Where a heading sorts. An entry that names no package — the hand-written
 * documentation notes — leads the run: it speaks for the whole release.
 */
function rankOf(heading) {
  const name = heading.match(/^@reelkit\/([a-z-]+)@/)?.[1];
  if (!name) return { lead: true, capability: -1, framework: -1, name: '' };

  const framework = kFrameworkOrder.find(
    (candidate) => name === candidate || name.startsWith(`${candidate}-`),
  );
  const bare = framework
    ? name.slice(framework.length).replace(/^-/, '')
    : name;
  const capability = bare === '' ? 'binding' : bare;

  return {
    lead: false,
    capability: kCapabilityOrder.indexOf(capability),
    framework: framework ? kFrameworkOrder.indexOf(framework) : -1,
    name,
  };
}

/** An unlisted capability sorts after every listed one, not in the middle. */
const capabilityRank = (rank) =>
  rank.capability === -1 ? kCapabilityOrder.length : rank.capability;

const source = readFileSync(file, 'utf8');

// Each entry runs from its `## <heading> (<date>)` line to the next one.
const starts = [...source.matchAll(/^## (.+?) \((\d{4}-\d{2}-\d{2})\)$/gm)];
if (!starts.length) {
  console.error(`${file}: no dated \`## \` entries — nothing to sort.`);
  process.exit(1);
}

const entries = starts.map((match, at) => ({
  heading: match[1],
  date: match[2],
  body: source.slice(
    match.index,
    at + 1 < starts.length ? starts[at + 1].index : source.length,
  ),
}));

// The run the release just wrote: the leading entries carrying the top entry's
// date. An older entry further down may share that date — a documentation note
// from an earlier day, say — and must stay where it is.
const newest = entries[0].date;
let runLength = 0;
while (runLength < entries.length && entries[runLength].date === newest) {
  runLength += 1;
}

const run = entries.slice(0, runLength);
const sorted = [...run].sort((a, b) => {
  const left = rankOf(a.heading);
  const right = rankOf(b.heading);
  if (left.lead !== right.lead) return left.lead ? -1 : 1;
  if (left.lead && right.lead) return 0;
  if (capabilityRank(left) !== capabilityRank(right)) {
    return capabilityRank(left) - capabilityRank(right);
  }
  if (left.framework !== right.framework)
    return left.framework - right.framework;
  return left.name.localeCompare(right.name);
});

const unchanged = sorted.every((entry, at) => entry === run[at]);
const order = sorted.map((entry) => entry.heading);

if (unchanged) {
  console.log(
    `sort-changelog: the ${newest} entries are already in reading order (${run.length} entr${run.length === 1 ? 'y' : 'ies'}).`,
  );
  process.exit(0);
}

if (isCheck) {
  console.error(
    `sort-changelog: the ${newest} entries are out of order. Expected:\n${order
      .map((heading) => `  ${heading}`)
      .join('\n')}\n\nRun: pnpm sort-changelog`,
  );
  process.exit(1);
}

const rest = entries.slice(runLength);
writeFileSync(
  file,
  [...sorted, ...rest].map((entry) => entry.body).join(''),
  'utf8',
);
console.log(
  `sort-changelog: reordered the ${newest} entries:\n${order
    .map((heading) => `  ${heading}`)
    .join('\n')}`,
);

if (!shouldAmend) process.exit(0);

// The release commit and its tags were written before the sort, so the tagged
// tree holds the unsorted file. Amending rewrites that commit, which leaves the
// tags pointing at the commit it replaced — they have to be moved with it.
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

if (git('rev-parse', '--abbrev-ref', 'HEAD') === 'HEAD') {
  console.log('  HEAD is detached — leaving the sorted file uncommitted.');
  process.exit(0);
}
if (git('branch', '-r', '--contains', 'HEAD')) {
  console.log(
    '  HEAD is already on a remote — leaving the sorted file uncommitted, commit it separately.',
  );
  process.exit(0);
}

const tags = git('tag', '--points-at', 'HEAD').split('\n').filter(Boolean);
git('add', file);
execFileSync('git', ['commit', '--amend', '--no-edit', '--no-verify'], {
  cwd: root,
  stdio: 'inherit',
});
for (const tag of tags) git('tag', '-f', tag, 'HEAD');

console.log(
  tags.length
    ? `  folded into ${git('rev-parse', '--short', 'HEAD')} and moved ${tags.length} tag(s) with it.`
    : `  folded into ${git('rev-parse', '--short', 'HEAD')}.`,
);

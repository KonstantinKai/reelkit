#!/usr/bin/env node

/**
 * Creates the GitHub release for every changelog entry a release commit adds.
 *
 * `nx release` writes one `## @reelkit/<package>@<version> (<date>)` entry per
 * package into CHANGELOG.md and tags the release commit with each name. The
 * release notes are that entry without its heading, which is how they were
 * written by hand before this ran in CI.
 *
 * It compares CHANGELOG.md at two commits instead of listening for tags,
 * because GitHub fires no tag push event when one push carries more than three
 * tags, and a release here pushes ten or more. The tags arrive a moment after
 * the commit (`git push && git push --tags`), so each one is waited for before
 * its release is created against it; nothing here ever creates a tag.
 *
 * The first new entry is marked as the latest release. The changelog sort puts
 * the release's lead capability first (`pnpm release:prepare --top=…`), so the
 * release the repository page shows is the one the release was about.
 *
 * A release that already exists is left alone, so a failed run can be rerun.
 *
 * Usage:
 *   node scripts/github-releases.mjs --base=<commit>   # entries added since <commit>
 *   node scripts/github-releases.mjs --base=HEAD^ --dry-run
 *   node scripts/github-releases.mjs --base-file=a.md --head-file=b.md --dry-run
 *                                    # compare two files (tests)
 *   --head=<commit>   compare against this commit instead of HEAD
 *   --wait=<seconds>  how long to wait for each tag (default 300)
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const option = (name) =>
  process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.slice(name.length + 3);

const isDryRun = process.argv.includes('--dry-run');
const waitSeconds = Number(option('wait') ?? 300);
const pollSeconds = 10;

const fail = (message) => {
  console.error(`github-releases: ${message}`);
  process.exit(1);
};

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: 'pipe' });

const changelogAt = (commit) => {
  try {
    return git('show', `${commit}:CHANGELOG.md`);
  } catch {
    fail(`cannot read CHANGELOG.md at ${commit}`);
  }
};

/**
 * Package entries in file order. Each runs from its heading to the next `## `
 * heading; the dated "Documentation" entries name no package and are skipped.
 */
const entriesOf = (text) => {
  const entries = [];
  let current = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      const match = line.match(/^## (@reelkit\/\S+@\d\S*) \(/);
      current = match ? { tag: match[1], lines: [] } : null;
      if (current) entries.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return entries.map(({ tag, lines }) => ({
    tag,
    notes: `${lines.join('\n').trim()}\n`,
  }));
};

const baseFile = option('base-file');
const headFile = option('head-file');
const base = option('base');

let before;
let after;
if (baseFile && headFile) {
  before = readFileSync(baseFile, 'utf8');
  after = readFileSync(headFile, 'utf8');
} else if (base) {
  // A push that creates the branch reports an all-zero "before"; comparing
  // against nothing would release every entry the changelog has ever had.
  if (/^0+$/.test(base)) fail('no previous commit to compare against');
  before = changelogAt(base);
  after = changelogAt(option('head') ?? 'HEAD');
} else {
  fail('pass --base=<commit>, or --base-file and --head-file');
}

const released = new Set(entriesOf(before).map((entry) => entry.tag));
const plan = entriesOf(after)
  .filter((entry) => !released.has(entry.tag))
  .map((entry, index) => ({ ...entry, latest: index === 0 }));

if (plan.length === 0) {
  console.log('github-releases: no new changelog entries');
  process.exit(0);
}

if (isDryRun) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}

const tagIsPushed = (tag) =>
  git('ls-remote', '--tags', 'origin', `refs/tags/${tag}`).trim() !== '';

const waitForTag = (tag) => {
  const deadline = Date.now() + waitSeconds * 1000;
  while (!tagIsPushed(tag)) {
    if (Date.now() > deadline) {
      fail(`tag ${tag} did not reach origin within ${waitSeconds}s`);
    }
    execFileSync('sleep', [String(pollSeconds)]);
  }
};

const releaseExists = (tag) => {
  try {
    execFileSync('gh', ['release', 'view', tag], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const notesDir = mkdtempSync(join(tmpdir(), 'rk-release-notes-'));

for (const [index, { tag, notes, latest }] of plan.entries()) {
  if (releaseExists(tag)) {
    console.log(`github-releases: ${tag} already released, skipped`);
    continue;
  }
  waitForTag(tag);
  const notesFile = join(notesDir, `${index}.md`);
  writeFileSync(notesFile, notes, 'utf8');
  execFileSync(
    'gh',
    [
      'release',
      'create',
      tag,
      '--title',
      tag,
      '--notes-file',
      notesFile,
      '--verify-tag',
      latest ? '--latest' : '--latest=false',
    ],
    { stdio: 'inherit' },
  );
  console.log(`github-releases: released ${tag}${latest ? ' (latest)' : ''}`);
}

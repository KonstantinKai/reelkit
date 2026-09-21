#!/usr/bin/env node

/**
 * Measures statement coverage per package and rewrites the coverage badges —
 * one per package README, plus the workspace total in the root README.
 *
 * Badges were hand-written before this existed, and they drifted: three of
 * them claimed a number the suite had not produced in months, always in the
 * flattering direction. A badge nobody can recompute is decoration.
 *
 * Usage:
 *   node scripts/update-coverage.mjs             # measure & update
 *   node scripts/update-coverage.mjs --check     # CI mode — fail if stale
 *   node scripts/update-coverage.mjs --dry-run   # measure & print table only
 *   node scripts/update-coverage.mjs --reuse     # skip the run, read the last report
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const isCheck = process.argv.includes('--check');
const isDryRun = process.argv.includes('--dry-run');
const reuse = process.argv.includes('--reuse');

/**
 * Every published package that runs tests, with the runner behind its `test`
 * target. The two runners spell the coverage flags differently and cannot be
 * asked in one command, so they are collected separately and merged after.
 */
function collectPackages() {
  const found = [];
  for (const dir of readdirSync(resolve(root, 'packages'))) {
    const manifestPath = resolve(root, 'packages', dir, 'package.json');
    if (!existsSync(manifestPath)) continue;

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.private || !manifest.name) continue;
    if (!existsSync(resolve(root, 'packages', dir, 'README.md'))) continue;

    const projectPath = resolve(root, 'packages', dir, 'project.json');
    const executor = existsSync(projectPath)
      ? JSON.parse(readFileSync(projectPath, 'utf8')).targets?.test?.executor
      : undefined;

    found.push({
      name: manifest.name,
      dir,
      runner: executor === '@nx/jest:jest' ? 'jest' : 'vitest',
    });
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

const packages = collectPackages();

/**
 * A badge states what the suite produces now, so the cache is skipped: a
 * cached pass writes no coverage report, and the numbers would come from
 * whenever the report happened to be written last.
 */
function runCoverage(group, flags) {
  if (!group.length) return;
  execFileSync(
    'pnpm',
    [
      'exec',
      'nx',
      'run-many',
      '-t',
      'test',
      `--projects=${group.map((p) => p.name).join(',')}`,
      '--skip-nx-cache',
      '--no-tui',
      '--coverage',
      ...flags,
    ],
    { cwd: root, stdio: 'inherit' },
  );
}

/** Statement coverage a package's report holds, or null when it wrote none. */
function readCoverage(pkg) {
  const summaryPath = resolve(
    root,
    'coverage',
    'packages',
    pkg.dir,
    'coverage-summary.json',
  );
  if (!existsSync(summaryPath)) return null;

  const total = JSON.parse(readFileSync(summaryPath, 'utf8')).total;
  return {
    covered: total.statements.covered,
    total: total.statements.total,
    pct: total.statements.pct,
  };
}

// Shields renders the colour, so it is part of the claim: a number that reads
// green at 68% tells the reader the opposite of what it measured.
const colorFor = (pct) => {
  if (pct >= 90) return 'brightgreen';
  if (pct >= 80) return 'green';
  if (pct >= 70) return 'yellow';
  if (pct >= 60) return 'orange';
  return 'red';
};

/**
 * Writes the badge into a README, adding it after the bundle-size badge when
 * the file has none yet. Returns whether the file changed.
 */
function writeBadge(filePath, pct, alt) {
  const original = readFileSync(filePath, 'utf8');
  const badge = `<img src="https://img.shields.io/badge/coverage-${pct}%25-${colorFor(pct)}" alt="${alt}" />`;

  let content = original.replace(
    /<img src="https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-[a-z]+" alt="[^"]*" \/>/,
    badge,
  );

  if (content === original && !original.includes('badge/coverage-')) {
    content = original.replace(
      /( *)(<img src="https:\/\/img\.shields\.io\/badge\/[a-z%0-9-]*gzip-[^"]*" alt="Bundle size" \/>\n)/,
      `$1$2$1${badge}\n`,
    );
  }

  if (content === original) return false;
  if (!isCheck) writeFileSync(filePath, content, 'utf8');
  return true;
}

if (!reuse) {
  console.log('Measuring statement coverage…\n');
  runCoverage(
    packages.filter((p) => p.runner === 'vitest'),
    ['--coverage.reporter=json-summary', '--coverage.reporter=text-summary'],
  );
  runCoverage(
    packages.filter((p) => p.runner === 'jest'),
    ['--coverageReporters=json-summary', '--coverageReporters=text-summary'],
  );
}

const results = [];
const missing = [];
for (const pkg of packages) {
  const coverage = readCoverage(pkg);
  if (!coverage) {
    missing.push(pkg.name);
    continue;
  }
  results.push({ ...pkg, ...coverage });
}

if (missing.length) {
  console.error(
    `  ✗ no coverage report for ${missing.join(', ')} — run without --reuse`,
  );
  process.exit(1);
}

// The workspace total is every statement over every package, not the mean of
// the percentages: a 100% package of twelve statements would otherwise weigh
// as much as the core.
const covered = results.reduce((sum, r) => sum + r.covered, 0);
const statements = results.reduce((sum, r) => sum + r.total, 0);
const overall = Math.floor((covered / statements) * 100);

const maxName = Math.max(...results.map((r) => r.name.length));
for (const r of results) {
  console.log(
    `  ${r.name.padEnd(maxName)}  ${String(Math.floor(r.pct)).padStart(3)}%  (${r.covered}/${r.total} statements)`,
  );
}
console.log(
  `  ${'workspace'.padEnd(maxName)}  ${String(overall).padStart(3)}%  (${covered}/${statements} statements)\n`,
);

if (isDryRun) process.exit(0);

const stale = [];
for (const r of results) {
  const file = resolve(root, 'packages', r.dir, 'README.md');
  if (writeBadge(file, Math.floor(r.pct), 'Statement coverage')) {
    stale.push(`packages/${r.dir}/README.md`);
  }
}
if (
  writeBadge(
    resolve(root, 'README.md'),
    overall,
    'Statement coverage across all packages',
  )
) {
  stale.push('README.md');
}

if (isCheck) {
  if (stale.length) {
    console.error(
      `Coverage badges are stale in:\n${stale.map((f) => `  ${f}`).join('\n')}\n\nRun: pnpm update-coverage`,
    );
    process.exit(1);
  }
  console.log('Coverage badges are up to date.');
  process.exit(0);
}

console.log(
  stale.length
    ? `Updated ${stale.length} file(s):\n${stale.map((f) => `  ${f}`).join('\n')}`
    : 'Coverage badges were already up to date.',
);

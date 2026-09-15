#!/usr/bin/env node
// Keeps translated docs pages in step with their English source. Each
// translation records the git object id of the English file it was last
// checked against, in apps/docs/src/content/freshness.json; the docs test
// suite fails when English moves on without the translation being marked
// again.
//
// Usage:
//   node scripts/docs-i18n.mjs --stale                          list translations behind English
//   node scripts/docs-i18n.mjs --diff <locale> <page>           show what English changed since the mark
//   node scripts/docs-i18n.mjs --mark <locale> <page> [<page>]  record the current English as checked
//
// A page is its route path: `/docs/ssr`, `docs/ssr`, or `/` for the home page.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'apps/docs/src');
const recordPath = join(appDir, 'content/freshness.json');

const readRecord = () => JSON.parse(readFileSync(recordPath, 'utf8'));
const writeRecord = (record) =>
  writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);

/** Object id git gives a file's bytes. */
function blobSha(file) {
  const bytes = readFileSync(join(appDir, file));
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex');
}

const normalisePage = (page) =>
  page === '/' || page === 'home' ? '/' : `/${page.replace(/^\/+/, '')}`;

function fail(message) {
  console.error(`docs-i18n: ${message}`);
  process.exit(1);
}

function findEntry(record, locale, rawPage) {
  const pages = record[locale];
  if (!pages) {
    fail(
      `no translations recorded for "${locale}" — known locales: ${Object.keys(record).join(', ')}`,
    );
  }
  const page = normalisePage(rawPage ?? '');
  const entry = pages[page];
  if (!entry) {
    fail(
      `"${locale}" has no record for "${page}" — known pages:\n  ${Object.keys(pages).join('\n  ')}`,
    );
  }
  return { page, entry };
}

function stale() {
  const record = readRecord();
  const behind = [];
  for (const [locale, pages] of Object.entries(record)) {
    for (const [page, entry] of Object.entries(pages)) {
      if (blobSha(entry.source) !== entry.sha) {
        behind.push(
          `  ${locale} ${page}${entry.knownStale ? '  (known stale)' : ''}`,
        );
      }
    }
  }
  if (behind.length === 0) {
    console.log('docs-i18n: every translation matches its English source.');
    return;
  }
  console.log(
    `docs-i18n: ${behind.length} translation(s) behind English:\n${behind.join('\n')}`,
  );
}

function diff(locale, rawPage) {
  const { page, entry } = findEntry(readRecord(), locale, rawPage);
  // Writing the current file into the object store lets git diff it by id,
  // committed or not.
  const current = execFileSync(
    'git',
    ['hash-object', '-w', join(appDir, entry.source)],
    { cwd: root, encoding: 'utf8' },
  ).trim();
  if (current === entry.sha) {
    console.log(`docs-i18n: ${locale} ${page} matches its English source.`);
    return;
  }
  try {
    execFileSync('git', ['cat-file', '-e', entry.sha], { cwd: root });
  } catch {
    fail(
      `the recorded English version ${entry.sha} is not in this repository — compare ${entry.translation} against ${entry.source} by hand`,
    );
  }
  console.log(
    `docs-i18n: English changes to ${entry.source} since ${locale} ${page} was last marked:\n`,
  );
  execFileSync('git', ['--no-pager', 'diff', entry.sha, current], {
    cwd: root,
    stdio: 'inherit',
  });
}

function mark(locale, rawPages) {
  if (rawPages.length === 0)
    fail('--mark needs a locale and at least one page');
  const record = readRecord();
  for (const rawPage of rawPages) {
    const { page, entry } = findEntry(record, locale, rawPage);
    // Stored so a later --diff can still read this version after the
    // English file changes, even if it was never committed.
    entry.sha = execFileSync(
      'git',
      ['hash-object', '-w', join(appDir, entry.source)],
      { cwd: root, encoding: 'utf8' },
    ).trim();
    delete entry.knownStale;
    console.log(
      `docs-i18n: marked ${locale} ${page} as matching ${entry.source}`,
    );
  }
  writeRecord(record);
}

const [command, locale, ...pages] = process.argv.slice(2);
switch (command) {
  case '--stale':
    stale();
    break;
  case '--diff':
    diff(locale, pages[0]);
    break;
  case '--mark':
    mark(locale, pages);
    break;
  default:
    fail(
      'usage: --stale | --diff <locale> <page> | --mark <locale> <page> [<page>]',
    );
}

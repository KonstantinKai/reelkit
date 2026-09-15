import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kDefaultLocale, kLocales } from '../i18n/locale';
import { kSitePages } from './manifest';
import { pageFiles } from './sitePages';

interface FreshnessRecord {
  source: string;
  translation: string;
  sha: string;
  knownStale?: true;
}

type Freshness = Record<string, Record<string, FreshnessRecord>>;

const appDir = join(import.meta.dirname, '..');
const freshness = JSON.parse(
  readFileSync(join(import.meta.dirname, 'freshness.json'), 'utf8'),
) as Freshness;

/** The object id git gives these bytes, without shelling out to git. */
function gitBlobSha(bytes: Buffer): string {
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex');
}

/**
 * Every page a locale translates itself, keyed the way the record keys it.
 * A locale module that re-exports the English body has nothing to fall
 * behind on — the privacy notice, the terms and the changelog — so it is
 * left out.
 */
function translatedPages(): Freshness {
  const pages: Freshness = {};
  for (const locale of kLocales) {
    if (locale === kDefaultLocale) continue;
    for (const page of kSitePages) {
      const translation = pageFiles(page, locale).main;
      const body = readFileSync(join(appDir, translation), 'utf8');
      if (body.includes('export { default } from')) continue;
      (pages[locale] ??= {})[`/${page.path}`] = {
        source: pageFiles(page, kDefaultLocale).main,
        translation,
        sha: '',
      };
    }
  }
  return pages;
}

const locations = (records: Freshness) =>
  Object.fromEntries(
    Object.entries(records).map(([locale, pages]) => [
      locale,
      Object.fromEntries(
        Object.entries(pages).map(([page, { source, translation }]) => [
          page,
          { source, translation },
        ]),
      ),
    ]),
  );

describe('translation freshness', () => {
  it('hashes a file the way git does', () => {
    expect(gitBlobSha(Buffer.alloc(0))).toBe(
      'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391',
    );
    expect(gitBlobSha(Buffer.from('hello\n'))).toBe(
      'ce013625030ba8dba906f756967f9e9ca394464a',
    );
  });

  // A page added to the manifest, moved to a content file, or given its own
  // translation shows up here first, so no translation goes untracked.
  it('tracks every translated page and nothing else', () => {
    expect(
      locations(freshness),
      'the freshness record and the page manifest disagree — add or remove records to match',
    ).toEqual(locations(translatedPages()));
  });

  // Each record holds the English version the translation was last checked
  // against. English that moved on since then means the translation is
  // behind, and nothing else on the page would say so. Records flagged as
  // known stale were already behind when the guard was introduced; they
  // stay allowed until someone catches them up.
  it('flags a translation whose English source changed since it was last marked', () => {
    const behind: string[] = [];
    const caughtUp: string[] = [];
    for (const [locale, pages] of Object.entries(freshness)) {
      for (const [page, record] of Object.entries(pages)) {
        const current = gitBlobSha(readFileSync(join(appDir, record.source)));
        const stale = current !== record.sha;
        if (stale && !record.knownStale) behind.push(`${locale} ${page}`);
        if (!stale && record.knownStale) caughtUp.push(`${locale} ${page}`);
      }
    }
    expect(
      behind,
      [
        'English changed under these translations. For each one, read the change with',
        '  pnpm docs:i18n --diff <locale> <page>',
        'update the translation, then record it with',
        '  pnpm docs:i18n --mark <locale> <page>',
      ].join('\n'),
    ).toEqual([]);
    expect(
      caughtUp,
      'these translations match their English source again — run `pnpm docs:i18n --mark <locale> <page>` to drop the known-stale flag',
    ).toEqual([]);
  });
});

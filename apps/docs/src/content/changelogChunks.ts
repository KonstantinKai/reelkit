/**
 * Cuts the changelog into chunks the docs site can load one at a time: the
 * newest releases ship with the changelog page, older ones load as the reader
 * scrolls toward them.
 *
 * Runs in Node (the Vite plugin that serves the chunks) and in the browser, so
 * it imports nothing.
 */

export interface ChangelogChunks {
  /** Every package entry id, newest first, as `parseChangelog` assigns them. */
  ids: string[];
  /** Raw markdown slices; joined back together they are the source text. */
  chunks: string[];
}

export interface SplitChangelogOptions {
  /** Fewest `## ` headings the first chunk holds. */
  headEntries?: number;
  /** Fewest `## ` headings every later chunk but the last holds. */
  chunkEntries?: number;
}

const _kHeadingPattern = /^## (.*)$/gm;
const _kIdPattern = /(.+@[\d.]+)/;
const _kDatePattern = /\((\d{4}-\d{2}-\d{2})\)/;

/**
 * The `package@version` id of an entry heading, or `null` for a heading that
 * names no package release, such as a `## Documentation (date)` section.
 */
export const changelogEntryId = (title: string): string | null =>
  title.match(_kIdPattern)?.[1].trim() ?? null;

/**
 * Splits the changelog at release boundaries. A release is a run of headings
 * that share a date; a heading without one stays with the release above it, so
 * a cut only ever falls on the first heading of a new date.
 */
export function splitChangelog(
  md: string,
  { headEntries = 20, chunkEntries = 30 }: SplitChangelogOptions = {},
): ChangelogChunks {
  const headings = [...md.matchAll(_kHeadingPattern)].map((match) => ({
    offset: match.index,
    title: match[1].trimEnd(),
  }));

  const ids = headings
    .map(({ title }) => changelogEntryId(title))
    .filter((id): id is string => id !== null);

  if (headings.length === 0) return { ids, chunks: md ? [md] : [] };

  // Each release starts where its first heading does; the first one also
  // carries anything written above the first heading.
  const releases: { offset: number; entries: number }[] = [];
  let date: string | undefined;
  for (const { offset, title } of headings) {
    const headingDate = title.match(_kDatePattern)?.[1];
    if (releases.length === 0 || (headingDate && headingDate !== date)) {
      releases.push({ offset: releases.length === 0 ? 0 : offset, entries: 0 });
      date = headingDate;
    }
    releases[releases.length - 1].entries += 1;
  }

  const starts: number[] = [0];
  let entries = 0;
  for (const release of releases) {
    const target = starts.length === 1 ? headEntries : chunkEntries;
    if (entries >= target) {
      starts.push(release.offset);
      entries = 0;
    }
    entries += release.entries;
  }

  const chunks = starts.map((start, index) =>
    md.slice(start, starts[index + 1]),
  );
  return { ids, chunks };
}

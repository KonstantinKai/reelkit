import type { ChangelogEntry } from './parseChangelog';

export interface ChangelogSummary {
  /** Every package entry id, newest first. */
  ids: readonly string[];
  /** The newest releases, parsed. Older ones stay on the changelog page. */
  entries: ChangelogEntry[];
}

/**
 * Every release id plus the newest releases, loaded on demand. The what's-new
 * dialog and the sidebar badge only need them once the page has settled, and
 * never the older releases, which load on the changelog page alone.
 */
export async function loadChangelogSummary(): Promise<ChangelogSummary> {
  const [{ ids, head }, { parseChangelog }] = await Promise.all([
    import('virtual:reelkit-changelog'),
    import('./parseChangelog'),
  ]);
  return { ids, entries: parseChangelog(head) };
}

/** Every release id, newest first, loaded on demand. */
export async function loadChangelogIds(): Promise<readonly string[]> {
  const { ids } = await import('virtual:reelkit-changelog');
  return ids;
}

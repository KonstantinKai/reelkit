import type { ChangelogEntry } from './parseChangelog';

/**
 * The release notes, parsed, loaded on demand. The raw changelog and its
 * markdown renderer are the heaviest things a docs page would otherwise carry
 * on first load, while the what's-new dialog and the sidebar badge only need
 * them once the page has settled.
 */
export async function loadChangelogEntries(): Promise<ChangelogEntry[]> {
  const [{ default: raw }, { parseChangelog }] = await Promise.all([
    // eslint-disable-next-line @nx/enforce-module-boundaries
    import('../../../../CHANGELOG.md?raw'),
    import('./parseChangelog'),
  ]);
  return parseChangelog(raw);
}

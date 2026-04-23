import type { ChangelogEntry } from './parseChangelog';

/**
 * Return entries newer than `lastSeen`. Entries are newest-first in source
 * order; we slice until we hit `lastSeen` (exclusive).
 * When `lastSeen` is `null` or absent from the list → return all entries.
 */
export function getDeltaSinceLastSeen(
  entries: ChangelogEntry[],
  lastSeen: string | null,
): ChangelogEntry[] {
  if (!lastSeen) return entries.slice();
  const idx = entries.findIndex((e) => e.id === lastSeen);
  if (idx === -1) return entries.slice();
  return entries.slice(0, idx);
}

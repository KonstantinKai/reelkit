/**
 * Return the ids newer than `lastSeen`. Ids are newest-first in source
 * order; we slice until we hit `lastSeen` (exclusive).
 * When `lastSeen` is `null` or absent from the list → return all ids.
 */
export function getDeltaSinceLastSeen(
  ids: readonly string[],
  lastSeen: string | null,
): string[] {
  if (!lastSeen) return ids.slice();
  const index = ids.indexOf(lastSeen);
  if (index === -1) return ids.slice();
  return ids.slice(0, index);
}

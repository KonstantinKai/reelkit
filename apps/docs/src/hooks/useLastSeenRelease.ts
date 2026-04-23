import { useCallback, useEffect, useState } from 'react';

const _kStorageKey = 'rk-docs:whats-new:last-seen';

/**
 * Read/write the "last seen" changelog entry id used to gate the
 * What's New dialog. On first-ever visit (no stored key) the hook
 * silently seeds `lastSeen` to `newestId` so returning users don't
 * get a dialog retroactively after this feature ships.
 *
 * Returns:
 * - `lastSeen` — current stored id (`null` until first effect runs)
 * - `markSeen()` — persist `newestId` and update state
 */
export function useLastSeenRelease(newestId: string | null): {
  lastSeen: string | null;
  markSeen: () => void;
} {
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(_kStorageKey);
    if (stored === null) {
      if (newestId) {
        window.localStorage.setItem(_kStorageKey, newestId);
        setLastSeen(newestId);
      }
      return;
    }
    setLastSeen(stored);
  }, [newestId]);

  const markSeen = useCallback(() => {
    if (!newestId) return;
    window.localStorage.setItem(_kStorageKey, newestId);
    setLastSeen(newestId);
  }, [newestId]);

  return { lastSeen, markSeen };
}

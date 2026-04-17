import { useEffect } from 'react';
import { sharedBodyLock } from '@reelkit/core';

/**
 * Locks the document body scroll when `locked` is `true`.
 *
 * Uses the shared `sharedBodyLock` singleton from core, so multiple
 * concurrent callers across unrelated components share a single
 * reference counter — nested modals/overlays interleave correctly
 * and restore original styles only after the last caller releases.
 *
 * @param locked - Whether body scroll should be locked.
 */
export const useBodyLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    return sharedBodyLock.lock();
  }, [locked]);
};

export default useBodyLock;

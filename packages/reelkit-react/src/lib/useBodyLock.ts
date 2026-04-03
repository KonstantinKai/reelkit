import { useEffect, useState } from 'react';
import { createBodyLock } from '@reelkit/core';

/**
 * Locks the document body scroll when `locked` is `true`.
 *
 * Uses the core {@link createBodyLock} utility with reference counting,
 * so multiple concurrent callers can each lock/unlock independently.
 * Restores all original styles and scroll position on cleanup.
 *
 * @param locked - Whether body scroll should be locked.
 */
export const useBodyLock = (locked: boolean) => {
  const [bodyLock] = useState(createBodyLock);

  useEffect(() => {
    if (!locked) return;
    return bodyLock.lock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);
};

export default useBodyLock;

import { watch, onUnmounted, type Ref, isRef } from 'vue';
import { createBodyLock } from '@reelkit/core';

/**
 * Locks the document body scroll when `locked` is `true`.
 *
 * Uses the core `createBodyLock` utility with reference counting,
 * so multiple concurrent callers can each lock/unlock independently.
 * Restores all original styles and scroll position on cleanup.
 *
 * @param locked - Whether body scroll should be locked. Accepts a
 *   reactive `Ref<boolean>` or a static `boolean`.
 */
export const useBodyLock = (locked: Ref<boolean> | boolean) => {
  const bodyLock = createBodyLock();
  let unlock: (() => void) | null = null;

  const doLock = () => {
    if (!unlock) unlock = bodyLock.lock();
  };

  const doUnlock = () => {
    if (unlock) {
      unlock();
      unlock = null;
    }
  };

  if (isRef(locked)) {
    watch(
      locked,
      (val) => {
        if (val) doLock();
        else doUnlock();
      },
      { immediate: true },
    );
  } else if (locked) {
    doLock();
  }

  onUnmounted(doUnlock);
};

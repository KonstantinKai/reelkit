import { watch, onUnmounted, type Ref, isRef } from 'vue';
import { sharedBodyLock } from '@reelkit/core';

/**
 * Locks the document body scroll when `locked` is `true`.
 *
 * Uses the shared `sharedBodyLock` singleton from core, so multiple
 * concurrent callers across unrelated components share a single
 * reference counter — nested modals/overlays interleave correctly
 * and restore original styles only after the last caller releases.
 *
 * @param locked - Whether body scroll should be locked. Accepts a
 *   reactive `Ref<boolean>` or a static `boolean`.
 */
export const useBodyLock = (locked: Ref<boolean> | boolean) => {
  let unlock: (() => void) | null = null;

  const doLock = () => {
    if (!unlock) unlock = sharedBodyLock.lock();
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

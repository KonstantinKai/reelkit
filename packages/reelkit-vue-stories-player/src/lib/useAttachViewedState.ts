import { onMounted, onUnmounted, watch } from 'vue';
import type { Dispose } from '@reelkit/vue';
import type { StoriesViewedStateController } from '@reelkit/stories-core';

/**
 * Reads the viewed store and follows other tabs for as long as the calling
 * component is mounted. The player chooses its opening story while it is set
 * up, so the store has to be read by then. `StoriesOverlay` and
 * `StoriesRingList` call this themselves; call it in the page that owns the
 * controller when the overlay is only mounted once it opens
 * (`<StoriesOverlay v-if="open" …>`), which leaves the player no earlier
 * moment to read it. Attaching is counted, so several callers can each attach
 * and unmount in any order.
 *
 * Nothing is attached before mount, so a server render reads no storage and
 * agrees with the first client render: nothing seen yet.
 *
 * @param viewed - Getter for the controller, for example `() => viewed`;
 * nothing happens without one. A new controller swaps the attachment over.
 */
export const useAttachViewedState = (
  viewed: () => StoriesViewedStateController | undefined,
) => {
  let mounted = false;
  let detach: Dispose | undefined;

  const attach = () => {
    detach?.();
    detach = viewed()?.attach();
  };

  watch(viewed, () => {
    if (mounted) attach();
  });

  onMounted(() => {
    mounted = true;
    attach();
  });

  onUnmounted(() => {
    mounted = false;
    detach?.();
    detach = undefined;
  });
};

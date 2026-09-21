import { onMounted, onUnmounted, watch } from 'vue';
import type { Dispose } from '@reelkit/vue';
import type { StoriesViewedStateController } from '@reelkit/stories-core';

/**
 * Reads the viewed store and follows other tabs for as long as the component
 * is mounted. Lives in the components that are mounted before the player
 * opens: the player chooses its opening story while it is set up, so the
 * store has to be read by then. Attaching is counted, so the ring list and
 * the player can each call this and unmount in any order.
 *
 * Nothing is attached before mount, so a server render reads no storage and
 * agrees with the first client render: nothing seen yet.
 *
 * @param viewed - Getter for the controller given as the `viewed` prop;
 * nothing happens without one. A new controller swaps the attachment over.
 *
 * @internal
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

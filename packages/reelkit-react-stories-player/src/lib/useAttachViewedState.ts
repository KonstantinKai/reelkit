import { useEffect } from 'react';
import type { StoriesViewedStateController } from '@reelkit/stories-core';

/**
 * Reads the viewed store and follows other tabs for as long as the calling
 * component is mounted. The player chooses its opening story while it first
 * renders, so the store has to be read by then. `StoriesOverlay` and
 * `StoriesRingList` call this themselves; call it in the page that owns the
 * controller when the overlay is only mounted once it opens
 * (`{open && <StoriesOverlay … />}`), which leaves the player no earlier
 * moment to read it. Attaching is counted, so several callers can each attach
 * and unmount in any order.
 *
 * @param viewed - The controller; nothing happens without one.
 */
export const useAttachViewedState = (
  viewed: StoriesViewedStateController | undefined,
) => useEffect(() => viewed?.attach(), [viewed]);

import { useEffect } from 'react';
import type { StoriesViewedStateController } from '@reelkit/stories-core';

/**
 * Reads the viewed store and follows other tabs for as long as the component
 * is mounted. Lives in the components that are mounted before the player
 * opens: the player chooses its opening story while it first renders, so the
 * store has to be read by then. Attaching is counted, so the ring list and
 * the player can each call this and unmount in any order.
 *
 * @param viewed - The controller given as the `viewed` prop; nothing happens
 * without one.
 */
export const useAttachViewedState = (
  viewed: StoriesViewedStateController | undefined,
) => useEffect(() => viewed?.attach(), [viewed]);

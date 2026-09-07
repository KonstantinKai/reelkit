import { useState, useEffect } from 'react';
import {
  createViewedStateController,
  type ViewedStateController,
  type ViewedStateOptions,
} from '@reelkit/core';

/**
 * Builds a controller holding how far a viewer got through a collection and keeps it
 * following storage for as long as the component lives.
 *
 * Entries are persisted as the very text a URL parameter would carry, so pass
 * the same key the address bar uses and a bookmark and a stored entry stay the
 * same string.
 *
 * Read the entries through `Observe` so a ring or badge repaints when a
 * position is recorded, here or in another tab.
 *
 * The controller is created once and starts reading storage after mount, so nothing
 * touches `localStorage` during render and the hook is safe to prerender —
 * server and first client render agree that nothing has been seen yet.
 *
 * @typeParam Id - The identity the key's codec reads out of a stored entry.
 * @typeParam Pos - The position an identity resolves to.
 * @param options - Storage key and the `codec`/`locator` pair, plus the
 * optional storage backing and track/progress functions.
 * @returns The {@link ViewedStateController} for this storage key.
 *
 * @example One key drives the address bar and what is remembered
 * ```tsx
 * const key = urlStableIdTwoAxisKey({ outerItems, innerItems });
 * const url = useOverlayUrlState({ param: 'story', ...key });
 * const seen = useViewedState({
 *   storageKey: 'stories-seen',
 *   ...key,
 *   ...twoAxisViewedTracking,
 * });
 * ```
 *
 * @example Repaint a ring as stories are seen
 * ```tsx
 * <Observe signals={[seen.entries]}>
 *   {() => (
 *     <StoriesRingList
 *       groups={groups}
 *       viewedState={viewed.viewedCounts()}
 *       onSelect={open}
 *     />
 *   )}
 * </Observe>
 * ```
 */
export const useViewedState = <Id = number, Pos = number>(
  options: ViewedStateOptions<Id, Pos>,
): ViewedStateController<Pos> => {
  const controller = useState(() =>
    createViewedStateController<Id, Pos>(options),
  )[0];

  useEffect(() => controller.attach(), [controller]);

  return controller;
};

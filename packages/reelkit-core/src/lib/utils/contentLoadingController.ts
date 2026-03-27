import { createSignal, type Signal } from './signal';

export interface ContentLoadingController {
  /** Whether the active content is currently loading. */
  isLoading: Signal<boolean>;

  /**
   * Update the active index. Resets loading to `true`.
   * Subsequent `onReady`/`onWaiting` calls are ignored
   * unless their index matches.
   */
  setActiveIndex: (index: number) => void;

  /** Mark the content at `index` as ready. Ignored if index is stale. */
  onReady: (index: number) => void;

  /** Mark the content at `index` as loading. Ignored if index is stale. */
  onWaiting: (index: number) => void;
}

/**
 * Creates a content loading controller that tracks whether the
 * active slide's content is loading. Index-guarded: `onReady` and
 * `onWaiting` calls with a stale index are ignored.
 */
export const createContentLoadingController = (
  initialLoading = true,
  initialIndex = 0,
): ContentLoadingController => {
  const isLoading = createSignal(initialLoading);
  let activeIndex = initialIndex;

  return {
    isLoading,
    setActiveIndex: (index: number) => {
      activeIndex = index;
      isLoading.value = true;
    },
    onReady: (index: number) => {
      if (index === activeIndex) isLoading.value = false;
    },
    onWaiting: (index: number) => {
      if (index === activeIndex) isLoading.value = true;
    },
  };
};

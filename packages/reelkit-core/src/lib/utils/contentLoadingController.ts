import { createSignal, type Signal } from './signal';

export interface ContentLoadingController {
  /** Whether the active content is currently loading. */
  isLoading: Signal<boolean>;

  /** Whether the active content has an error. */
  isError: Signal<boolean>;

  /**
   * Update the active index. Resets loading to `true` and error to `false`.
   * Subsequent `onReady`/`onWaiting`/`onError` calls are ignored
   * unless their index matches.
   */
  setActiveIndex: (index: number) => void;

  /** Mark the content at `index` as ready. Ignored if index is stale. */
  onReady: (index: number) => void;

  /** Mark the content at `index` as loading. Ignored if index is stale. */
  onWaiting: (index: number) => void;

  /** Mark the content at `index` as errored. Clears loading. Ignored if index is stale. */
  onError: (index: number) => void;
}

/**
 * Creates a content loading controller that tracks whether the
 * active slide's content is loading or has an error. Index-guarded:
 * `onReady`, `onWaiting`, and `onError` calls with a stale index are ignored.
 */
export const createContentLoadingController = (
  initialLoading = true,
  initialIndex = 0,
): ContentLoadingController => {
  const isLoading = createSignal(initialLoading);
  const isError = createSignal(false);
  let activeIndex = initialIndex;

  return {
    isLoading,
    isError,
    setActiveIndex: (index: number) => {
      activeIndex = index;
      isLoading.value = true;
      isError.value = false;
    },
    onReady: (index: number) => {
      if (index === activeIndex) isLoading.value = false;
    },
    onWaiting: (index: number) => {
      if (index === activeIndex) isLoading.value = true;
    },
    onError: (index: number) => {
      if (index === activeIndex) {
        isLoading.value = false;
        isError.value = true;
      }
    },
  };
};

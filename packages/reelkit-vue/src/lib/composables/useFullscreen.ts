import { onMounted, onUnmounted, type Ref } from 'vue';
import {
  fullscreenSignal,
  requestFullscreen as coreRequestFullscreen,
  exitFullscreen as coreExitFullscreen,
  noop,
} from '@reelkit/core';

export interface UseFullscreenOptions {
  elementRef: Ref<HTMLElement | null>;
}

export interface UseFullscreenReturn {
  /** The core fullscreen signal. Read `.value` for current state. */
  isFullscreen: typeof fullscreenSignal;

  /** Request fullscreen on the referenced element. */
  request: () => void;

  /** Exit fullscreen. */
  exit: () => void;

  /** Toggle fullscreen state. */
  toggle: () => void;
}

/**
 * Composable for managing the Fullscreen API with cross-browser support.
 *
 * Uses the core `fullscreenSignal` — a lazy singleton that subscribes to
 * `fullscreenchange` events only when observed.
 *
 * Exits fullscreen automatically on unmount.
 */
export const useFullscreen = (
  options: UseFullscreenOptions,
): UseFullscreenReturn => {
  let dispose: (() => void) | null = null;

  const request = (): void => {
    if (options.elementRef.value !== null) {
      if (fullscreenSignal.value) coreExitFullscreen();

      coreRequestFullscreen(options.elementRef.value).catch((err) => {
        console.log(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    }
  };

  const exit = (): void => {
    coreExitFullscreen().catch((err) => {
      console.log(
        `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
      );
    });
  };

  const toggle = (): void => {
    if (fullscreenSignal.value) exit();
    else request();
  };

  onMounted(() => {
    dispose = fullscreenSignal.observe(noop);
  });

  onUnmounted(() => {
    dispose?.();
    if (fullscreenSignal.value) coreExitFullscreen();
  });

  return { isFullscreen: fullscreenSignal, request, exit, toggle };
};

import { onMounted, onUnmounted, type Ref } from 'vue';
import {
  fullscreenSignal,
  requestFullscreen as coreRequestFullscreen,
  exitFullscreen as coreExitFullscreen,
  noop,
} from '@reelkit/core';

export interface UseFullscreenOptions<E extends HTMLElement = HTMLElement> {
  elementRef: Ref<E | null>;
}

export interface UseFullscreenReturn {
  /** The core fullscreen signal. Read `.value` for current state. */
  isFullscreen: typeof fullscreenSignal;

  /**
   * Request fullscreen on the referenced element. If another element is
   * already fullscreen, it is exited first (awaited) before requesting.
   */
  request: () => Promise<void>;

  /** Exit fullscreen. */
  exit: () => Promise<void>;

  /** Toggle fullscreen state. */
  toggle: () => Promise<void>;
}

const logError =
  (stage: 'enter' | 'exit') =>
  (err: Error): void => {
    console.log(
      `Error attempting to ${stage === 'enter' ? 'enable' : 'exit'} full-screen mode: ${err.message} (${err.name})`,
    );
  };

/**
 * Composable for managing the Fullscreen API with cross-browser support.
 *
 * Uses the core `fullscreenSignal` — a lazy singleton that subscribes to
 * `fullscreenchange` events only when observed.
 *
 * Exits fullscreen automatically on unmount.
 *
 * @typeParam E - The HTML element type that will be toggled into fullscreen mode.
 */
export const useFullscreen = <E extends HTMLElement = HTMLElement>(
  options: UseFullscreenOptions<E>,
): UseFullscreenReturn => {
  let dispose: (() => void) | null = null;

  const request = async (): Promise<void> => {
    const el = options.elementRef.value;
    if (!el) return;
    if (fullscreenSignal.value) {
      await coreExitFullscreen().catch(logError('exit'));
    }
    await coreRequestFullscreen(el).catch(logError('enter'));
  };

  const exit = async (): Promise<void> => {
    await coreExitFullscreen().catch(logError('exit'));
  };

  const toggle = async (): Promise<void> => {
    if (fullscreenSignal.value) await exit();
    else await request();
  };

  onMounted(() => {
    dispose = fullscreenSignal.observe(noop);
  });

  onUnmounted(() => {
    dispose?.();
    if (fullscreenSignal.value) {
      coreExitFullscreen().catch(logError('exit'));
    }
  });

  return { isFullscreen: fullscreenSignal, request, exit, toggle };
};

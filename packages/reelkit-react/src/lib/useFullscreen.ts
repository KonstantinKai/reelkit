import { type MutableRefObject, useEffect, useState } from 'react';
import {
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
  noop,
} from '@reelkit/core';

/**
 * Options for the {@link useFullscreen} hook.
 *
 * @typeParam E - The HTML element type that will be toggled into fullscreen mode.
 */
export interface UseFullscreenProps<E extends HTMLElement> {
  /** Ref to the DOM element that should enter fullscreen. */
  ref: MutableRefObject<E | null>;
}

/**
 * Tuple returned by {@link useFullscreen}.
 *
 * - `[0]` — The fullscreen signal. Read `.value` inside `Observe` for reactive updates.
 * - `[1]` — Function to request fullscreen on the referenced element. If another
 *   element is already fullscreen, it is exited first (awaited) before requesting.
 * - `[2]` — Function to exit fullscreen.
 * - `[3]` — Toggle function that requests or exits fullscreen based on current state.
 */
export type UseFullscreenResult = [
  fullscreen: typeof fullscreenSignal,
  requestFullscreen: () => Promise<void>,
  exitFullscreen: () => Promise<void>,
  toggleFullscreen: () => Promise<void>,
];

/**
 * React hook for managing the Fullscreen API with cross-browser support.
 *
 * Uses the core `fullscreenSignal` — a lazy singleton that subscribes to
 * `fullscreenchange` events only when observed. No `useState` needed;
 * read `fullscreen.value` inside an `Observe` component for reactive updates.
 *
 * Exits fullscreen automatically on unmount.
 */
export const useFullscreen = <E extends HTMLElement>(
  props: UseFullscreenProps<E>,
): UseFullscreenResult => {
  const [actions] = useState<
    [
      request: () => Promise<void>,
      exit: () => Promise<void>,
      toggle: () => Promise<void>,
    ]
  >(() => {
    const logErr = (stage: 'enter' | 'exit') => (err: Error) => {
      console.log(
        `Error attempting to ${stage === 'enter' ? 'enable' : 'exit'} full-screen mode: ${err.message} (${err.name})`,
      );
    };

    const request = async (): Promise<void> => {
      const el = props.ref.current;
      if (!el) return;
      if (fullscreenSignal.value) {
        await exitFullscreen().catch(logErr('exit'));
      }
      await requestFullscreen(el).catch(logErr('enter'));
    };

    const exit = async (): Promise<void> => {
      await exitFullscreen().catch(logErr('exit'));
    };

    const toggle = async (): Promise<void> => {
      if (fullscreenSignal.value) await exit();
      else await request();
    };

    return [request, exit, toggle];
  });

  useEffect(() => {
    const dispose = fullscreenSignal.observe(noop);
    return () => {
      dispose();
      if (fullscreenSignal.value) exitFullscreen();
    };
  }, []);

  return [fullscreenSignal, ...actions];
};

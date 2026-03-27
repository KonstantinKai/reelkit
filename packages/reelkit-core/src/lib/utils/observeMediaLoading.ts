import { createDisposableList } from './disposable';
import type { Disposer } from './disposable';
import { observeDomEvent } from './observeDomEvent';

export interface MediaLoadingCallbacks {
  /** Called on `canplay` and `playing` events. */
  onReady: () => void;

  /** Called on `waiting` event. */
  onWaiting: () => void;

  /**
   * Called specifically on the `playing` event, after `onReady`.
   * Useful for hiding poster images only when playback actually starts.
   */
  onPlaying?: () => void;
}

/**
 * Observes video loading events (`canplay`, `waiting`, `playing`) and
 * reports readiness via callbacks. Returns a disposer that removes
 * all listeners.
 */
export const observeMediaLoading = (
  video: HTMLVideoElement,
  callbacks: MediaLoadingCallbacks,
): Disposer => {
  const disposables = createDisposableList();

  disposables.push(
    observeDomEvent(video, 'canplay', callbacks.onReady),
    observeDomEvent(video, 'waiting', callbacks.onWaiting),
    observeDomEvent(video, 'playing', () => {
      callbacks.onReady();
      callbacks.onPlaying?.();
    }),
  );

  return disposables.dispose;
};

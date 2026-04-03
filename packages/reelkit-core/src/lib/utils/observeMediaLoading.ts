import { createDisposableList } from './disposable';
import type { Disposer } from './disposable';
import { observeDomEvent } from './observeDomEvent';

export interface MediaLoadingCallbacks {
  /**
   * Called on `playing` and `canplaythrough` events — the video has
   * enough data buffered and is actively playing.
   */
  onReady: () => void;

  /** Called on `waiting` event (buffering mid-playback). */
  onWaiting: () => void;

  /**
   * Called specifically on the `playing` event, after `onReady`.
   * Useful for hiding poster images only when playback actually starts.
   */
  onPlaying?: () => void;
}

/**
 * Observes video loading events (`waiting`, `playing`, `canplaythrough`)
 * and reports readiness via callbacks. Uses `playing` as the primary
 * ready signal instead of `canplay`, because `canplay` can precede a
 * `waiting` event when the buffer is shallow. Returns a disposer that
 * removes all listeners.
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
    observeDomEvent(video, 'canplaythrough', callbacks.onReady),
  );

  return disposables.dispose;
};

import { createSignal, type Signal } from '../signal/signal';
import { observeDomEvent } from '../dom/observeDomEvent';
import { noop } from '../utils/noop';
import type { Disposer } from '../utils/disposable';
import { createTimerController } from './timerController';

/** What the active slide shows, which decides what ends it. */
export type SlideshowSlideKind = 'image' | 'video';

/** Configuration for {@link createSlideshowController}. */
export interface SlideshowControllerConfig {
  /** How long an image stays on screen, in milliseconds. */
  interval: number;

  /**
   * Called when the active slide is done: its interval ran out, or its video
   * ended. Move to the next slide here, or call `pause()` on the last one.
   */
  onAdvance: () => void;
}

/** Drives a slideshow that advances on its own. */
export interface SlideshowController {
  /** Whether the slideshow is switched on. Holds do not change it. */
  readonly isPlaying: Signal<boolean>;

  /** How far the active image's interval has run, from 0 to 1. */
  readonly progress: Signal<number>;

  /** Switch the slideshow on. Continues the active slide where it stopped. */
  play: () => void;

  /** Switch the slideshow off. The active slide keeps its progress. */
  pause: () => void;

  /** Switch between {@link play} and {@link pause}. */
  toggle: () => void;

  /** Change the image interval. Applies from the next image. */
  setInterval: (interval: number) => void;

  /**
   * A new slide became active. Progress starts again from zero, and nothing
   * runs until the slide reports {@link ready} (an image) or
   * {@link ended} (a video).
   */
  setSlide: (kind: SlideshowSlideKind) => void;

  /**
   * The active image finished loading, or failed to. Its interval starts now,
   * so a slow image is never skipped before anyone saw it.
   */
  ready: () => void;

  /** The active video played to its end. Advances now, or once nothing holds. */
  ended: () => void;

  /**
   * Stop the clock for a reason, such as `'hover'` or `'drag'`. Holds stack:
   * the slideshow runs again only when every reason is released.
   */
  hold: (reason: string) => void;

  /** Release a reason given to {@link hold}. */
  release: (reason: string) => void;

  /** Stop the clock and remove the page visibility listener. */
  dispose: () => void;
}

/**
 * Creates the state machine behind an auto-advancing slideshow.
 *
 * The slideshow runs only while it is switched on, nothing holds it and the
 * page is visible. An image advances when its interval runs out, counted
 * from the moment it loaded; a video advances when it ends. Every stop keeps
 * the progress, so the same slide continues rather than starting over, and a
 * video that ends while something holds the slideshow advances on release.
 *
 * Page visibility is watched here. Hover, drag and slide changes come from
 * the caller, which owns the DOM.
 */
export const createSlideshowController = (
  config: SlideshowControllerConfig,
): SlideshowController => {
  let interval = config.interval;
  let kind: SlideshowSlideKind = 'image';
  let isReady = false;
  let hasStarted = false;
  let hasPendingEnd = false;
  let isPageHidden =
    typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const holds = new Set<string>();

  const isPlaying = createSignal(false);
  const timer = createTimerController({
    duration: interval,
    onComplete: () => config.onAdvance(),
  });

  const canRun = () => isPlaying.value && holds.size === 0 && !isPageHidden;

  const sync = () => {
    if (!canRun()) {
      timer.pause();
      return;
    }
    if (hasPendingEnd) {
      hasPendingEnd = false;
      config.onAdvance();
      return;
    }
    if (kind !== 'image' || !isReady) return;
    if (hasStarted) {
      timer.resume();
    } else {
      hasStarted = true;
      timer.start(interval);
    }
  };

  const disposeVisibility: Disposer =
    typeof document === 'undefined'
      ? noop
      : observeDomEvent(document, 'visibilitychange', () => {
          isPageHidden = document.visibilityState === 'hidden';
          sync();
        });

  const play = () => {
    if (isPlaying.value) return;
    isPlaying.value = true;
    sync();
  };

  const pause = () => {
    if (!isPlaying.value) return;
    isPlaying.value = false;
    sync();
  };

  return {
    isPlaying,
    progress: timer.progress,
    play,
    pause,

    toggle() {
      if (isPlaying.value) pause();
      else play();
    },

    setInterval(next) {
      interval = next;
    },

    setSlide(next) {
      kind = next;
      isReady = false;
      hasStarted = false;
      hasPendingEnd = false;
      timer.reset();
    },

    ready() {
      if (isReady) return;
      isReady = true;
      sync();
    },

    ended() {
      if (kind !== 'video') return;
      hasPendingEnd = true;
      sync();
    },

    hold(reason) {
      holds.add(reason);
      sync();
    },

    release(reason) {
      if (!holds.delete(reason)) return;
      sync();
    },

    dispose() {
      disposeVisibility();
      timer.dispose();
    },
  };
};

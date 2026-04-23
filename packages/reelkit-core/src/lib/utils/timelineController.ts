import {
  createSignal,
  createComputed,
  type Signal,
  type ComputedSignal,
} from './signal';
import { createDisposableList, type Disposer } from './disposable';
import { clamp } from './number';
import { observeDomEvent } from './observeDomEvent';

/**
 * Configuration for {@link createTimelineController}.
 */
export interface TimelineControllerConfig {
  /**
   * Seconds of seek per ArrowLeft / ArrowRight key press.
   *
   * @default 5
   */
  keyboardStepSeconds?: number;

  /**
   * Fraction of total duration for PageUp / PageDown key presses.
   *
   * @default 0.1
   */
  keyboardPageFraction?: number;

  /** Called whenever the user commits a seek (pointerup or keydown). */
  onSeek?: (seconds: number) => void;

  /** Called when scrubbing starts — e.g. overlay pauses the video. */
  onScrubStart?: () => void;

  /** Called when scrubbing ends — e.g. overlay resumes playback. */
  onScrubEnd?: () => void;
}

/** A single contiguous buffered region, expressed as a 0–1 fraction of total duration. */
export interface BufferedRange {
  start: number;
  end: number;
}

/**
 * Framework-agnostic playback timeline controller. Tracks `<video>` position,
 * buffered ranges, and user scrubbing state as signals; provides pointer +
 * keyboard interaction binding for a track element.
 */
export interface TimelineController {
  /** Total duration in seconds. `0` before metadata loads; `Infinity` for live. */
  duration: Signal<number>;

  /** Current playback position in seconds. rAF-throttled while playing. */
  currentTime: Signal<number>;

  /** Normalised, sorted, non-overlapping buffered ranges. */
  bufferedRanges: Signal<readonly BufferedRange[]>;

  /** `true` while the user is actively dragging the scrub handle. */
  isScrubbing: Signal<boolean>;

  /** 0–1 fraction derived from `currentTime / duration`. `0` when duration unknown. */
  progress: ComputedSignal<number>;

  /** Attach a video element; subscribes to playback events. */
  attach(video: HTMLVideoElement): void;

  /** Detach from the current video and reset all signals. Safe to call repeatedly. */
  detach(): void;

  /**
   * Wire pointer + keyboard handlers onto a DOM element (typically the
   * timeline track). Returns a disposer that removes all listeners.
   */
  bindInteractions(target: HTMLElement): Disposer;

  /** Programmatic seek. Fires `onSeek`. */
  seek(seconds: number): void;
}

const _kDefaultKeyboardStepSeconds = 5;
const _kDefaultKeyboardPageFraction = 0.1;

const _isSeekable = (duration: number): boolean =>
  Number.isFinite(duration) && duration > 0;

const _normaliseBuffered = (
  video: HTMLVideoElement,
  duration: number,
): BufferedRange[] => {
  if (!_isSeekable(duration)) return [];
  const { buffered } = video;
  const ranges: BufferedRange[] = [];
  for (let i = 0; i < buffered.length; i++) {
    ranges.push({
      start: clamp(buffered.start(i) / duration, 0, 1),
      end: clamp(buffered.end(i) / duration, 0, 1),
    });
  }
  ranges.sort((a, b) => a.start - b.start);
  const merged: BufferedRange[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ start: r.start, end: r.end });
    }
  }
  return merged;
};

/**
 * Creates a timeline controller with reactive playback state and pointer +
 * keyboard interaction binding.
 *
 * @example
 * ```ts
 * const timeline = createTimelineController({
 *   onScrubStart: () => video.pause(),
 *   onScrubEnd: () => video.play(),
 * });
 * timeline.attach(video);
 * const dispose = timeline.bindInteractions(trackEl);
 * // ...later:
 * dispose();
 * timeline.detach();
 * ```
 */
export const createTimelineController = (
  config: TimelineControllerConfig = {},
): TimelineController => {
  const keyboardStepSeconds =
    config.keyboardStepSeconds ?? _kDefaultKeyboardStepSeconds;
  const keyboardPageFraction =
    config.keyboardPageFraction ?? _kDefaultKeyboardPageFraction;

  const duration = createSignal(0);
  const currentTime = createSignal(0);
  const bufferedRanges = createSignal<readonly BufferedRange[]>([]);
  const isScrubbing = createSignal(false);
  const progress = createComputed(
    () => {
      const d = duration.value;
      if (!_isSeekable(d)) return 0;
      return clamp(currentTime.value / d, 0, 1);
    },
    () => [duration, currentTime],
  );

  let video: HTMLVideoElement | null = null;
  const videoDisposables = createDisposableList();
  let rafHandle: number | null = null;
  let lastEmittedMs = -1;

  const syncCurrentTime = () => {
    if (!video) return;
    const ms = Math.round(video.currentTime * 1000);
    if (ms !== lastEmittedMs) {
      lastEmittedMs = ms;
      currentTime.value = ms / 1000;
    }
  };

  const syncDuration = () => {
    if (!video) return;
    const d = video.duration;
    duration.value = Number.isFinite(d) ? d : d === Infinity ? Infinity : 0;
  };

  const syncBuffered = () => {
    if (!video) return;
    bufferedRanges.value = _normaliseBuffered(video, duration.value);
  };

  const stopRafLoop = () => {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
  };

  const startRafLoop = () => {
    if (rafHandle !== null || !video) return;
    const tick = () => {
      if (!video || video.paused) {
        rafHandle = null;
        return;
      }
      syncCurrentTime();
      rafHandle = requestAnimationFrame(tick);
    };
    rafHandle = requestAnimationFrame(tick);
  };

  const previewSeek = (seconds: number) => {
    if (!video) return;
    const d = duration.value;
    if (!_isSeekable(d)) return;
    video.currentTime = clamp(seconds, 0, d);
    syncCurrentTime();
  };

  const seek: TimelineController['seek'] = (seconds) => {
    if (!video) return;
    const d = duration.value;
    if (!_isSeekable(d)) return;
    const clamped = clamp(seconds, 0, d);
    video.currentTime = clamped;
    syncCurrentTime();
    config.onSeek?.(clamped);
  };

  const attach: TimelineController['attach'] = (next) => {
    if (video === next) return;
    if (video) detach();
    video = next;
    lastEmittedMs = -1;

    syncDuration();
    syncCurrentTime();
    syncBuffered();

    videoDisposables.push(
      observeDomEvent(next, 'loadedmetadata', () => {
        syncDuration();
        syncCurrentTime();
        syncBuffered();
      }),
      observeDomEvent(next, 'durationchange', () => {
        syncDuration();
        syncBuffered();
      }),
      observeDomEvent(next, 'timeupdate', syncCurrentTime),
      observeDomEvent(next, 'progress', syncBuffered),
      observeDomEvent(next, 'seeking', syncCurrentTime),
      observeDomEvent(next, 'seeked', syncCurrentTime),
      observeDomEvent(next, 'play', startRafLoop),
      observeDomEvent(next, 'playing', startRafLoop),
      observeDomEvent(next, 'pause', stopRafLoop),
      observeDomEvent(next, 'ended', stopRafLoop),
    );

    if (!next.paused) startRafLoop();
  };

  const detach = () => {
    stopRafLoop();
    videoDisposables.dispose();
    video = null;
    lastEmittedMs = -1;
    duration.value = 0;
    currentTime.value = 0;
    bufferedRanges.value = [];
    isScrubbing.value = false;
  };

  const bindInteractions = (target: HTMLElement) => {
    const list = createDisposableList();
    let activePointerId: number | null = null;

    const secondsFromPointer = (e: PointerEvent): number => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      return (x / rect.width) * duration.value;
    };

    const releaseCapture = (pointerId: number) => {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // pointerId may have already been released
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!_isSeekable(duration.value)) return;
      activePointerId = e.pointerId;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // capture may fail when target is detached — safe to ignore
      }
      isScrubbing.value = true;
      config.onScrubStart?.();
      previewSeek(secondsFromPointer(e));
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activePointerId !== e.pointerId) return;
      if (!isScrubbing.value) return;
      previewSeek(secondsFromPointer(e));
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (activePointerId !== e.pointerId) return;
      releaseCapture(e.pointerId);
      activePointerId = null;
      if (!isScrubbing.value) return;
      isScrubbing.value = false;
      config.onScrubEnd?.();
      if (video) config.onSeek?.(video.currentTime);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const d = duration.value;
      if (!_isSeekable(d) || !video) return;
      const t = video.currentTime;
      switch (e.key) {
        case 'ArrowLeft':
          seek(t - keyboardStepSeconds);
          e.preventDefault();
          break;
        case 'ArrowRight':
          seek(t + keyboardStepSeconds);
          e.preventDefault();
          break;
        case 'PageDown':
          seek(t - keyboardPageFraction * d);
          e.preventDefault();
          break;
        case 'PageUp':
          seek(t + keyboardPageFraction * d);
          e.preventDefault();
          break;
        case 'Home':
          seek(0);
          e.preventDefault();
          break;
        case 'End':
          seek(d);
          e.preventDefault();
          break;
      }
    };

    list.push(
      observeDomEvent(target, 'pointerdown', onPointerDown),
      observeDomEvent(target, 'pointermove', onPointerMove),
      observeDomEvent(target, 'pointerup', onPointerEnd),
      observeDomEvent(target, 'pointercancel', onPointerEnd),
      observeDomEvent(target, 'keydown', onKeyDown),
    );

    return () => {
      if (activePointerId !== null) {
        releaseCapture(activePointerId);
        activePointerId = null;
      }
      isScrubbing.value = false;
      list.dispose();
    };
  };

  return {
    duration,
    currentTime,
    bufferedRanges,
    isScrubbing,
    progress,
    attach,
    detach,
    bindInteractions,
    seek,
  };
};

import { createSignal } from '@reelkit/core';

/** Configuration for {@link createTimerController}. */
export interface TimerControllerConfig {
  /** Default duration in milliseconds. */
  duration: number;

  /** Called when the timer reaches 100%. */
  onComplete?: () => void;
}

/** Timer that drives auto-advance and the progress bar signal. */
export interface TimerController {
  /** Progress signal (0 → 1). */
  readonly progress: ReturnType<typeof createSignal<number>>;

  /** Whether the timer is currently running. */
  readonly isRunning: ReturnType<typeof createSignal<boolean>>;

  /** Start (or restart) the timer with an optional duration override. */
  start(duration?: number): void;

  /** Freeze progress at the current position. */
  pause(): void;

  /** Continue from the frozen position. */
  resume(): void;

  /** Reset progress to 0 and stop. */
  reset(): void;

  /** Clean up resources. */
  dispose(): void;
}

/**
 * Creates a timer controller that drives the auto-advance progress bar.
 * Uses `requestAnimationFrame` for smooth progress updates (0→1).
 * Supports pause/resume with exact position preservation.
 */
export const createTimerController = (
  config: TimerControllerConfig,
): TimerController => {
  const { onComplete } = config;

  const progress = createSignal(0);
  const isRunning = createSignal(false);

  let currentDuration = config.duration;
  let elapsed = 0;
  let lastTimestamp = 0;
  let frameId: number | null = null;

  const tick = () => {
    if (!isRunning.value) return;

    const now = performance.now();
    elapsed += now - lastTimestamp;
    lastTimestamp = now;

    const p = Math.min(1, elapsed / currentDuration);
    progress.value = p;

    if (p >= 1) {
      isRunning.value = false;
      frameId = null;
      onComplete?.();
      return;
    }

    frameId = requestAnimationFrame(tick);
  };

  return {
    progress,
    isRunning,

    start(duration?: number) {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      currentDuration = duration ?? config.duration;
      elapsed = 0;
      progress.value = 0;
      isRunning.value = true;
      lastTimestamp = performance.now();
      frameId = requestAnimationFrame(tick);
    },

    pause() {
      if (!isRunning.value) return;
      isRunning.value = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },

    resume() {
      if (isRunning.value || progress.value >= 1) return;
      isRunning.value = true;
      lastTimestamp = performance.now();
      frameId = requestAnimationFrame(tick);
    },

    reset() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      elapsed = 0;
      progress.value = 0;
      isRunning.value = false;
    },

    dispose() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      isRunning.value = false;
    },
  };
};

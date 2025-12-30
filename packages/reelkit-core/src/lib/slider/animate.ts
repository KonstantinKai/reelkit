import bezierEasing from 'bezier-easing';
import { clamp, lerp } from '../utils/number';

type EasingFn = (t: number) => number;

// Lazy-loaded easeInOut bezier curve (0.4, 0, 0.2, 1)
let easingInstance: EasingFn | null = null;
const getEasing = (): EasingFn => {
  if (easingInstance === null) {
    easingInstance = bezierEasing(0.4, 0, 0.2, 1);
  }
  return easingInstance;
};

export type AnimationOptions = {
  from: number;
  to: number;
  duration: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

/**
 * Animate a value from start to end using easeInOut curve.
 * Returns a cancel function.
 */
export const animate = (options: AnimationOptions): (() => void) => {
  const { from, to, duration, onUpdate, onComplete } = options;

  if (duration <= 0) {
    onUpdate(to);
    onComplete?.();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  let rafId: number | null = null;
  let startTime: number | undefined;
  let canceled = false;

  const tick = (timestamp: number) => {
    if (canceled) return;

    startTime ??= timestamp;
    const runtime = timestamp - startTime;
    const progress = getEasing()(clamp(runtime / duration, 0, 1));
    const value = lerp(progress, from, to);

    onUpdate(value);

    if (runtime < duration) {
      rafId = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    canceled = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};

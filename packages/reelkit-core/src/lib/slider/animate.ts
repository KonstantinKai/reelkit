import { clamp, lerp } from '../utils/number';
import { noop } from '../utils/noop';

type EasingFn = (t: number) => number;

// Cubic bezier easing (0.4, 0, 0.2, 1) — "easeInOut" material curve
// Based on https://github.com/gre/bezier-easing (MIT)
const createBezierEasing = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EasingFn => {
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;
  const SUBDIVISION_MAX_ITERATIONS = 10;
  const TABLE_SIZE = 11;
  const SAMPLE_STEP = 1.0 / (TABLE_SIZE - 1);

  const a = (a1: number, a2: number) => 1.0 - 3.0 * a2 + 3.0 * a1;
  const b = (a1: number, a2: number) => 3.0 * a2 - 6.0 * a1;
  const c = (a1: number) => 3.0 * a1;

  const calc = (t: number, a1: number, a2: number) =>
    ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;

  const slope = (t: number, a1: number, a2: number) =>
    3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);

  const binarySubdivide = (x: number, lo: number, hi: number) => {
    let current: number;
    let t: number;
    let i = 0;
    do {
      t = lo + (hi - lo) / 2.0;
      current = calc(t, x1, x2) - x;
      if (current > 0.0) hi = t;
      else lo = t;
    } while (
      Math.abs(current) > SUBDIVISION_PRECISION &&
      ++i < SUBDIVISION_MAX_ITERATIONS
    );
    return t;
  };

  const newtonRaphson = (x: number, guess: number) => {
    for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
      const currentSlope = slope(guess, x1, x2);
      if (currentSlope === 0.0) return guess;
      const currentX = calc(guess, x1, x2) - x;
      guess -= currentX / currentSlope;
    }
    return guess;
  };

  // Pre-compute sample table
  const sampleValues = new Float32Array(TABLE_SIZE);
  for (let i = 0; i < TABLE_SIZE; ++i) {
    sampleValues[i] = calc(i * SAMPLE_STEP, x1, x2);
  }

  const getTForX = (x: number) => {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = TABLE_SIZE - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= x;
      ++currentSample
    ) {
      intervalStart += SAMPLE_STEP;
    }
    --currentSample;

    const dist =
      (x - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * SAMPLE_STEP;

    const initialSlope = slope(guessForT, x1, x2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphson(x, guessForT);
    } else if (initialSlope === 0.0) {
      return guessForT;
    }
    return binarySubdivide(
      x,
      intervalStart,
      intervalStart + SAMPLE_STEP,
    );
  };

  return (x: number) => {
    if (x === 0 || x === 1) return x;
    return calc(getTForX(x), y1, y2);
  };
};

// Lazy-loaded easeInOut bezier curve (0.4, 0, 0.2, 1)
let easingInstance: EasingFn | null = null;
const getEasing = (): EasingFn => {
  if (easingInstance === null) {
    easingInstance = createBezierEasing(0.4, 0, 0.2, 1);
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
    return noop;
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

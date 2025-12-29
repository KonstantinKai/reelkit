/**
 * Returns the absolute value of a number
 */
export const abs = (value: number): number => Math.abs(value);

/**
 * Returns true if value is less than 0
 */
export const isNegative = (value: number): boolean => value < 0;

/**
 * Clamps number within the inclusive "min" and "max" bounds.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

/**
 * Linear interpolation between two values
 *
 * @example
 * lerp(0, 10, 30); // 10
 * lerp(1, 10, 30); // 30
 * lerp(0.5, 10, 30); // 20
 */
export const lerp = (t: number, a: number, b: number): number => {
  return a * (1 - t) + b * t;
};

/**
 * Extracts a range of indices from 0 to count-1
 *
 * @param count Total number of items
 * @param start Start index
 * @param end End index (defaults to start)
 * @param overscan Number of extra items to include on each side (default: 1)
 * @param loop Whether to wrap around at boundaries (default: false)
 */
export const extractRange = (
  count: number,
  start: number,
  end?: number,
  overscan?: number,
  loop?: boolean
): number[] => {
  end ??= start;
  overscan ??= 1;
  loop ??= false;

  // Out of range
  if (count <= 0 || end >= count) return [];
  if (loop && count === 1) return [0];

  const lastIndex = count - 1;
  const startIndex = Math.max(start - overscan, loop ? 0 - overscan : 0);
  const endIndex = Math.min(end + overscan, loop ? lastIndex + overscan : lastIndex);

  const arr: number[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    let index = i;
    if (loop) {
      if (i < 0) index = count + i;
      if (i > lastIndex) index = i - count;
    }
    arr.push(index);
  }

  return arr;
};

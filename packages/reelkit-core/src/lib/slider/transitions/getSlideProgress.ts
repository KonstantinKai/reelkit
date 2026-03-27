/**
 * Computes the normalized slide offset `t` for a given axis value.
 * `t = 0` means the slide is exactly at rest (current position).
 * `t = -1` or `t = 1` means the slide is one full size away.
 */
export const getSlideProgress = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
): number => {
  const baseOffset = currentRangeIndex * primarySize * -1;
  const progress = (axisValue - baseOffset) / primarySize;
  return slideIndex - currentRangeIndex + progress;
};

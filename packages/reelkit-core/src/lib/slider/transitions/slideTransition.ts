import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';

/**
 * Default slide transition — translates each slide along the primary axis.
 */
export const slideTransition = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  direction: SliderDirection,
): SlideTransformStyle => {
  if (primarySize === 0) return {};

  const baseOffset = currentRangeIndex * primarySize * -1;
  const progress = (axisValue - baseOffset) / primarySize;
  const slideOffset = slideIndex - currentRangeIndex;
  const translatePx = (slideOffset + progress) * primarySize;
  const axis = direction === 'horizontal' ? 'X' : 'Y';

  return {
    transform: `translate${axis}(${translatePx}px)`,
  };
};

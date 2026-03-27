import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';
import { getSlideProgress } from './getSlideProgress';

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

  const t = getSlideProgress(axisValue, slideIndex, currentRangeIndex, primarySize);
  const axis = direction === 'horizontal' ? 'X' : 'Y';

  return {
    transform: `translate${axis}(${t * primarySize}px)`,
  };
};

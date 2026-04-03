import { abs } from '../../utils/number';
import { clamp } from '../../utils/number';
import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';
import { getSlideProgress } from './getSlideProgress';

/**
 * Computes per-slide opacity for a crossfade transition.
 *
 * The current slide fades from opacity 1 → 0 while the incoming slide
 * fades from 0 → 1. All slides are stacked absolutely; the active slide
 * gets the highest z-index.
 */
export const fadeTransition = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  _direction: SliderDirection, // eslint-disable-line @typescript-eslint/no-unused-vars
): SlideTransformStyle => {
  if (primarySize === 0) return { opacity: 0 };

  const t = getSlideProgress(
    axisValue,
    slideIndex,
    currentRangeIndex,
    primarySize,
  );
  const distance = abs(t);
  const opacity = clamp(1 - distance, 0, 1);

  return {
    opacity,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

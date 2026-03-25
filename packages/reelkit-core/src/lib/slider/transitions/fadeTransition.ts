import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';

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

  const baseOffset = currentRangeIndex * primarySize * -1;
  const progress = (axisValue - baseOffset) / primarySize;
  const slideOffset = slideIndex - currentRangeIndex;
  const distance = Math.abs(slideOffset + progress);
  const opacity = Math.max(0, Math.min(1, 1 - distance));

  return {
    opacity,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

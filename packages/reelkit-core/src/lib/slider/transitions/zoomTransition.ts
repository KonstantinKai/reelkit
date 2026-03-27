import { abs } from '../../utils/number';
import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';
import { getSlideProgress } from './getSlideProgress';

/**
 * Computes per-slide scale and opacity for a zoom transition.
 *
 * The current slide is at full scale and opacity. Neighboring slides
 * scale down to 0.8 and fade out, creating a zoom-in/zoom-out effect
 * commonly used in image gallery lightboxes.
 */
export const zoomTransition = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  _direction: SliderDirection, // eslint-disable-line @typescript-eslint/no-unused-vars
): SlideTransformStyle => {
  if (primarySize === 0) return { opacity: 0 };

  const t = getSlideProgress(axisValue, slideIndex, currentRangeIndex, primarySize);
  const distance = abs(t);

  if (distance >= 1) return { opacity: 0, zIndex: 0 };

  const scale = 1 - distance * 0.2;
  const opacity = 1 - distance;

  return {
    transform: `scale(${scale})`,
    opacity,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

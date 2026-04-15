import {
  abs,
  getSlideProgress,
  type SlideTransformStyle,
  type TransitionTransformFn,
} from '@reelkit/angular';

/**
 * Lightbox zoom-in transition. Incoming slides scale from 70% to 100%
 * while fading in. Off-screen slides (distance >= 1) are fully hidden.
 */
export const lightboxZoomTransition: TransitionTransformFn = (
  axisValue,
  slideIndex,
  currentRangeIndex,
  primarySize,
): SlideTransformStyle => {
  if (primarySize === 0) return { opacity: 0 };
  const t = getSlideProgress(
    axisValue,
    slideIndex,
    currentRangeIndex,
    primarySize,
  );
  const distance = abs(t);
  if (distance >= 1) return { opacity: 0, zIndex: 0 };
  const scale = 0.7 + (1 - distance) * 0.3;
  const nudge = t * primarySize * 0.08;
  return {
    transform: `translateX(${nudge}px) scale(${scale})`,
    opacity: 1 - distance,
    zIndex: distance < 0.5 ? 2 : 1,
  };
};

import {
  abs,
  clamp,
  getSlideProgress,
  type SlideTransformStyle,
  type TransitionTransformFn,
} from '@reelkit/angular';

/**
 * Lightbox crossfade transition with a subtle horizontal nudge.
 * The current slide fades out while the next fades in. A small
 * translateX offset adds depth to the crossfade.
 */
export const lightboxFadeTransition: TransitionTransformFn = (
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
  const nudge = t * primarySize * 0.08;
  return {
    transform: `translateX(${nudge}px)`,
    opacity: clamp(1 - distance, 0, 1),
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

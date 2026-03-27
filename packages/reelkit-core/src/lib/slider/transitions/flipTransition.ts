import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';
import { getSlideProgress } from './getSlideProgress';

const _kMaxAngle = 20;
const _kPerspectivePx = 1000;
const _kScaleDip = 0.02;

/**
 * Computes per-slide flip transition transforms.
 *
 * Combines horizontal/vertical translation with a small 3D rotation that
 * peaks at the midpoint, creating an Instagram-style flip appearance.
 * Uses per-element `perspective()` with `transform-origin` at the meeting
 * edge — no `preserve-3d` required, works with `overflow: hidden`.
 */
export const flipTransition = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  direction: SliderDirection,
): SlideTransformStyle => {
  if (primarySize === 0) return {};

  const t = getSlideProgress(axisValue, slideIndex, currentRangeIndex, primarySize);

  if (t <= -1 || t >= 1) {
    return { opacity: 0, zIndex: 0 };
  }

  const isHorizontal = direction === 'horizontal';
  const translateAxis = isHorizontal ? 'X' : 'Y';
  const rotateAxis = isHorizontal ? 'Y' : 'X';
  const translatePx = t * primarySize;

  const bell = Math.sin(Math.abs(t) * Math.PI);
  const rotSign = t >= 0 ? -1 : 1;
  const axisSign = isHorizontal ? 1 : -1;
  const rotation = bell * _kMaxAngle * rotSign * axisSign;
  const scale = 1 - bell * _kScaleDip;

  const origin = isHorizontal
    ? t >= 0
      ? 'center right'
      : 'center left'
    : t >= 0
      ? 'center bottom'
      : 'center top';

  return {
    transform: `translate${translateAxis}(${translatePx}px) scale(${scale}) perspective(${_kPerspectivePx}px) rotate${rotateAxis}(${rotation}deg)`,
    transformOrigin: origin,
    opacity: 1,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

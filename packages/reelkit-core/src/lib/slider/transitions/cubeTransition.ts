import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';

const PERSPECTIVE_PX = 1000;

/**
 * Computes per-slide 3D cube rotation transforms.
 *
 * The cube effect rotates the current slide from 0° toward -90° while the
 * incoming slide rotates from 90° toward 0°, creating a page-turning 3D
 * effect around the Y axis (horizontal) or X axis (vertical).
 */
export const cubeTransition = (
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
  const angle = (slideOffset + progress) * 90;

  if (angle <= -90 || angle >= 90) {
    return { opacity: 0, zIndex: 0 };
  }

  const isHorizontal = direction === 'horizontal';
  const axis = isHorizontal ? 'Y' : 'X';
  const sign = isHorizontal ? 1 : -1;
  const rotation = angle * sign;
  const originAxis = isHorizontal ? 'X' : 'Y';
  const halfSize = primarySize / 2;
  const translate = `translate${originAxis}(${angle > 0 ? -halfSize : halfSize}px)`;

  return {
    transform: `perspective(${PERSPECTIVE_PX}px) ${translate} rotate${axis}(${rotation}deg) translate${originAxis}(${angle > 0 ? halfSize : -halfSize}px)`,
    opacity: 1,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

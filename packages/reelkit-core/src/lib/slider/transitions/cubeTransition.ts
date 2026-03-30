import type { SliderDirection } from '../types';
import type { SlideTransformStyle } from './types';
import { getSlideProgress } from './getSlideProgress';

const _kMaxAngle = 60;
const _kPerspectivePx = 500;

/**
 * Computes per-slide 3D cube rotation transforms.
 *
 * Credits: [ohcubeview](https://github.com/oyvinddd/ohcubeview). Each
 * face slides via `translateX` and rotates up to 60° around its near edge.
 * A close `perspective(500px)` gives prominent 3D foreshortening. The
 * `transform-origin` toggles between left and right edges depending on
 * scroll direction, matching the physical hinge of a cube face.
 *
 * Unlike {@link flipTransition}, cube uses linear rotation proportional to
 * scroll position (not a bell curve), producing a more dramatic 3D effect.
 */
export const cubeTransition = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  direction: SliderDirection,
): SlideTransformStyle => {
  if (primarySize === 0) return {};

  const t = getSlideProgress(
    axisValue,
    slideIndex,
    currentRangeIndex,
    primarySize,
  );

  if (t <= -1 || t >= 1) {
    return { opacity: 0, zIndex: 0 };
  }

  const isHorizontal = direction === 'horizontal';
  const translateAxis = isHorizontal ? 'X' : 'Y';
  const rotateAxis = isHorizontal ? 'Y' : 'X';
  const translatePx = t * primarySize;

  const axisSign = isHorizontal ? 1 : -1;
  const rotation = t * _kMaxAngle * axisSign;

  const origin = isHorizontal
    ? t < 0
      ? 'right center'
      : 'left center'
    : t < 0
      ? 'center bottom'
      : 'center top';

  return {
    transform: `translate${translateAxis}(${translatePx}px) perspective(${_kPerspectivePx}px) rotate${rotateAxis}(${rotation}deg)`,
    transformOrigin: origin,
    opacity: 1,
    zIndex: slideIndex === currentRangeIndex ? 2 : 1,
  };
};

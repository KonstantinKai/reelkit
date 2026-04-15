import type { TapAction } from './types';

/**
 * Determines whether a tap at the given X position triggers a
 * `'prev'` or `'next'` navigation action based on the split ratio.
 */
export const getTapAction = (
  tapX: number,
  containerWidth: number,
  splitRatio = 0.3,
): TapAction => (tapX < containerWidth * splitRatio ? 'prev' : 'next');

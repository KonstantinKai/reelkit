export { cubeTransition } from './cubeTransition';
export { fadeTransition } from './fadeTransition';
export type {
  SlideTransformStyle,
  TransitionTransformFn,
  TransitionType,
} from './types';

import { cubeTransition } from './cubeTransition';
import { fadeTransition } from './fadeTransition';
import type { TransitionTransformFn, TransitionType } from './types';

/** Returns the transform function for a built-in transition type, or `null` for `'slide'`. */
export const getTransitionFn = (
  transition: TransitionType,
): TransitionTransformFn | null => {
  switch (transition) {
    case 'cube':
      return cubeTransition;
    case 'fade':
      return fadeTransition;
    default:
      return null;
  }
};

import type { SliderDirection } from '../types';

/** CSS-like style properties applied to an individual slide during a transition. */
export type SlideTransformStyle = {
  transform?: string;
  opacity?: number;
  zIndex?: number;
};

/** A function that computes per-slide CSS styles based on the current axis value. */
export type TransitionTransformFn = (
  axisValue: number,
  slideIndex: number,
  currentRangeIndex: number,
  primarySize: number,
  direction: SliderDirection,
) => SlideTransformStyle;

/** Built-in transition types. */
export type TransitionType = 'slide' | 'cube' | 'fade';

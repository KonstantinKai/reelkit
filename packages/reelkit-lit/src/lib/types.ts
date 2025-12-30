import type { RangeExtractor, SliderDirection } from '@reelkit/core';

export interface ReelSliderConfig {
  /** Total items count */
  count: number;

  /**
   * Slider direction
   * @default 'vertical'
   */
  direction?: SliderDirection;

  /**
   * Initial slide index
   * @default 0
   */
  initialIndex?: number;

  /**
   * Enable loop mode
   * @default false
   */
  loop?: boolean;

  /**
   * Transition duration in milliseconds
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Swipe distance factor (0-1) to trigger slide change
   * @default 0.12
   */
  swipeDistanceFactor?: number;

  /**
   * Enable touch/mouse gestures
   * @default true
   */
  enableGestures?: boolean;

  /**
   * Enable keyboard navigation
   * @default true
   */
  enableKeyboard?: boolean;

  /** Custom range extractor for virtualization */
  rangeExtractor?: RangeExtractor;
}

export interface ReelIndicatorConfig {
  /** Total number of dots */
  count: number;

  /**
   * Initially active index
   * @default 0
   */
  activeIndex?: number;

  /**
   * Indicator direction
   * @default 'vertical'
   */
  direction?: SliderDirection;

  /**
   * Dot size in pixels
   * @default 8
   */
  size?: number;

  /**
   * Gap between dots in pixels
   * @default 8
   */
  gap?: number;

  /**
   * Active dot color
   * @default 'rgba(255, 255, 255, 1)'
   */
  activeColor?: string;

  /**
   * Inactive dot color
   * @default 'rgba(255, 255, 255, 0.4)'
   */
  inactiveColor?: string;
}

export type { SliderDirection, RangeExtractor } from '@reelkit/core';

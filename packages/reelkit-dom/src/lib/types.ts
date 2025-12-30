import type { RangeExtractor, SliderDirection } from '@reelkit/core';

export interface ReelConfig {
  /** Container element */
  element: HTMLElement;

  /** Total items count */
  count: number;

  /** Create slide content for given index */
  itemBuilder: (index: number) => HTMLElement;

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

export interface ReelEvents {
  /** Called after slide change completes */
  onChange?: (index: number) => void;

  /** Called before slide change starts */
  onBeforeChange?: (index: number, nextIndex: number) => void;

  /** Called when drag gesture starts */
  onDragStart?: (index: number) => void;

  /** Called when drag gesture ends */
  onDragEnd?: () => void;

  /** Called when drag is canceled (returns to same slide) */
  onDragCanceled?: (index: number) => void;
}

export interface ReelIndicatorConfig {
  /** Container element */
  element: HTMLElement;

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
   * Number of normal-sized visible dots
   * @default 5
   */
  visible?: number;

  /**
   * Dot radius in pixels
   * @default 3
   */
  radius?: number;

  /**
   * Gap between dots in pixels
   * @default 4
   */
  gap?: number;

  /**
   * Scale for edge dots (0-1)
   * @default 0.5
   */
  edgeScale?: number;

  /**
   * Active dot color
   * @default '#fff'
   */
  activeColor?: string;

  /**
   * Inactive dot color
   * @default 'rgba(255, 255, 255, 0.5)'
   */
  inactiveColor?: string;
}

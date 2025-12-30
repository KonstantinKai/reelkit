import type { Signal, ComputedSignal } from '../core/signal';

export type AnimatedValue = {
  value: number;
  duration: number;
  done?: () => void;
};

export type RangeExtractor = (current: number, count: number, loop: boolean) => number[];

export interface SliderConfig {
  count: number;
  initialIndex?: number;
  direction?: 'horizontal' | 'vertical';
  loop?: boolean;
  transitionDuration?: number;
  swipeDistanceFactor?: number;
  rangeExtractor?: RangeExtractor;
}

export interface SliderEvents {
  onBeforeChange?: (index: number, nextIndex: number, rangeIndex: number) => void;
  onAfterChange?: (index: number, rangeIndex: number) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragCanceled?: (index: number) => void;
}

export interface SliderState {
  index: Signal<number>;
  axisValue: Signal<AnimatedValue>;
  indexes: ComputedSignal<number[]>;
}

export interface SliderController {
  readonly state: SliderState;
  readonly config: SliderConfig;

  /** Get current range index (position within visible range) */
  getRangeIndex(): number;

  /** Navigate to next item */
  next(): Promise<void>;

  /** Navigate to previous item */
  prev(): Promise<void>;

  /** Navigate to specific index */
  goTo(index: number): Promise<void>;

  /** Update axis value to match current range index */
  adjust(duration?: number): void;

  /** Update the primary size (for recalculating positions) */
  setPrimarySize(size: number): void;

  /** Update configuration */
  updateConfig(config: Partial<SliderConfig>): void;

  /** Update event handlers */
  updateEvents(events: Partial<SliderEvents>): void;

  /** Start observing gestures and keyboard */
  observe(): void;

  /** Stop observing gestures and keyboard */
  unobserve(): void;

  /** Attach to DOM element */
  attach(element: HTMLElement): void;

  /** Detach from DOM element */
  detach(): void;

  /** Cleanup all resources */
  dispose(): void;
}

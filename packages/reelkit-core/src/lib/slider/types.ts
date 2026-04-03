import type { Signal, ComputedSignal } from '../utils/signal';
import type { GestureCommonEvent, GestureEvent } from '../gestures/types';

/** Axis along which the slider moves. */
export type SliderDirection = 'horizontal' | 'vertical';

/**
 * Describes a numeric value that should be applied to the slider's
 * translation axis, optionally animated over a given duration.
 */
export type AnimatedValue = {
  /** Current pixel offset along the primary axis. */
  value: number;

  /** Transition duration in milliseconds. `0` means instant. */
  duration: number;

  /** Called when the animated transition completes. */
  done?: () => void;
};

/**
 * Function that computes which slide indices should be rendered
 * given the current index, total count, and loop mode.
 *
 * @param current - The currently active slide index.
 * @param count - Total number of slides.
 * @param loop - Whether the slider wraps around at boundaries.
 * @returns An array of slide indices to render (e.g. `[prev, current, next]`).
 */
export type RangeExtractor = (
  current: number,
  count: number,
  loop: boolean,
) => number[];

/**
 * Configuration for a {@link SliderController}.
 */
export interface SliderConfig {
  /** Total number of slides. */
  count: number;

  /**
   * Index of the initially visible slide.
   * @default 0
   */
  initialIndex?: number;

  /**
   * Axis along which the slider moves.
   * @default 'vertical'
   */
  direction?: SliderDirection;

  /**
   * Whether the slider wraps around from the last slide back to the first
   * (and vice versa).
   * @default false
   */
  loop?: boolean;

  /**
   * Duration of the slide transition animation in milliseconds.
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Minimum swipe distance as a fraction of the slide's primary dimension
   * (0–1) required to trigger a slide change.
   * @default 0.12
   */
  swipeDistanceFactor?: number;

  /**
   * Enable mouse wheel navigation.
   * @default false
   */
  enableWheel?: boolean;

  /**
   * Debounce duration for wheel events in milliseconds.
   * @default 200
   */
  wheelDebounceMs?: number;

  /**
   * Whether gesture (touch/mouse drag) navigation is enabled.
   * When `false`, the gesture controller is not attached. Navigation
   * is still possible via the API (`next`, `prev`, `goTo`).
   * @default true
   */
  enableGestures?: boolean;

  /**
   * Whether keyboard (arrow keys) navigation is enabled.
   * When `false`, the keyboard controller is not attached.
   * @default true
   */
  enableNavKeys?: boolean;

  /**
   * Custom function that determines which slide indices are rendered.
   * Defaults to the built-in extractor that returns current ± 1 overscan.
   *
   * NOTE: The result is clamped to a maximum of 3 indices. If more are
   * returned, the controller keeps 3 centered around the current slide.
   */
  rangeExtractor?: RangeExtractor;
}

/**
 * Lifecycle event callbacks for a {@link SliderController}.
 */
export interface SliderEvents {
  /**
   * Fired before a slide transition begins.
   * @param index - Current slide index.
   * @param nextIndex - The index the slider is transitioning to.
   * @param rangeIndex - Position of the current index within the visible range.
   */
  onBeforeChange?: (
    index: number,
    nextIndex: number,
    rangeIndex: number,
  ) => void;

  /**
   * Fired after a slide transition completes and the index has been updated.
   * @param index - The new active slide index.
   * @param rangeIndex - Position of the new index within the visible range.
   */
  onAfterChange?: (index: number, rangeIndex: number) => void;

  /**
   * Fired when the user begins dragging a slide.
   * @param index - The slide index being dragged.
   */
  onDragStart?: (index: number) => void;

  /**
   * Fired when the user releases a drag gesture.
   * @param index - The slide index at the time of release.
   */
  onDragEnd?: (index: number) => void;

  /**
   * Fired when a drag gesture is canceled (snap-back to the original slide).
   * @param index - The slide index that remains active.
   */
  onDragCanceled?: (index: number) => void;

  /**
   * Fired on a single tap (no drag, no long press).
   * Delayed by the double-tap window to distinguish from double-taps.
   */
  onTap?: (event: GestureCommonEvent) => void;

  /** Fired when two taps occur within the double-tap time window. */
  onDoubleTap?: (event: GestureCommonEvent) => void;

  /** Fired when a long press is detected. */
  onLongPress?: (event: GestureCommonEvent) => void;

  /** Fired when the pointer is released after a long press. */
  onLongPressEnd?: (event: GestureEvent) => void;

  /**
   * Fired when a navigation key is pressed (arrow keys). When provided,
   * replaces the default prev/next slide behavior — the consumer is
   * responsible for calling `prev()`/`next()` or custom navigation.
   *
   * @param increment - Direction: `-1` for prev, `1` for next.
   */
  onNavKeyPress?: (increment: -1 | 1) => void;
}

/**
 * Reactive state exposed by a {@link SliderController}. All properties are
 * signals that can be observed for changes.
 */
export interface SliderState {
  /** The currently active slide index. */
  index: Signal<number>;

  /** The current translation value along the primary axis (animated). */
  axisValue: Signal<AnimatedValue>;

  /** Computed array of slide indices currently rendered in the DOM. */
  indexes: ComputedSignal<number[]>;
}

/**
 * Central controller for a one-item slider. Manages navigation state,
 * animated transitions, and coordinates gesture/keyboard/wheel input.
 * Created via {@link createSliderController}.
 */
export interface SliderController {
  /** Reactive slider state (index, axisValue, indexes). */
  readonly state: SliderState;

  /** Current resolved configuration. */
  readonly config: SliderConfig;

  /**
   * Returns the position of the active index within the visible range array.
   * @returns Zero-based position in `state.indexes`.
   */
  getRangeIndex(): number;

  /**
   * Animates to the next slide. No-op if already at the last slide
   * (unless loop is enabled) or if an animation is in progress.
   */
  next(): Promise<void>;

  /**
   * Animates to the previous slide. No-op if already at the first slide
   * (unless loop is enabled) or if an animation is in progress.
   */
  prev(): Promise<void>;

  /**
   * Navigates to a specific slide index.
   *
   * @param index - Target slide index (clamped to valid range).
   * @param animate - When `true`, animates the transition. Default: `false`.
   */
  goTo(index: number, animate?: boolean): Promise<void>;

  /**
   * Recalculates the axis value for the current range index. Useful after
   * a resize or layout change.
   *
   * @param duration - Optional transition duration in ms. Default: `0`.
   */
  adjust(duration?: number): void;

  /**
   * Updates the primary dimension size (width for horizontal, height for
   * vertical sliders) used for position calculations.
   *
   * @param size - The new primary dimension in pixels.
   */
  setPrimarySize(size: number): void;

  /**
   * Merges new configuration into the current config. Automatically
   * updates sub-controllers (e.g. gesture axis) as needed.
   *
   * @param config - Partial configuration to merge.
   */
  updateConfig(config: Partial<SliderConfig>): void;

  /**
   * Replaces event handlers. Existing handlers not included in the
   * update are preserved.
   *
   * @param events - Partial event handlers to merge.
   */
  updateEvents(events: Partial<SliderEvents>): void;

  /** Starts observing gesture, keyboard, and wheel input. */
  observe(): void;

  /** Stops observing gesture, keyboard, and wheel input. */
  unobserve(): void;

  /**
   * Attaches the controller to a DOM element for gesture detection.
   *
   * @param element - The container element for touch/mouse events.
   */
  attach(element: HTMLElement): void;

  /** Detaches DOM listeners (gestures, keyboard, wheel). Safe for re-attach via observe(). */
  detach(): void;

  /** Disposes all resources permanently: detaches controllers and cleans up signal observers. */
  dispose(): void;
}

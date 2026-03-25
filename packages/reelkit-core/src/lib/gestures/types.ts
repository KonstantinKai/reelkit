/** An [x, y] coordinate pair in pixels. */
export type Offset = [x: number, y: number];

/** The input source that initiated a gesture. */
export type EventKind = 'touch' | 'mouse';

/** The dominant axis of a drag gesture, or `null` if undetermined. */
export type DragAxis = 'horizontal' | 'vertical' | null;

/** Base gesture event with position and timing information. */
export interface GestureEvent {
  /** Pointer position relative to the viewport. */
  globalPosition: Offset;

  /** Pointer position relative to the attached element. */
  localPosition: Offset;

  /** Timestamp (ms) when the event occurred. */
  sourceTimestamp: number;
}

/** Gesture event that includes the input source type. */
export interface GestureCommonEvent extends GestureEvent {
  /** Whether the gesture originated from touch or mouse. */
  kind: EventKind;
}

/** Fired on each pointer move during an axis-locked drag. */
export interface GestureAxisDragUpdateEvent extends GestureEvent {
  /** Movement since the previous update event. */
  delta: Offset;

  /** Cumulative distance from the drag origin. */
  distance: Offset;

  /** Delta along the dominant axis only. */
  primaryDelta: number;

  /** Cumulative distance along the dominant axis only. */
  primaryDistance: number;

  /** Cancels the current drag gesture (triggers snap-back). */
  cancel: () => void;
}

/** Fired when an axis-locked drag gesture ends, including velocity data. */
export interface GestureAxisDragEndEvent
  extends Omit<GestureAxisDragUpdateEvent, 'cancel'> {
  /** End-of-drag velocity in pixels/second for each axis. */
  velocity: Offset;

  /** Velocity along the dominant drag axis in pixels/second. */
  primaryVelocity: number;
}

/**
 * Simplified drag-end event without axis-specific primary values.
 * Useful for handlers that don't need to know the dominant axis.
 */
export interface GestureDragEndEvent
  extends Omit<
    GestureAxisDragEndEvent,
    'primaryDelta' | 'primaryDistance' | 'primaryVelocity'
  > {}

/** Configuration for a {@link GestureController}. */
export interface GestureControllerConfig {
  /**
   * When `true`, only touch events are listened for (mouse events ignored).
   * @default false
   */
  useTouchEventsOnly?: boolean;

  /**
   * Duration in milliseconds the pointer must remain stationary to
   * trigger a long-press callback.
   * @default 800
   */
  longPressDurationMs?: number;

  /**
   * Time window in milliseconds within which two consecutive taps
   * are treated as a double-tap.
   * @default 300
   */
  doubleTapWindowMs?: number;
}

/**
 * Axis-aware gesture event callbacks. The controller determines the
 * dominant axis from the initial drag delta and routes subsequent events
 * to the matching horizontal or vertical handlers.
 */
export interface GestureControllerEvents {
  /** Fired when a long press is detected. */
  onLongPress?: (event: GestureCommonEvent) => void;

  /** Fired when the pointer is released after a long press. */
  onLongPressEnd?: (event: GestureEvent) => void;

  /** Fired on pointer down. */
  onTapDown?: (event: GestureCommonEvent) => void;

  /** Fired on pointer up. */
  onTapUp?: (event: GestureCommonEvent) => void;

  /**
   * Fired on a single tap (pointer up with no drag and no long press).
   * Delayed by {@link GestureControllerConfig.doubleTapWindowMs} to
   * distinguish from double-taps.
   */
  onTap?: (event: GestureCommonEvent) => void;

  /**
   * Fired when two taps occur within
   * {@link GestureControllerConfig.doubleTapWindowMs}.
   */
  onDoubleTap?: (event: GestureCommonEvent) => void;

  /** Fired when a horizontal drag begins. */
  onHorizontalDragStart?: (event: GestureCommonEvent) => void;

  /** Fired on each pointer move during a horizontal drag. */
  onHorizontalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;

  /** Fired when a horizontal drag ends. */
  onHorizontalDragEnd?: (event: GestureAxisDragEndEvent) => void;

  /** Fired when a vertical drag begins. */
  onVerticalDragStart?: (event: GestureCommonEvent) => void;

  /** Fired on each pointer move during a vertical drag. */
  onVerticalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;

  /** Fired when a vertical drag ends. */
  onVerticalDragEnd?: (event: GestureAxisDragEndEvent) => void;

  /** Fired on any drag end, regardless of axis. */
  onDragEnd?: (event: GestureDragEndEvent) => void;
}

/**
 * Touch and mouse gesture detector. Tracks drag interactions along
 * horizontal and vertical axes. Created via {@link createGestureController}.
 */
export interface GestureController {
  /**
   * Binds the controller to a DOM element for gesture detection.
   * @param element - The target element to listen on.
   */
  attach(element: HTMLElement): void;

  /** Removes all event listeners and unbinds the element. */
  detach(): void;

  /** Starts listening for touch/mouse events on the attached element. */
  observe(): void;

  /** Stops listening for touch/mouse events (preserves the attachment). */
  unobserve(): void;

  /**
   * Merges new event handlers into the current set.
   * @param events - Partial event handlers to merge.
   */
  updateEvents(events: Partial<GestureControllerEvents>): void;
}

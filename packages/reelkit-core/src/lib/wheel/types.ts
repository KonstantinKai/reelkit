/**
 * Logical scroll direction derived from a wheel event's delta values.
 * `'up'` / `'down'` for vertical, `'left'` / `'right'` for horizontal.
 */
export type WheelDirection = 'up' | 'down' | 'left' | 'right';

/** Configuration for a {@link WheelController}. */
export interface WheelControllerConfig {
  /**
   * Debounce duration in milliseconds. Rapid wheel events within this
   * window are collapsed into a single navigation action.
   * @default 200
   */
  debounceMs?: number;
  /**
   * Minimum absolute delta (in pixels) required before a wheel event
   * triggers navigation. Filters out accidental micro-scrolls.
   * @default 10
   */
  deltaThreshold?: number;
}

/** Callbacks fired by the wheel controller on debounced scroll gestures. */
export interface WheelControllerEvents {
  /**
   * Fired when a wheel gesture exceeds the delta threshold after debouncing.
   *
   * @param direction - The resolved scroll direction.
   * @param event - The underlying DOM wheel event.
   */
  onWheel: (direction: WheelDirection, event: WheelEvent) => void;
}

/**
 * Mouse wheel navigation controller that translates scroll events into
 * debounced directional callbacks. Created via {@link createWheelController}.
 */
export interface WheelController {
  /**
   * Starts listening for `wheel` events on the given target.
   * @param target - The event target. Defaults to `window`.
   */
  attach(target?: Window | HTMLElement): void;
  /** Removes the `wheel` listener, clears pending debounce, and detaches. */
  detach(): void;
}

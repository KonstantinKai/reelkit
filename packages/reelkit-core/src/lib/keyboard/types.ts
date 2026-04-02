/**
 * Navigation key identifiers mapped from physical arrow keys.
 * Used by the keyboard controller to abstract away raw key codes.
 */
export type NavKey = 'up' | 'right' | 'down' | 'left';

/** Configuration for a {@link KeyboardController}. */
export interface KeyboardControllerConfig {
  /**
   * Restrict which navigation keys the controller responds to.
   * When omitted or empty, all {@link NavKey} values are accepted.
   * @default []
   */
  filter?: NavKey[];

  /**
   * Minimum interval in milliseconds between consecutive key-press
   * callbacks. Prevents rapid-fire navigation from held-down keys.
   * Set to `0` to disable throttling.
   * @default 0
   */
  throttleMs?: number;
}

/** Callbacks fired by the keyboard controller on recognized key presses. */
export interface KeyboardControllerEvents {
  /**
   * Fired when a navigation key is pressed (subject to filtering and throttling).
   *
   * @param key - The logical navigation key.
   * @param event - The underlying DOM keyboard event.
   */
  onKeyPress: (key: NavKey, event: KeyboardEvent) => void;
}

/**
 * Keyboard navigation controller that listens for arrow keys.
 * Created via {@link createKeyboardController}.
 */
export interface KeyboardController {
  /**
   * Starts listening for `keydown` events on the given target.
   * @param target - The event target. Defaults to `window`.
   */
  attach(target?: Window | HTMLElement): void;

  /** Removes the `keydown` listener and detaches from the target. */
  detach(): void;
}

/**
 * Imperative API exposed by the `rk-reel` component via the `apiReady` output.
 * Provides programmatic control over slider navigation and lifecycle.
 */
export interface ReelApi {
  next: () => void;

  prev: () => void;

  /**
   * Navigate to a specific slide index.
   * @param index   - Target slide index.
   * @param animate - When `true`, animates the transition.
   */
  goTo: (index: number, animate?: boolean) => Promise<void>;

  /** Recalculate positions (useful after resize or layout change). */
  adjust: () => void;

  /** Start listening to gesture, keyboard, and wheel events. */
  observe: () => void;

  /** Stop listening to gesture, keyboard, and wheel events. */
  unobserve: () => void;
}

/**
 * Creates a `keyExtractor` function suitable for `loop` mode when `count` is
 * small (especially 2). In loop mode the same absolute index can appear more
 * than once in the visible range (e.g. `[1, 0, 1]` for `count=2`). Angular's
 * `@for` tracker requires unique keys; passing a plain index causes an
 * `NG0955` duplicate-track-key error. This factory appends a `_cloned` suffix
 * to the first occurrence of a repeated index so every key is unique.
 *
 * @param count     - Total number of slides (the same value passed to `[count]`).
 * @param keyPrefix - Optional prefix prepended to every generated key.
 * @returns A `keyExtractor` compatible with the `rk-reel` `[keyExtractor]` input.
 *
 * @example
 * ```html
 * <!-- In a template where items.length is small and loop is true: -->
 * <rk-reel
 *   [count]="items.length"
 *   [loop]="true"
 *   [keyExtractor]="loopKeyExtractor"
 * >
 * ```
 * ```ts
 * loopKeyExtractor = createDefaultKeyExtractorForLoop(this.items.length);
 * ```
 */
export const createDefaultKeyExtractorForLoop =
  (
    count: number,
    keyPrefix?: string,
  ): ((index: number, indexInRange: number) => string | number) =>
  (index: number, indexInRange: number): string => {
    const key = `${keyPrefix ?? ''}${index}`;

    /**
     * When count === 2 both 0 and 1 appear twice in the visible range.
     * The *first* position (indexInRange === 0) gets the `_cloned` suffix so
     * its key differs from the canonical occurrence later in the range.
     */
    if (count === 2 && (index === 0 || index === 1) && indexInRange === 0) {
      return `${key}_cloned`;
    }

    return key;
  };

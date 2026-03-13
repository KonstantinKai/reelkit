/** A cleanup function that releases a single resource or subscription. */
export type Disposer = () => void;

/**
 * A collection of {@link Disposer} functions that can be disposed
 * together in a single call. Useful for batching event listener
 * teardowns and subscription cleanups.
 */
export interface DisposableList {
  /**
   * Adds one or more disposer functions to the list.
   * @param disposers - Cleanup functions to register.
   */
  push: (...disposers: Disposer[]) => void;

  /** Calls all registered disposers and clears the list. */
  dispose: () => void;
}

/**
 * Creates a {@link DisposableList} for batching cleanup operations.
 * Calling `dispose()` invokes every registered disposer and empties the list.
 *
 * @returns A new empty disposable list.
 */
export const createDisposableList = (): DisposableList => {
  const disposers: Disposer[] = [];
  return {
    push: (...values) => disposers.push(...values),
    dispose: () => {
      disposers.forEach((dispose) => dispose());
      disposers.splice(0, disposers.length);
    },
  };
};

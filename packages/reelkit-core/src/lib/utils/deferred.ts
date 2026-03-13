/**
 * A deferred promise whose `resolve` function is exposed externally.
 * Useful for bridging callback-based APIs with async/await code.
 *
 * @typeParam T - The type the promise resolves to.
 */
export interface Deferred<T = void> {
  /** The promise that will be resolved externally. */
  promise: Promise<T>;

  /** Resolves the deferred promise with the given value. */
  resolve: (value?: T) => void;
}

/**
 * Creates a {@link Deferred} — a promise paired with an externally
 * accessible `resolve` function.
 *
 * @typeParam T - The type the promise resolves to. Defaults to `void`.
 * @returns A new deferred with `promise` and `resolve` properties.
 *
 * @example
 * ```ts
 * const deferred = createDeferred<void>();
 * setTimeout(() => deferred.resolve(), 1000);
 * await deferred.promise; // resolves after 1 second
 * ```
 */
export const createDeferred = <T = void>(): Deferred<T> => {
  let resolve!: (value?: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res as (value?: T) => void;
  });
  return { promise, resolve };
};

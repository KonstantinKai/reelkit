/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A function enhanced with a {@link cancel} method that clears the
 * pending timeout scheduled by {@link timeout}.
 *
 * @typeParam F - The original callback signature.
 */
export type TimeoutFn<F extends (...args: any[]) => any> = F & {
  cancel: () => void;
};

/**
 * Wraps a callback in a timeout with cancel capability.
 * @param callback - Function to call after timeout
 * @param timeoutMs - Delay in milliseconds (default: 0)
 */
export const timeout = <F extends (...args: any[]) => any>(
  callback: F,
  timeoutMs = 0,
): TimeoutFn<F> => {
  let id = -1;

  const cancel = (): void => {
    if (id === -1) return;
    clearTimeout(id);
    id = -1;
  };

  const enhanced = (...args: Parameters<F>): void => {
    id = setTimeout(() => callback(...args), timeoutMs) as unknown as number;
  };

  enhanced.cancel = cancel;

  return enhanced as TimeoutFn<F>;
};

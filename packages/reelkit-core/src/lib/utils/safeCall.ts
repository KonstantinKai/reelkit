/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Safely calls a function, ignoring any errors that occur.
 * Useful for calling optional callbacks where errors should not propagate.
 */
export const safeCall = <F extends (...args: any[]) => any>(
  fn: F | undefined,
  ...args: Parameters<F>
): void => {
  try {
    fn?.(...args);
  } catch {
    // Ignore errors in callbacks
  }
};

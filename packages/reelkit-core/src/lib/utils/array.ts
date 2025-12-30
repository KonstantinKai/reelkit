/**
 * Returns the first element of an array
 */
export const first = <T>(arr: readonly T[]): T => arr[0];

/**
 * Returns the last element of an array
 */
export const last = <T>(arr: readonly T[]): T => arr[arr.length - 1];

/**
 * Checks if an array is empty
 */
export const isEmpty = <T>(arr: readonly T[]): boolean => arr.length === 0;

/**
 * Generates an array with n length created with generator function
 *
 * @example
 * generate(4, (i) => i); // [0, 1, 2, 3]
 */
export const generate = <G>(count: number, generator: (i: number) => G): G[] => {
  return Array.from({ length: count }, (_, i) => generator(i));
};

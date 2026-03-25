/**
 * Returns `true` if the user has requested reduced motion in their OS
 * accessibility settings.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

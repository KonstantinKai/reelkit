import { InjectionToken, type Signal } from '@angular/core';

/**
 * Shape of the reactive context value shared by a `rk-reel` host
 * with its descendant `rk-reel-indicator` components.
 */
export interface ReelContextValue {
  index: Signal<number>;

  count: Signal<number>;

  /**
   * Programmatically navigate to a slide.
   * @param index   - Target slide index.
   * @param animate - When `true`, animate the transition.
   */
  goTo: (index: number, animate?: boolean) => Promise<void>;
}

export const RK_REEL_CONTEXT = new InjectionToken<ReelContextValue>(
  'RK_REEL_CONTEXT',
);

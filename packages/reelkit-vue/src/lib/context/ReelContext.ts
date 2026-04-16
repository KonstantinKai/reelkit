import { inject, type InjectionKey } from 'vue';
import type { Signal } from '@reelkit/core';

export interface ReelContextValue {
  /** The active slide index signal. */
  index: Signal<number>;

  /** The total slide count signal. */
  count: Signal<number>;

  /** Navigate to a specific slide. */
  goTo: (index: number, animate?: boolean) => Promise<void>;
}

export const RK_REEL_KEY: InjectionKey<ReelContextValue> =
  Symbol('RK_REEL_KEY');

/**
 * Returns the {@link ReelContextValue} from the nearest parent {@link Reel},
 * or `null` if called outside a Reel.
 */
export const useReelContext = (): ReelContextValue | null =>
  inject(RK_REEL_KEY, null);

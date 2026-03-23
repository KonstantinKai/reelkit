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

export const useReelContext = (): ReelContextValue | null =>
  inject(RK_REEL_KEY, null);

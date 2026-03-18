import { createContext, useContext } from 'react';
import type { Signal } from '@reelkit/core';

/**
 * Values exposed by a parent {@link Reel} component to its children
 * via React context. Use {@link useReelContext} to access.
 */
export interface ReelContextValue {
  /** The active slide index signal. */
  index: Signal<number>;

  /** The total slide count signal. */
  count: Signal<number>;

  /** Navigate to a specific slide. */
  goTo: (index: number, animate?: boolean) => Promise<void>;
}

/** @internal */
export const ReelContext = createContext<ReelContextValue | null>(null);

/**
 * Returns the {@link ReelContextValue} from the nearest parent
 * {@link Reel}, or `null` if none exists.
 */
export const useReelContext = (): ReelContextValue | null =>
  useContext(ReelContext);

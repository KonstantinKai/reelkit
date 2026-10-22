import { createContext, useContext } from 'react';
import type { Signal } from '@reelkit/core';

/**
 * Values exposed by a parent `Reel` component to its children
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

/**
 * The React context a `Reel` provides to its children. Read it through
 * {@link useReelContext}; reach for the context object itself only to
 * provide a value of your own, for example in a test or a custom wrapper.
 */
export const ReelContext = createContext<ReelContextValue | null>(null);

/**
 * Returns the {@link ReelContextValue} from the nearest parent
 * `Reel`, or `null` if none exists.
 */
export const useReelContext = (): ReelContextValue | null =>
  useContext(ReelContext);

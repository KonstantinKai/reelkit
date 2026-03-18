/**
 * @module @reelkit/react
 *
 * React bindings for the ReelKit slider library.
 *
 * The main component is {@link Reel} — a virtualized, gesture-driven
 * slider that renders only the visible slides to the DOM. It wraps
 * `@reelkit/core`'s {@link createSliderController} and bridges its
 * signal-based state into React via {@link Observe}.
 *
 * Also provides {@link ReelIndicator} (dot/bar pagination) and the
 * {@link useBodyLock} hook for scroll-locking overlays.
 *
 * Core utilities (signals, math helpers, etc.) are re-exported for
 * convenience so consumers don't need a direct `@reelkit/core`
 * dependency.
 */

// Re-export from core
export {
  createSignal,
  createComputed,
  reaction,
  createDeferred,
  first,
  last,
  isEmpty,
  generate,
  abs,
  isNegative,
  clamp,
  lerp,
  extractRange,
  observeDomEvent,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
  type Deferred,
} from '@reelkit/core';

// Main components
export {
  Reel,
  defaultRangeExtractor,
  createDefaultKeyExtractorForLoop,
  type ReelProps,
  type ReelApi,
} from './lib/Reel';

export { ReelIndicator, type ReelIndicatorProps } from './lib/ReelIndicator';

export { Observe, AnimatedObserve, type AnimatedValue } from './lib/Observe';

// Context
export {
  ReelContext,
  useReelContext,
  type ReelContextValue,
} from './lib/ReelContext';

// Hooks
export { useBodyLock } from './lib/useBodyLock';

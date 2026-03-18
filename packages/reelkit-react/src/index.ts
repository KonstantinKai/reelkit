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
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { Reel, ReelIndicator } from '@reelkit/react';
 *
 * function App() {
 *   return (
 *     <Reel
 *       count={100}
 *       style={{ width: '100%', height: '100dvh' }}
 *       direction="vertical"
 *       enableWheel
 *       itemBuilder={(index, _inRange, size) => (
 *         <div style={{ width: size[0], height: size[1] }}>
 *           Slide {index + 1}
 *         </div>
 *       )}
 *     >
 *       <ReelIndicator />
 *     </Reel>
 *   );
 * }
 * ```
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
  noop,
  captureFrame,
  createSharedVideo,
  createGestureController,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
  type Deferred,
  type SharedVideoConfig,
  type SharedVideoInstance,
  type GestureController,
  type GestureControllerEvents,
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

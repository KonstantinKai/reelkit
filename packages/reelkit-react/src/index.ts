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

export {
  ReelIndicator,
  type ReelIndicatorProps,
} from './lib/ReelIndicator';

export {
  ValueNotifierObserver,
  AnimatedValueNotifierObserver,
  type AnimatedValue,
} from './lib/ValueNotifierObserver';

// Hooks
export { useBodyLock } from './lib/useBodyLock';


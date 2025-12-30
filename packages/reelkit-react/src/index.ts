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
} from './lib/components/Reel';

export {
  ReelIndicator,
  type ReelIndicatorProps,
} from './lib/components/ReelIndicator';

export {
  ValueNotifierObserver,
  AnimatedValueNotifierObserver,
  type AnimatedValue,
} from './lib/components/ValueNotifierObserver';

// Hooks
export {
  default as useGestures,
  type UseGesturesProps,
  type UseGesturesResult,
} from './lib/hooks/useGestures';

export { default as useNavKeyboardKeys, type NavKey } from './lib/hooks/useNavKeyboardKeys';
export { default as useRafState } from './lib/hooks/useRafState';
export { default as useMountedRef } from './lib/hooks/useMountedRef';
export { default as useEffectOnce } from './lib/hooks/useEffectOnce';
export { default as useDepsDidChangeEffect } from './lib/hooks/useDepsDidChangeEffect';

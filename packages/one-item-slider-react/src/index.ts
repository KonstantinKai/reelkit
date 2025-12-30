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
} from '@kdevsoft/one-item-slider-core';

// Main components
export {
  OneItemSlider,
  defaultRangeExtractor,
  createDefaultKeyExtractorForLoop,
  type OneItemSliderProps,
  type OneItemSliderPublicApi,
} from './lib/components/OneItemSlider';

export {
  OneItemSliderIndicator,
  type OneItemSliderIndicatorProps,
} from './lib/components/OneItemSliderIndicator';

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

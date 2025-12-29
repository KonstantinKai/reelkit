// Main components
export {
  OneItemSlider,
  defaultRangeExtractor,
  createDefaultKeyExtractorForLoop,
  type OneItemSliderProps,
  type OneItemSliderPublicApi,
} from './lib/OneItemSlider';

export {
  OneItemSliderIndicator,
  type OneItemSliderIndicatorProps,
} from './lib/OneItemSliderIndicator';

// Foundation utilities
export {
  Listenable,
  type ListenableListener,
} from './lib/foundation/Listenable';

export {
  ValueNotifier,
  ComputedValueNotifier,
  makeValueNotifier,
  makeComputedValueNotifier,
  notifiersReaction,
} from './lib/foundation/ValueNotifier';

export { Completer, CompleterCancelException } from './lib/foundation/Completer';
export { FnExtender } from './lib/foundation/FnExtender';

// Components
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
  type GestureCommonEvent,
  type GestureAxisDragUpdateEvent,
  type GestureAxisDragEndEvent,
  type GestureDragEndEvent,
} from './lib/hooks/useGestures';

export { default as useNavKeyboardKeys, type UseNavKeyboardKey } from './lib/hooks/useNavKeyboardKeys';
export { default as useRafState } from './lib/hooks/useRafState';
export { default as useMountedRef } from './lib/hooks/useMountedRef';
export { default as useEffectOnce } from './lib/hooks/useEffectOnce';
export { default as useDepsDidChangeEffect } from './lib/hooks/useDepsDidChangeEffect';

// Utils
export { first, last, isEmpty, generate } from './lib/utils/array';
export { abs, isNegative, clamp, lerp, extractRange } from './lib/utils/number';
export { observeDomEvent } from './lib/utils/observeDomEvent';

// Components
export {
  Reel,
  type ReelSlotProps,
  type ReelExpose,
  ReelIndicator,
} from './lib/components';

// Composables
export {
  useSlider,
  type UseSliderOptions,
  type UseSliderReturn,
  useGestures,
  type UseGesturesOptions,
  useKeyboardNav,
  type UseKeyboardNavOptions,
} from './lib/composables';

// Re-export core types
export type {
  SliderDirection,
  SliderConfig,
  RangeExtractor,
  NavKey,
  GestureControllerConfig,
  GestureControllerEvents,
} from '@reelkit/core';

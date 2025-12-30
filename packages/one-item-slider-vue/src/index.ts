// Components
export {
  OneItemSlider,
  type OneItemSliderSlotProps,
  type OneItemSliderExpose,
  OneItemSliderIndicator,
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
} from '@kdevsoft/one-item-slider-core';

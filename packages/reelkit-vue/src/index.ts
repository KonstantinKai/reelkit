// Re-export from core
export {
  createSignal,
  createComputed,
  reaction,
  createDeferred,
  first,
  last,
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

// Components
export { Reel, type ReelExpose } from './lib/components';
export { ReelIndicator } from './lib/components';

// Context
export {
  RK_REEL_KEY,
  useReelContext,
  type ReelContextValue,
} from './lib/context';

// Composables
export {
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
  AnimatedValue,
} from '@reelkit/core';

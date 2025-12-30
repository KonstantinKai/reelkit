// Core primitives
export {
  createSignal,
  createComputed,
  reaction,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
} from './lib/core/signal';

export { createDeferred, type Deferred } from './lib/core/deferred';

export {
  createDisposableList,
  type DisposableList,
  type Disposer,
} from './lib/core/disposable';

export { timeout, type TimeoutFn } from './lib/core/timeout';

// Utils
export { first, last, isEmpty, generate } from './lib/utils/array';
export { abs, isNegative, clamp, lerp, extractRange } from './lib/utils/number';
export { observeDomEvent } from './lib/utils/observeDomEvent';

// Gestures
export { createGestureController } from './lib/gestures/GestureController';
export type {
  Offset,
  EventKind,
  DragAxis,
  GestureEvent,
  GestureCommonEvent,
  GestureAxisDragUpdateEvent,
  GestureAxisDragEndEvent,
  GestureDragEndEvent,
  GestureControllerConfig,
  GestureControllerEvents,
  GestureController,
} from './lib/gestures/types';

// Keyboard
export { createKeyboardController } from './lib/keyboard/KeyboardController';
export type {
  NavKey,
  KeyboardControllerConfig,
  KeyboardControllerEvents,
  KeyboardController,
} from './lib/keyboard/types';

// Slider
export { createSliderController, defaultRangeExtractor } from './lib/slider/SliderController';
export { animate, type AnimationOptions } from './lib/slider/animate';
export type {
  AnimatedValue,
  RangeExtractor,
  SliderConfig,
  SliderEvents,
  SliderState,
  SliderController,
  SliderDirection,
} from './lib/slider/types';

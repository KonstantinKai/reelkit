/**
 * @module @reelkit/core
 *
 * Framework-agnostic core of the ReelKit slider library. Zero runtime
 * dependencies.
 *
 * Provides the slider engine ({@link createSliderController}), input
 * controllers ({@link createGestureController},
 * {@link createKeyboardController}, {@link createWheelController}),
 * and a lightweight reactive system ({@link createSignal},
 * {@link createComputed}, {@link reaction}).
 *
 * All public APIs follow a **factory-function** pattern — no classes.
 * Each factory returns a plain object with methods and signal-based
 * state, making it easy to integrate with any UI framework.
 */

// Utils
export {
  // Array
  first,
  last,
  generate,
  // Number
  abs,
  isNegative,
  clamp,
  lerp,
  extractRange,
  // DOM
  observeDomEvent,
  // Signals
  createSignal,
  createComputed,
  reaction,
  batch,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
  // Deferred
  createDeferred,
  type Deferred,
  // Disposable
  createDisposableList,
  type DisposableList,
  type Disposer,
  // Timeout
  timeout,
  type TimeoutFn,
  // Noop
  noop,
  // Video
  captureFrame,
  createSharedVideo,
  type SharedVideoConfig,
  type SharedVideoInstance,
  // Media Loading
  observeMediaLoading,
  type MediaLoadingCallbacks,
  // Sound
  createSoundController,
  syncMutedToVideo,
  type SoundController,
  // Content Loading
  createContentLoadingController,
  type ContentLoadingController,
  // LRU Cache
  createLruCache,
  type LruCache,
  // Content Preloader
  createContentPreloader,
  type ContentPreloader,
  type ContentPreloaderConfig,
} from './lib/utils';

// Gestures
export { createGestureController } from './lib/gestures/gestureController';
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
export { createKeyboardController } from './lib/keyboard/keyboardController';
export type {
  NavKey,
  KeyboardControllerConfig,
  KeyboardControllerEvents,
  KeyboardController,
} from './lib/keyboard/types';

// Wheel
export { createWheelController } from './lib/wheel/wheelController';
export type {
  WheelDirection,
  WheelControllerConfig,
  WheelControllerEvents,
  WheelController,
} from './lib/wheel/types';

// Slider
export {
  createSliderController,
  defaultRangeExtractor,
} from './lib/slider/sliderController';
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

// Transitions
export {
  getSlideProgress,
  slideTransition,
  flipTransition,
  cubeTransition,
  fadeTransition,
  zoomTransition,
} from './lib/slider/transitions';
export type {
  SlideTransformStyle,
  TransitionTransformFn,
} from './lib/slider/transitions';

// Fullscreen
export {
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
} from './lib/utils';

// Body lock
export { createBodyLock, sharedBodyLock, type BodyLock } from './lib/utils';

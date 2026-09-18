/**
 * @module @reelkit/core
 *
 * Framework-agnostic core of the ReelKit slider library. Zero runtime
 * dependencies.
 *
 * Provides the slider engine ({@link createSliderController}), input
 * controllers ({@link createGestureController},
 * {@link createKeyboardController}, {@link createWheelController}),
 * URL-state syncing for deep-linkable overlays
 * ({@link createUrlStateController}), and a lightweight reactive system
 * ({@link createSignal}, {@link createComputed}, {@link reaction}).
 *
 * All public APIs follow a **factory-function** pattern: no classes.
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
  // LRU Cache
  createLruCache,
  type LruCache,
} from './lib/utils';

// Signals
export {
  createSignal,
  createComputed,
  reaction,
  batch,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
} from './lib/signal';

// URL state
export {
  createUrlStateController,
  createHistoryAdapter,
  indexCodec,
  createIndexLocator,
  urlIndexKey,
  urlIndexTwoAxisKey,
  createStableIdCodec,
  base64UrlCodec,
  createStableIdLocator,
  urlStableIdKey,
  urlStableIdTwoAxisKey,
  type UrlAdapter,
  type UrlChange,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type UrlStateOptions,
  type TwoAxisPosition,
  type TwoAxisIdentity,
  type UrlIndexTwoAxisKeyOptions,
  type Identified,
  type UrlStableIdKeyOptions,
  type UrlStableIdTwoAxisKeyOptions,
  type UrlStableIdTwoAxisIdInnerOptions,
} from './lib/url';

// Viewed state
export {
  createViewedStateController,
  twoAxisViewedTracking,
  createLocalStorageAdapter,
  createSessionStorageAdapter,
  createMemoryStorageAdapter,
  type ViewedStateController,
  type ViewedStateOptions,
  type StorageAdapter,
} from './lib/viewed';

// Media
export {
  // Video
  captureFrame,
  createSharedVideo,
  syncVideoObjectFit,
  type SharedVideoConfig,
  type SharedVideoInstance,
  // Media Loading
  observeMediaLoading,
  type MediaLoadingCallbacks,
  // Sound
  createSoundController,
  syncMutedToVideo,
  type SoundController,
  // Timeline
  createTimelineController,
  type TimelineController,
  type TimelineControllerConfig,
  type BufferedRange,
  // Content Loading
  createContentLoadingController,
  type ContentLoadingController,
  // Content Preloader
  createContentPreloader,
  type ContentPreloader,
  type ContentPreloaderConfig,
} from './lib/media';

// DOM
export { observeDomEvent } from './lib/dom';

// Gestures
export {
  createGestureController,
  type GestureController,
} from './lib/gestures/gestureController';
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
} from './lib/gestures/types';

// Keyboard
export {
  createKeyboardController,
  type KeyboardController,
} from './lib/keyboard/keyboardController';
export type {
  NavKey,
  KeyboardControllerConfig,
  KeyboardControllerEvents,
} from './lib/keyboard/types';

// Wheel
export {
  createWheelController,
  type WheelController,
} from './lib/wheel/wheelController';
export type {
  WheelDirection,
  WheelControllerConfig,
  WheelControllerEvents,
} from './lib/wheel/types';

// Slider
export {
  createSliderController,
  defaultRangeExtractor,
  type SliderController,
} from './lib/slider/sliderController';
export { animate, type AnimationOptions } from './lib/slider/animate';
export type {
  AnimatedValue,
  RangeExtractor,
  SliderConfig,
  SliderEvents,
  SliderState,
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
export { fullscreenSignal, requestFullscreen, exitFullscreen } from './lib/dom';

// Body lock
export { createBodyLock, sharedBodyLock, type BodyLock } from './lib/dom';

// Focus management
export {
  captureFocusForReturn,
  createFocusTrap,
  getFocusableElements,
} from './lib/dom';

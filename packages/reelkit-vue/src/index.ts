/**
 * @module @reelkit/vue
 *
 * Vue bindings for the ReelKit slider library.
 *
 * The main component is {@link Reel} — a virtualized, gesture-driven
 * slider that renders only the visible slides to the DOM. It wraps
 * `@reelkit/core`'s `createSliderController` and bridges its
 * signal-based state into Vue's reactivity system.
 *
 * Also provides {@link ReelIndicator} (dot/bar pagination) and
 * composables for body lock, fullscreen, and sound state.
 *
 * Core utilities (signals, math helpers, etc.) are re-exported for
 * convenience so consumers don't need a direct `@reelkit/core`
 * dependency.
 */

// Re-export from core
export {
  // Signals & reactivity
  createSignal,
  createComputed,
  reaction,
  batch,
  createDeferred,
  type Signal,
  type ComputedSignal,
  type Subscribable,
  type Listener,
  type Dispose,
  type Deferred,

  // Math & utilities
  first,
  last,
  generate,
  abs,
  isNegative,
  clamp,
  lerp,
  extractRange,
  noop,

  // Animation
  animate,
  type AnimatedValue,

  // DOM utilities
  observeDomEvent,
  createDisposableList,
  type DisposableList,
  captureFrame,
  createSharedVideo,
  type SharedVideoConfig,
  type SharedVideoInstance,

  // Controllers
  createGestureController,
  type GestureController,
  type GestureControllerEvents,
  type GestureCommonEvent,
  type GestureEvent,

  // Transitions (tree-shakeable)
  slideTransition,
  flipTransition,
  cubeTransition,
  fadeTransition,
  zoomTransition,
  getSlideProgress,
  type TransitionTransformFn,
  type SlideTransformStyle,

  // Fullscreen
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,

  // Body lock
  createBodyLock,
  sharedBodyLock,
  type BodyLock,

  // Sound
  createSoundController,
  syncMutedToVideo,
  type SoundController,

  // Content loading & preloading
  observeMediaLoading,
  type MediaLoadingCallbacks,
  createContentLoadingController,
  type ContentLoadingController,
  createContentPreloader,
  type ContentPreloader,
  type ContentPreloaderConfig,
} from '@reelkit/core';

// Re-export core types
export type {
  SliderDirection,
  SliderConfig,
  RangeExtractor,
  NavKey,
} from '@reelkit/core';

// Components
export {
  Reel,
  createDefaultKeyExtractorForLoop,
  defaultRangeExtractor,
  type ReelExpose,
  type ReelProps,
} from './lib/components';
export { ReelIndicator, type ReelIndicatorProps } from './lib/components';
export {
  SwipeToClose,
  type SwipeToCloseDirection,
  type SwipeToCloseProps,
} from './lib/components';

// Context
export {
  RK_REEL_KEY,
  useReelContext,
  type ReelContextValue,
} from './lib/context';

// Composables
export {
  useBodyLock,
  useFullscreen,
  type UseFullscreenOptions,
  type UseFullscreenReturn,
  SoundProvider,
  RK_SOUND_KEY,
  useSoundState,
} from './lib/composables';

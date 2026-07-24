/**
 * @module @reelkit/vue
 *
 * Vue bindings for the ReelKit slider library.
 *
 * The main component is {@link Reel}: a virtualized, gesture-driven
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

export {
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
  first,
  last,
  generate,
  abs,
  isNegative,
  clamp,
  lerp,
  extractRange,
  noop,
  animate,
  type AnimatedValue,
  observeDomEvent,
  createDisposableList,
  type DisposableList,
  type Disposer,
  captureFrame,
  createLruCache,
  createSharedVideo,
  syncVideoObjectFit,
  type LruCache,
  type SharedVideoConfig,
  type SharedVideoInstance,
  createGestureController,
  type GestureController,
  type GestureControllerEvents,
  type GestureCommonEvent,
  type GestureEvent,
  slideTransition,
  flipTransition,
  cubeTransition,
  fadeTransition,
  zoomTransition,
  getSlideProgress,
  type TransitionTransformFn,
  type SlideTransformStyle,
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
  createBodyLock,
  sharedBodyLock,
  type BodyLock,
  captureFocusForReturn,
  createFocusTrap,
  getFocusableElements,
  createSoundController,
  syncMutedToVideo,
  type SoundController,
  createTimelineController,
  type TimelineController,
  type TimelineControllerConfig,
  type BufferedRange,
  observeMediaLoading,
  type MediaLoadingCallbacks,
  createContentLoadingController,
  type ContentLoadingController,
  createContentPreloader,
  type ContentPreloader,
  type ContentPreloaderConfig,
  createUrlStateController,
  createHistoryAdapter,
  indexCodec,
  createIndexLocator,
  indexKey,
} from '@reelkit/core';

export type {
  SliderDirection,
  SliderConfig,
  RangeExtractor,
  NavKey,
  UrlAdapter,
  UrlCodec,
  UrlLocator,
  UrlKey,
  UrlStateController,
  UrlStateOptions,
} from '@reelkit/core';

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

export {
  RK_REEL_KEY,
  useReelContext,
  type ReelContextValue,
} from './lib/context';

export {
  useBodyLock,
  useFullscreen,
  type UseFullscreenOptions,
  type UseFullscreenReturn,
  SoundProvider,
  RK_SOUND_KEY,
  useSoundState,
  toVueRef,
  useOverlayUrlState,
  type OverlayUrlStateOptions,
} from './lib/composables';

export { hasRenderedNodes } from './lib/utils/slots';

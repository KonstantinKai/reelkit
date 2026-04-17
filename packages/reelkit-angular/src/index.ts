export { ReelComponent } from './lib/reel/reel.component';
export { ReelIndicatorComponent } from './lib/reel-indicator/reel-indicator.component';

export {
  RkReelItemDirective,
  type RkReelItemContext,
} from './lib/reel/reel-item.directive';

export {
  type ReelApi,
  createDefaultKeyExtractorForLoop,
} from './lib/reel/reel.types';
export {
  type ReelContextValue,
  RK_REEL_CONTEXT,
} from './lib/context/reel-context';

export { BodyLockService } from './lib/body-lock/body-lock.service';

export { toAngularSignal } from './lib/signal-bridge/to-angular-signal';
export { animatedSignalBridge } from './lib/signal-bridge/animated-signal-bridge';

export {
  RkSwipeToCloseDirective,
  type SwipeToCloseDirection,
} from './lib/swipe-to-close/swipe-to-close.directive';

export {
  createSignal,
  createComputed,
  reaction,
  batch,
  first,
  last,
  abs,
  clamp,
  extractRange,
  captureFrame,
  createSharedVideo,
  createGestureController,
  createSliderController,
  animate,
  noop,
  defaultRangeExtractor,
  observeDomEvent,
  createDisposableList,
  createContentLoadingController,
  createContentPreloader,
  createSoundController,
  syncMutedToVideo,
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
  createBodyLock,
  sharedBodyLock,
  getSlideProgress,
  slideTransition,
  fadeTransition,
  flipTransition,
  cubeTransition,
  zoomTransition,
  type GestureController,
  type SliderController,
  type Signal as CoreSignal,
  type Subscribable,
  type AnimatedValue,
  type RangeExtractor,
  type SliderDirection,
  type Disposer,
  type DisposableList,
  type ContentLoadingController,
  type ContentPreloader,
  type ContentPreloaderConfig,
  type SoundController,
  type BodyLock,
  type TransitionTransformFn,
  type SlideTransformStyle,
} from '@reelkit/core';

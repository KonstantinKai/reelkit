// Components & directives
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  RkSwipeToCloseDirective,
} from '@reelkit/angular';

// Types
import type {
  ReelApi,
  ReelContextValue,
  RkReelItemContext,
  CoreSignal,
  Subscribable,
  AnimatedValue,
  RangeExtractor,
  SliderDirection,
  Disposer,
  DisposableList,
  GestureController,
  SliderController,
  ContentLoadingController,
  ContentPreloader,
  ContentPreloaderConfig,
  SoundController,
  BodyLock,
  TransitionTransformFn,
  SlideTransformStyle,
  SwipeToCloseDirection,
} from '@reelkit/angular';

// Context
import { RK_REEL_CONTEXT } from '@reelkit/angular';

// Services
import { BodyLockService } from '@reelkit/angular';

// Signal bridges
import { toAngularSignal, animatedSignalBridge } from '@reelkit/angular';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Slider & gestures
  createSliderController, createGestureController,
  defaultRangeExtractor, createDefaultKeyExtractorForLoop,

  // Video
  captureFrame, createSharedVideo,

  // Utilities
  animate, noop, clamp, abs, first, last, extractRange,
} from '@reelkit/angular';

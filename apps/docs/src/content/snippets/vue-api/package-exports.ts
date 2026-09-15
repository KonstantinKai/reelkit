// Components
import {
  Reel,
  ReelIndicator,
  SwipeToClose,
  SoundProvider,
} from '@reelkit/vue';

// Types
import type {
  ReelExpose,
  ReelContextValue,
  SwipeToCloseDirection,
  SwipeToCloseProps,
  UseFullscreenOptions,
  UseFullscreenReturn,
} from '@reelkit/vue';

// Context & composables
import {
  RK_REEL_KEY,
  useReelContext,
  RK_SOUND_KEY,
  useBodyLock,
  useFullscreen,
  useSoundState,
  toVueRef,
} from '@reelkit/vue';

// Utilities (re-exported from @reelkit/core)
import {
  createDefaultKeyExtractorForLoop,
  defaultRangeExtractor,
} from '@reelkit/vue';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch, createDeferred,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,
  observeMediaLoading,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Gestures
  createGestureController,

  // Video
  captureFrame, createSharedVideo,

  // Animation
  animate,

  // Utilities
  noop, clamp, abs, first, last, extractRange,
  lerp, isNegative, generate,
} from '@reelkit/vue';

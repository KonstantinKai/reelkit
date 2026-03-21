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
  createSignal,
  createComputed,
  reaction,
  batch,
  first,
  last,
  clamp,
  extractRange,
  captureFrame,
  createSharedVideo,
  createGestureController,
  defaultRangeExtractor,
  type Signal as CoreSignal,
  type Subscribable,
  type AnimatedValue,
  type RangeExtractor,
  type SliderDirection,
} from '@reelkit/core';

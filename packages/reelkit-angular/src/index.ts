/**
 * @module @reelkit/angular
 *
 * Angular bindings for reelkit.
 *
 * {@link ReelComponent} is the slider itself — a virtualized, gesture-driven
 * carousel that renders only the slides around the active one. Everything else
 * here supports it: {@link ReelIndicatorComponent} for dots,
 * {@link RkReelItemDirective} for slide templates, {@link BodyLockService} and
 * {@link RkSwipeToCloseDirective} for overlay behaviour.
 *
 * Core is framework-agnostic and exposes its own reactive primitives, so
 * {@link toAngularSignal} bridges a core `Signal` into an Angular one. Read a
 * core signal in a template through that bridge — a direct `.value` read is a
 * one-time snapshot and never updates.
 *
 * The core API is re-exported here, so a consumer never imports
 * `@reelkit/core` directly.
 *
 * @example Slider with an indicator
 * ```ts
 * @Component({
 *   imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
 *   template: `
 *     <rk-reel
 *       [count]="photos.length"
 *       [size]="[360, 640]"
 *       (afterChange)="active.set($event.index)"
 *     >
 *       <ng-template rkReelItem let-index>
 *         <img [src]="photos[index]" alt="" />
 *       </ng-template>
 *     </rk-reel>
 *
 *     <rk-reel-indicator [count]="photos.length" [active]="active()" />
 *   `,
 * })
 * export class FeedComponent {
 *   protected readonly photos = photos;
 *   protected readonly active = signal(0);
 * }
 * ```
 */

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
  createUrlStateController,
  createHistoryAdapter,
  indexCodec,
  createIndexLocator,
  indexKey,
  batch,
  first,
  last,
  abs,
  clamp,
  extractRange,
  captureFrame,
  createSharedVideo,
  syncVideoObjectFit,
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
  createTimelineController,
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
  createBodyLock,
  sharedBodyLock,
  captureFocusForReturn,
  createFocusTrap,
  getFocusableElements,
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
  type TimelineController,
  type TimelineControllerConfig,
  type BufferedRange,
  type BodyLock,
  type TransitionTransformFn,
  type SlideTransformStyle,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type UrlStateOptions,
} from '@reelkit/core';

export {
  createOverlayUrlState,
  type OverlayUrlStateOptions,
} from './lib/url-state/create-overlay-url-state';

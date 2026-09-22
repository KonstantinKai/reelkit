/**
 * @module @reelkit/angular-stories-player
 *
 * Instagram-style stories overlay for Angular: tap to move through a group,
 * swipe or a cube transition to move between groups, and an auto-advance
 * timer driving a canvas progress bar.
 *
 * The package is the third binding on `@reelkit/stories-core`, alongside
 * `@reelkit/react-stories-player` and `@reelkit/vue-stories-player`. All
 * three share the same engine, so a behavioural difference between them is a
 * bug rather than a matter of framework taste.
 */

export { RkStoriesOverlayComponent } from './lib/stories-overlay/stories-overlay.component';
export { RkStoriesUrlOverlayComponent } from './lib/stories-overlay/stories-url-overlay.component';
export {
  RkStoriesCarouselComponent,
  type CarouselSlide,
} from './lib/stories-carousel/stories-carousel.component';

export {
  RkStoriesSlideDirective,
  RkStoriesHeaderDirective,
  RkStoriesFooterDirective,
  RkStoriesProgressBarDirective,
  RkStoriesNavigationDirective,
  RkStoriesGroupPreviewDirective,
  RkStoriesLoadingDirective,
  RkStoriesErrorDirective,
  STORIES_TEMPLATE_SLOT_DIRECTIVES,
} from './lib/template-slots/stories-template-slots';

export { RkStoriesRingComponent } from './lib/stories-ring/stories-ring.component';
export { RkStoriesRingListComponent } from './lib/stories-ring-list/stories-ring-list.component';
export { RkStoryHeaderComponent } from './lib/story-header/story-header.component';
export { RkHeartAnimationComponent } from './lib/heart-animation/heart-animation.component';
export { RkCanvasProgressBarComponent } from './lib/canvas-progress-bar/canvas-progress-bar.component';
export { RkImageStorySlideComponent } from './lib/image-story-slide/image-story-slide.component';
export { RkVideoStorySlideComponent } from './lib/video-story-slide/video-story-slide.component';
export { attachViewedState } from './lib/viewed-state/attach-viewed-state';

export type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  MediaType,
  StoriesHeaderContext,
  StoriesFooterContext,
  StoriesSlideContext,
  StoriesProgressBarContext,
  StoriesNavigationActions,
  StoriesNavigationContext,
  StoriesLoadingContext,
  StoriesErrorContext,
  StoriesGroupPreviewContext,
  DesktopLayout,
  StoriesApi,
} from './lib/types';

export {
  createStoriesViewedStateController,
  type StoriesViewedStateController,
  type StoriesViewedStateControllerConfig,
} from '@reelkit/stories-core';

export {
  createOverlayUrlState,
  urlIndexTwoAxisKey,
  urlStableIdTwoAxisKey,
  base64UrlCodec,
  createViewedStateController,
  twoAxisViewedTracking,
  createLocalStorageAdapter,
  createSessionStorageAdapter,
  createMemoryStorageAdapter,
  type OverlayUrlStateOptions,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type TwoAxisPosition,
  type TwoAxisIdentity,
  type UrlIndexTwoAxisKeyOptions,
  type ViewedStateController,
  type ViewedStateOptions,
  type StorageAdapter,
} from '@reelkit/angular';

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
 *
 * Open state comes in two shapes. {@link RkStoriesOverlayComponent} is
 * controlled — the surrounding component owns `isOpen`.
 * {@link RkStoriesUrlOverlayComponent} puts the open group and story in the
 * address bar instead, so the playing story has a link that can be shared,
 * bookmarked, and closed with the back button.
 *
 * @example Controlled — the component owns `isOpen`
 * ```ts
 * import { Component, signal } from '@angular/core';
 * import {
 *   RkStoriesOverlayComponent,
 *   RkStoriesRingListComponent,
 *   type StoriesGroup,
 * } from '@reelkit/angular-stories-player';
 * import '@reelkit/angular-stories-player/styles.css';
 *
 * @Component({
 *   imports: [RkStoriesOverlayComponent, RkStoriesRingListComponent],
 *   template: `
 *     <rk-stories-ring-list [groups]="groups" (selected)="open($event)" />
 *     <rk-stories-overlay
 *       [isOpen]="isOpen()"
 *       [groups]="groups"
 *       [initialGroupIndex]="groupIndex()"
 *       (closed)="isOpen.set(false)"
 *     />
 *   `,
 * })
 * export class FeedComponent {
 *   protected readonly groups: StoriesGroup[] = [
 *     {
 *       author: { id: 'alice', name: 'Alice', avatar: '/alice.jpg' },
 *       stories: [{ id: 's1', mediaType: 'image', src: '/story-1.jpg' }],
 *     },
 *   ];
 *
 *   protected readonly isOpen = signal(false);
 *   protected readonly groupIndex = signal(0);
 *
 *   protected open(index: number): void {
 *     this.groupIndex.set(index);
 *     this.isOpen.set(true);
 *   }
 * }
 * ```
 *
 * @example URL-driven — opening is a link, back closes
 * ```ts
 * import { Component, inject, Injector, runInInjectionContext, type OnInit } from '@angular/core';
 * import {
 *   RkStoriesUrlOverlayComponent,
 *   type StoriesGroup,
 * } from '@reelkit/angular-stories-player';
 * import {
 *   createOverlayUrlState,
 *   urlIndexTwoAxisKey,
 *   type TwoAxisPosition,
 *   type UrlStateController,
 * } from '@reelkit/angular';
 * import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
 *
 * @Component({
 *   imports: [RkStoriesUrlOverlayComponent],
 *   template: `<rk-stories-url-overlay [controller]="stories" [groups]="groups" />`,
 * })
 * export class FeedComponent implements OnInit {
 *   private readonly injector = inject(Injector);
 *
 *   protected groups: StoriesGroup[] = [];
 *   protected stories!: UrlStateController<TwoAxisPosition>;
 *
 *   // Both the controller and the router adapter need an injection context,
 *   // and ngOnInit does not run in one, so borrow the component's.
 *   ngOnInit(): void {
 *     this.stories = runInInjectionContext(this.injector, () =>
 *       createOverlayUrlState({
 *         param: 'story',
 *         adapter: createRouterUrlAdapter(),
 *         ...urlIndexTwoAxisKey({
 *           outerCount: () => this.groups.length,
 *           innerCounts: () => this.groups.map((group) => group.stories.length),
 *         }),
 *       }),
 *     ) as UrlStateController<TwoAxisPosition>;
 *   }
 * }
 * ```
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

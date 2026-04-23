/**
 * @module @reelkit/angular-reel-player
 *
 * Full-screen, Instagram/TikTok-style vertical reel player overlay for Angular.
 *
 * The main entry point is {@link RkReelPlayerOverlayComponent}: a generic,
 * customizable standalone component that renders a virtualized vertical slider
 * with media playback, gesture/keyboard/wheel navigation, and optional sound
 * controls.
 *
 * Customization is achieved via `@ContentChild` template slots:
 * - `rkPlayerSlideOverlay`: custom per-slide overlays
 * - `rkPlayerSlide`: fully custom slide content
 * - `rkPlayerControls`: custom player controls
 * - `rkPlayerNavigation`: custom navigation arrows
 * - `rkPlayerNestedSlide`: custom nested horizontal slide content
 * - `rkPlayerNestedNavigation`: custom arrows for the inner horizontal slider
 *
 * For custom data types, extend {@link BaseContentItem}:
 * ```ts
 * interface MyItem extends BaseContentItem {
 *   title: string;
 * }
 * ```
 *
 * @example
 * ```ts
 * import { Component, signal } from '@angular/core';
 * import {
 *   RkReelPlayerOverlayComponent,
 *   type ContentItem,
 * } from '@reelkit/angular-reel-player';
 * import '@reelkit/angular-reel-player/styles.css';
 *
 * @Component({
 *   standalone: true,
 *   imports: [RkReelPlayerOverlayComponent],
 *   template: `
 *     <button (click)="isOpen.set(true)">Open Player</button>
 *     <rk-reel-player-overlay
 *       [isOpen]="isOpen()"
 *       [content]="items"
 *       (closed)="isOpen.set(false)"
 *     />
 *   `,
 * })
 * export class AppComponent {
 *   isOpen = signal(false);
 *   items: ContentItem[] = [...];
 * }
 * ```
 */

export { RkReelPlayerOverlayComponent } from './lib/reel-player-overlay/reel-player-overlay.component';

export type {
  MediaType,
  MediaItem,
  BaseContentItem,
  ContentItem,
  PlayerSlideContext,
  PlayerSlideOverlayContext,
  PlayerControlsContext,
  PlayerSoundState,
  PlayerTimelineState,
  PlayerTimelineContext,
  PlayerBufferedRange,
  PlayerNavigationContext,
  PlayerNestedSlideContext,
  PlayerNestedNavigationContext,
  TimelineMode,
} from './lib/types';

export {
  RkPlayerSlideDirective,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerTimelineDirective,
  RkPlayerNavigationDirective,
  RkPlayerNestedSlideDirective,
  RkPlayerNestedNavigationDirective,
  RkPlayerLoadingDirective,
  RkPlayerErrorDirective,
  PLAYER_TEMPLATE_SLOT_DIRECTIVES,
  type PlayerLoadingContext,
  type PlayerErrorContext,
} from './lib/template-slots/player-template-slots';

export { RkCloseButtonComponent } from './lib/player-controls/close-button.component';
export { RkSoundButtonComponent } from './lib/player-controls/sound-button.component';

export { RkImageSlideComponent } from './lib/image-slide/image-slide.component';
export { RkVideoSlideComponent } from './lib/video-slide/video-slide.component';
export { RkSlideOverlayComponent } from './lib/slide-overlay/slide-overlay.component';
export { RkMediaSlideComponent } from './lib/media-slide/media-slide.component';
export { RkNestedSliderComponent } from './lib/nested-slider/nested-slider.component';

export { SoundStateService } from './lib/sound-state/sound-state.service';
export { TimelineStateService } from './lib/timeline-state/timeline-state.service';
export { RkTimelineBarComponent } from './lib/timeline-bar/timeline-bar.component';

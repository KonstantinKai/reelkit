/**
 * @module @reelkit/angular-lightbox
 *
 * Full-screen image gallery lightbox for Angular, built on top of
 * `@reelkit/core`.
 *
 * The primary entry point is {@link RkLightboxOverlayComponent}. It renders
 * a fixed overlay with swipe, keyboard, and wheel navigation, fullscreen
 * support, and image preloading.
 *
 * For customisation, use the template slot directives:
 * - `[rkLightboxControls]` — custom close/counter/fullscreen controls
 * - `[rkLightboxNavigation]` — custom prev/next navigation
 * - `[rkLightboxInfo]` — custom title/description overlay
 * - `[rkLightboxSlide]` — custom slide renderer (required for video slides)
 *
 * Reusable sub-components ({@link RkCloseButtonComponent},
 * {@link RkCounterComponent}, {@link RkFullscreenButtonComponent},
 * {@link RkSoundButtonComponent}) can be composed inside custom templates.
 *
 * @example
 * ```ts
 * import { RkLightboxOverlayComponent, type LightboxItem } from '@reelkit/angular-lightbox';
 * import '@reelkit/angular-lightbox/styles.css';
 *
 * const images: LightboxItem[] = [
 *   { src: '/photo-1.jpg', title: 'Sunset' },
 *   { src: '/photo-2.jpg', title: 'Mountains' },
 * ];
 *
 * @Component({
 *   imports: [RkLightboxOverlayComponent],
 *   template: `
 *     <rk-lightbox-overlay
 *       [isOpen]="index !== null"
 *       [items]="images"
 *       [initialIndex]="index ?? 0"
 *       (closed)="index = null"
 *     />
 *   `,
 * })
 * export class GalleryComponent {
 *   index: number | null = null;
 * }
 * ```
 */

export { RkLightboxOverlayComponent } from './lib/lightbox-overlay/lightbox-overlay.component';

export type {
  LightboxItem,
  ReelProxyProps,
  LightboxControlsContext,
  LightboxNavContext,
  LightboxInfoContext,
  LightboxSlideContext,
} from './lib/types';

export {
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkLightboxSlideDirective,
  RkLightboxLoadingDirective,
  RkLightboxErrorDirective,
  type LightboxLoadingContext,
  type LightboxErrorContext,
} from './lib/template-slots/lightbox-template-slots';

export { RkCloseButtonComponent } from './lib/lightbox-controls/close-button.component';
export { RkCounterComponent } from './lib/lightbox-controls/counter.component';
export { RkFullscreenButtonComponent } from './lib/lightbox-controls/fullscreen-button.component';
export { RkSoundButtonComponent } from './lib/lightbox-controls/sound-button.component';

export { RkSwipeToCloseDirective } from '@reelkit/angular';

export {
  RkLightboxVideoSlideComponent,
  setLightboxVideoMuted,
} from './lib/lightbox-video-slide/lightbox-video-slide.component';

export { slideTransition, flipTransition } from '@reelkit/angular';
export { lightboxFadeTransition } from './lib/lightboxFadeTransition';
export { lightboxZoomTransition } from './lib/lightboxZoomTransition';

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
 * The slot directives work the same inside either overlay.
 *
 * Open state comes in two shapes. {@link RkLightboxOverlayComponent} is
 * controlled — the surrounding component owns `isOpen`.
 * {@link RkLightboxUrlOverlayComponent} puts it in the address bar instead, so
 * the visible slide has a link that can be shared, bookmarked, and closed with
 * the back button.
 *
 * @example Controlled — the component owns `isOpen`
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
 *
 * @example URL-driven — opening is a link, back closes
 * ```ts
 * import {
 *   RkLightboxUrlOverlayComponent,
 *   createOverlayUrlState,
 *   indexKey,
 * } from '@reelkit/angular-lightbox';
 *
 * @Component({
 *   imports: [RkLightboxUrlOverlayComponent, RouterLink],
 *   template: `
 *     @for (image of images(); track image.src; let i = $index) {
 *       <a [routerLink]="[]" [queryParams]="{ photo: i }">
 *         <img [src]="image.src" alt="" />
 *       </a>
 *     }
 *
 *     <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
 *   `,
 * })
 * export class GalleryComponent {
 *   protected readonly images = signal(images);
 *
 *   // Call in an injection context: it attaches now and releases on destroy.
 *   protected readonly photo = createOverlayUrlState({
 *     param: 'photo',
 *     ...indexKey(() => this.images().length),
 *   });
 * }
 * ```
 */

export { RkLightboxOverlayComponent } from './lib/lightbox-overlay/lightbox-overlay.component';
export { RkLightboxUrlOverlayComponent } from './lib/lightbox-overlay/lightbox-url-overlay.component';

export {
  createOverlayUrlState,
  indexCodec,
  createIndexLocator,
  indexKey,
  createHistoryAdapter,
  type OverlayUrlStateOptions,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
} from '@reelkit/angular';

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

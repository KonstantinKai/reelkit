/**
 * @module @reelkit/react-lightbox
 *
 * Full-screen image gallery lightbox for React, built on top of
 * `@reelkit/core` and `@reelkit/react`.
 *
 * The primary entry point is {@link LightboxOverlay}. It renders a
 * portal-based overlay with swipe, keyboard, and wheel navigation,
 * fullscreen support, and image preloading.
 *
 * For customisation, use the `renderControls`, `renderNavigation`,
 * `renderInfo`, and `renderSlide` render props. Reusable
 * sub-components ({@link CloseButton}, {@link Counter},
 * {@link FullscreenButton}) can be composed inside `renderControls`.
 *
 * @example Controlled mode — the component owns whether the lightbox is open.
 * ```tsx
 * import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
 * import '@reelkit/react-lightbox/styles.css';
 *
 * const images: LightboxItem[] = [
 *   { src: '/photo-1.jpg', title: 'Sunset' },
 *   { src: '/photo-2.jpg', title: 'Mountains' },
 * ];
 *
 * function Gallery() {
 *   const [index, setIndex] = useState<number | null>(null);
 *   return (
 *     <>
 *       {images.map((img, i) => (
 *         <img key={i} src={img.src} onClick={() => setIndex(i)} />
 *       ))}
 *       <LightboxOverlay
 *         isOpen={index !== null}
 *         images={images}
 *         initialIndex={index ?? 0}
 *         onClose={() => setIndex(null)}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @example URL-driven mode — the address bar owns the open state, so links are
 * shareable and the back button closes the gallery. Pass `urlParam` instead of
 * `isOpen`; opening is writing the parameter.
 * ```tsx
 * import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
 * import { useUrlState } from '@reelkit/react';
 * import '@reelkit/react-lightbox/styles.css';
 *
 * function Gallery({ images }: { images: LightboxItem[] }) {
 *   const photo = useUrlState('photo');
 *   return (
 *     <>
 *       {images.map((img, i) => (
 *         <img key={img.src} src={img.src} onClick={() => photo.set(i)} />
 *       ))}
 *       <LightboxOverlay urlParam="photo" images={images} />
 *     </>
 *   );
 * }
 * ```
 *
 * @example Stable links — key the URL by a per-image identity instead of its
 * position, so a shared link opens the same image after the gallery is
 * reordered. `urlCodec` spells the identity into the URL; `urlLocator` finds
 * where it now sits.
 * ```tsx
 * import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
 * import '@reelkit/react-lightbox/styles.css';
 *
 * function Gallery({ images }: { images: LightboxItem[] }) {
 *   return (
 *     <LightboxOverlay
 *       urlParam="photo"
 *       images={images}
 *       urlCodec={{ decode: atob, encode: btoa }}
 *       urlLocator={{
 *         locate: (id) => images.findIndex((x) => x.src === id),
 *         identify: (index) => images[index].src,
 *       }}
 *     />
 *   );
 * }
 * ```
 */

// Main component
export { LightboxOverlay } from './lib/LightboxOverlay';

// Transitions
export { slideTransition, flipTransition } from '@reelkit/react';
export type { UrlAdapter, UrlCodec, UrlLocator } from '@reelkit/react';
export { lightboxFadeTransition } from './lib/lightboxFadeTransition';
export { lightboxZoomTransition } from './lib/lightboxZoomTransition';
export type {
  LightboxOverlayProps,
  LightboxItem,
  ReelProxyProps,
} from './lib/LightboxOverlay';

// Types
export type {
  ControlsRenderProps,
  SlideRenderProps,
  NavigationRenderProps,
  InfoRenderProps,
} from './lib/types';

// Sub-components for composition
export {
  CloseButton,
  Counter,
  FullscreenButton,
  SoundButton,
} from './lib/LightboxControls';
export type {
  CloseButtonProps,
  CounterProps,
  FullscreenButtonProps,
  SoundButtonProps,
} from './lib/LightboxControls';

// Video support (opt-in, tree-shakeable)
export { default as LightboxVideoSlide } from './lib/LightboxVideoSlide';
export type { LightboxVideoSlideProps } from './lib/LightboxVideoSlide';
export { useVideoSlideRenderer } from './lib/useVideoSlideRenderer';
export type { UseVideoSlideRendererResult } from './lib/useVideoSlideRenderer';

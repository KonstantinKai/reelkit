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
 * @example
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
 */

// Main component
export { LightboxOverlay } from './lib/LightboxOverlay';
export type {
  LightboxOverlayProps,
  LightboxItem,
  TransitionType,
  ReelProxyProps,
} from './lib/LightboxOverlay';

// Types
export type {
  LightboxControlsRenderProps,
  NavigationRenderProps,
  InfoRenderProps,
} from './lib/types';

// Sub-components for composition
export { CloseButton, Counter, FullscreenButton } from './lib/LightboxControls';
export type {
  CloseButtonProps,
  CounterProps,
  FullscreenButtonProps,
} from './lib/LightboxControls';

// Hooks (for custom implementations)
export { default as useFullscreen } from './lib/useFullscreen';
export type {
  UseFullscreenProps,
  UseFullscreenResult,
} from './lib/useFullscreen';

/**
 * @module @reelkit/vue-lightbox
 *
 * Full-screen image and video gallery lightbox overlay for Vue 3.
 *
 * The main entry point is `LightboxOverlay`: a horizontal swipe-navigable
 * gallery with keyboard controls, fullscreen support, and opt-in video
 * support.
 *
 * Customization is achieved via scoped slots:
 * - `slide`: fully custom slide content
 * - `controls`: custom controls bar (counter, fullscreen, sound, close)
 * - `navigation`: custom prev/next arrows
 * - `info`: custom title/description overlay
 * - `loading` / `error`: custom indicators
 *
 * Video support is opt-in via `useVideoSlideRenderer`, keeping the
 * default bundle free of audio/video wiring.
 */

export type {
  LightboxItem,
  TransitionType,
  ControlsSlotScope,
  NavigationSlotScope,
  SlideSlotScope,
  InfoSlotScope,
  LoadingSlotScope,
  ErrorSlotScope,
} from './lib/types';

export { lightboxFadeTransition } from './lib/lightboxFadeTransition';
export { lightboxZoomTransition } from './lib/lightboxZoomTransition';

export { ImageSlide, type ImageSlideProps } from './lib/ImageSlide';

export {
  CloseButton,
  Counter,
  FullscreenButton,
  SoundButton,
  type CloseButtonProps,
  type CounterProps,
  type FullscreenButtonProps,
  type SoundButtonProps,
} from './lib/LightboxControls';

export {
  LightboxNavigation,
  type LightboxNavigationProps,
} from './lib/LightboxNavigation';

export {
  LightboxOverlay,
  type LightboxOverlayProps,
  type LightboxApi,
} from './lib/LightboxOverlay';

export {
  LightboxVideoSlide,
  type LightboxVideoSlideProps,
} from './lib/LightboxVideoSlide';

export {
  useVideoSlideRenderer,
  type UseVideoSlideRendererResult,
} from './lib/useVideoSlideRenderer';

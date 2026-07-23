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
 *
 * Open state comes in two shapes. `LightboxOverlay` is controlled — the parent
 * owns `is-open`. `LightboxUrlOverlay` puts it in the address bar instead, so
 * the visible slide has a link that can be shared, bookmarked, and closed with
 * the back button. The scoped slots work the same in either.
 *
 * @example Controlled — the parent owns `is-open`
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
 * import '@reelkit/vue-lightbox/styles.css';
 *
 * const images: LightboxItem[] = [
 *   { src: '/photo-1.jpg', title: 'Sunset' },
 *   { src: '/photo-2.jpg', title: 'Mountains' },
 * ];
 * const isOpen = ref(false);
 * </script>
 *
 * <template>
 *   <button @click="isOpen = true">Open</button>
 *   <LightboxOverlay v-model:is-open="isOpen" :images="images" />
 * </template>
 * ```
 *
 * @example URL-driven — opening is a link, back closes
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
 * import { useOverlayUrlState, indexKey } from '@reelkit/vue';
 *
 * const images = ref<LightboxItem[]>([
 *   { src: '/photo-1.jpg', title: 'Sunset' },
 *   { src: '/photo-2.jpg', title: 'Mountains' },
 * ]);
 *
 * const photo = useOverlayUrlState({
 *   param: 'photo',
 *   ...indexKey(() => images.value.length),
 * });
 * </script>
 *
 * <template>
 *   <RouterLink
 *     v-for="(image, i) in images"
 *     :key="image.src"
 *     :to="{ query: { photo: i } }"
 *   >
 *     <img :src="image.src" alt="" />
 *   </RouterLink>
 *
 *   <LightboxUrlOverlay :controller="photo" :images="images" />
 * </template>
 * ```
 */

export type {
  LightboxItem,
  ControlsSlotScope,
  NavigationSlotScope,
  SlideSlotScope,
  InfoSlotScope,
  LoadingSlotScope,
  ErrorSlotScope,
} from './lib/types';

export { slideTransition, flipTransition } from '@reelkit/vue';
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
  LightboxUrlOverlay,
  type LightboxOverlayProps,
  type LightboxUrlOverlayProps,
  type LightboxApi,
} from './lib/LightboxOverlay';
export type { UrlAdapter, UrlCodec, UrlLocator } from '@reelkit/vue';

export {
  LightboxVideoSlide,
  type LightboxVideoSlideProps,
} from './lib/LightboxVideoSlide';

export {
  useVideoSlideRenderer,
  type UseVideoSlideRendererResult,
} from './lib/useVideoSlideRenderer';

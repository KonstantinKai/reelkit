/**
 * @module @reelkit/vue-reel-player
 *
 * Full-screen, Instagram/TikTok-style vertical reel player overlay for Vue 3.
 *
 * The main entry point is {@link ReelPlayerOverlay} — a generic, customizable
 * component that renders a virtualized vertical slider with media playback,
 * gesture/keyboard/wheel navigation, and optional sound controls.
 *
 * Customization is achieved via scoped slots:
 * - `slideOverlay` — custom per-slide overlays
 * - `slide` — fully custom slide content
 * - `controls` — custom player controls (compose with `CloseButton`, `SoundButton`)
 * - `navigation` — custom navigation arrows
 * - `nestedNavigation` — custom arrows for the inner horizontal slider (multi-media posts)
 * - `nestedSlide` — custom slide content for nested horizontal carousel items
 * - `loading` / `error` — custom indicators
 *
 * For custom data types, extend {@link BaseContentItem}:
 *
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
 * import '@reelkit/vue-reel-player/styles.css';
 *
 * const isOpen = ref(false);
 * const content: ContentItem[] = [{ ... }];
 * </script>
 *
 * <template>
 *   <ReelPlayerOverlay :is-open="isOpen" :content="content" @close="isOpen = false" />
 * </template>
 * ```
 */

export { ReelPlayerOverlay, type ReelPlayerApi } from './lib/ReelPlayerOverlay';

export type {
  MediaType,
  MediaItem,
  BaseContentItem,
  ContentItem,
  ControlsSlotScope,
  NavigationSlotScope,
  SlideSlotScope,
  SlideOverlaySlotScope,
  NestedSlideSlotScope,
  LoadingSlotScope,
} from './lib/types';

export { CloseButton, SoundButton, PlayerControls } from './lib/PlayerControls';
export { ImageSlide } from './lib/ImageSlide';
export { VideoSlide } from './lib/VideoSlide';
export { SlideOverlay } from './lib/SlideOverlay';
export { LoadingIndicator } from './lib/LoadingIndicator';
export { ErrorIndicator } from './lib/ErrorIndicator';
export { useViewportSize } from './lib/useViewportSize';

export {
  SoundProvider,
  useSoundState,
  type SoundController,
} from '@reelkit/vue';

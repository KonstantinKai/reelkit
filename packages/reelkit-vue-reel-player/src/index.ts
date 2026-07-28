/**
 * @module @reelkit/vue-reel-player
 *
 * Full-screen, Instagram/TikTok-style vertical reel player overlay for Vue 3.
 *
 * The main entry point is {@link ReelPlayerOverlay}: a generic, customizable
 * component that renders a virtualized vertical slider with media playback,
 * gesture/keyboard/wheel navigation, and optional sound controls.
 *
 * Customization is achieved via scoped slots:
 * - `slideOverlay`: custom per-slide overlays
 * - `slide`: fully custom slide content
 * - `controls`: custom player controls (compose with `CloseButton`, `SoundButton`)
 * - `navigation`: custom navigation arrows
 * - `nestedNavigation`: custom arrows for the inner horizontal slider (multi-media posts)
 * - `nestedSlide`: custom slide content for nested horizontal carousel items
 * - `loading` / `error`: custom indicators
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
 *
 * Open state comes in two shapes. {@link ReelPlayerOverlay} is controlled — the
 * surrounding component owns `is-open`. {@link ReelPlayerUrlOverlay} puts it in
 * the address bar instead, so the playing slide has a link that can be shared,
 * bookmarked, and closed with the back button. Every scoped slot above works
 * the same in either.
 *
 * @example URL-driven — opening is a link, back closes
 * ```vue
 * <script setup lang="ts">
 * import { ReelPlayerUrlOverlay, type ContentItem } from '@reelkit/vue-reel-player';
 * import { useOverlayUrlState, urlIndexKey } from '@reelkit/vue';
 * import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
 * import '@reelkit/vue-reel-player/styles.css';
 *
 * const props = defineProps<{ content: ContentItem[] }>();
 *
 * const reel = useOverlayUrlState({
 *   param: 'reel',
 *   adapter: useVueRouterUrlAdapter(),
 *   ...urlIndexKey(() => props.content.length),
 * });
 * </script>
 *
 * <template>
 *   <RouterLink v-for="(post, i) in props.content" :key="post.id" :to="`?reel=${i}`">
 *     <img :src="post.media[0].src" />
 *   </RouterLink>
 *
 *   <ReelPlayerUrlOverlay :controller="reel" :content="props.content" />
 * </template>
 * ```
 */

export {
  ReelPlayerOverlay,
  ReelPlayerUrlOverlay,
  type ReelPlayerApi,
  type ReelPlayerUrlOverlayProps,
} from './lib/ReelPlayerOverlay';

export type {
  UrlAdapter,
  UrlCodec,
  UrlLocator,
  TwoAxisPosition,
} from '@reelkit/vue';
export { urlIndexTwoAxisKey } from '@reelkit/vue';

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
  TimelineMode,
  TimelineSlotScope,
} from './lib/types';

export { CloseButton, SoundButton, PlayerControls } from './lib/PlayerControls';
export { ImageSlide } from './lib/ImageSlide';
export { VideoSlide } from './lib/VideoSlide';
export { SlideOverlay } from './lib/SlideOverlay';
export { LoadingIndicator } from './lib/LoadingIndicator';
export { ErrorIndicator } from './lib/ErrorIndicator';
export { useViewportSize } from './lib/useViewportSize';

export {
  TimelineProvider,
  useTimelineState,
  useTimelineStateOptional,
  RK_TIMELINE_KEY,
} from './lib/useTimelineState';
export { TimelineBar, type TimelineBarProps } from './lib/TimelineBar';

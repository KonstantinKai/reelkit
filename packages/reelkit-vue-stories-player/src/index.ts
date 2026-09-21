/**
 * @module @reelkit/vue-stories-player
 *
 * Instagram-style stories player overlay for Vue 3. Full-screen content viewer
 * with two-axis navigation: tap left or right to move through a user's
 * stories, swipe left or right with a 3D cube transition to switch between
 * users. Built on the framework-agnostic `@reelkit/stories-core` engine.
 *
 * The main component is {@link StoriesOverlay}. Entry-point components
 * {@link StoriesRing} and {@link StoriesRingList} render the circular avatar
 * rings that open the overlay.
 *
 * Customization is achieved via scoped slots:
 * - `header` / `footer`: the author row above a story and anything under it
 * - `slide`: fully custom story content
 * - `navigation`: custom desktop arrows
 * - `progressBar`: a custom progress bar in place of the canvas one
 * - `loading` / `error`: custom indicators for the active story
 * - `groupPreview`: the content of a desktop carousel card
 *
 * Open state comes in two shapes. {@link StoriesOverlay} is controlled — the
 * surrounding component owns `is-open`. {@link StoriesUrlOverlay} puts it in
 * the address bar instead: the open group and story ride one
 * `?story=<group>.<story>` parameter, so the playing story has a link that can
 * be shared, bookmarked, and closed with the back button. Inner navigation is
 * carried too — moving between a user's stories updates the URL — and one
 * back step always closes.
 *
 * @example Controlled — the component owns `is-open`
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { StoriesOverlay, type StoriesGroup } from '@reelkit/vue-stories-player';
 * import '@reelkit/vue-stories-player/styles.css';
 *
 * defineProps<{ groups: StoriesGroup[] }>();
 * const isOpen = ref(false);
 * </script>
 *
 * <template>
 *   <button @click="isOpen = true">Open stories</button>
 *   <StoriesOverlay v-model:is-open="isOpen" :groups="groups" />
 * </template>
 * ```
 *
 * @example URL-driven — opening is a link, back closes
 * ```vue
 * <script setup lang="ts">
 * import {
 *   StoriesUrlOverlay,
 *   useOverlayUrlState,
 *   urlIndexTwoAxisKey,
 *   type StoriesGroup,
 * } from '@reelkit/vue-stories-player';
 * import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
 * import '@reelkit/vue-stories-player/styles.css';
 *
 * const props = defineProps<{ groups: StoriesGroup[] }>();
 *
 * // Outer axis is the group, inner is the story within it.
 * const stories = useOverlayUrlState({
 *   param: 'story',
 *   adapter: useVueRouterUrlAdapter(),
 *   ...urlIndexTwoAxisKey({
 *     outerCount: () => props.groups.length,
 *     innerCounts: () => props.groups.map((g) => g.stories.length),
 *   }),
 * });
 * </script>
 *
 * <template>
 *   <RouterLink
 *     v-for="(group, i) in props.groups"
 *     :key="group.author.id"
 *     :to="`?story=${i}.0`"
 *   >
 *     {{ group.author.name }}
 *   </RouterLink>
 *
 *   <StoriesUrlOverlay :controller="stories" :groups="props.groups" />
 * </template>
 * ```
 */

export {
  StoriesOverlay,
  StoriesUrlOverlay,
  type StoriesOverlayProps,
  type StoriesUrlOverlayProps,
} from './lib/StoriesOverlay';
export { StoriesRing, type StoriesRingProps } from './lib/StoriesRing';
export {
  StoriesRingList,
  type StoriesRingListProps,
} from './lib/StoriesRingList';
export {
  CanvasProgressBar,
  type CanvasProgressBarProps,
} from './lib/CanvasProgressBar';
export { StoryHeader, type StoryHeaderProps } from './lib/StoryHeader';
export { HeartAnimation } from './lib/HeartAnimation';
export {
  ImageStorySlide,
  type ImageStorySlideProps,
} from './lib/ImageStorySlide';
export {
  VideoStorySlide,
  type VideoStorySlideProps,
} from './lib/VideoStorySlide';

export {
  Observe,
  SoundProvider,
  useSoundState,
  useOverlayUrlState,
  createViewedStateController,
  twoAxisViewedTracking,
  createLocalStorageAdapter,
  createSessionStorageAdapter,
  createMemoryStorageAdapter,
  urlIndexTwoAxisKey,
  urlStableIdTwoAxisKey,
  base64UrlCodec,
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
} from '@reelkit/vue';

export {
  createStoriesViewedStateController,
  type StoriesViewedStateController,
  type StoriesViewedStateControllerConfig,
} from '@reelkit/stories-core';

export type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  MediaType,
  HeaderSlotScope,
  FooterSlotScope,
  SlideSlotScope,
  NavigationSlotScope,
  ProgressBarSlotScope,
  LoadingSlotScope,
  ErrorSlotScope,
  DesktopLayout,
  GroupPreviewSlotScope,
  StoriesApi,
} from './lib/types';

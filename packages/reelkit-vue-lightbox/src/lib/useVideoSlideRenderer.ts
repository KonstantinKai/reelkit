import {
  defineComponent,
  computed,
  h,
  onUnmounted,
  type ComputedRef,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { SoundProvider, toVueRef, useSoundState } from '@reelkit/vue';
import type { ControlsSlotScope, LightboxItem, SlideSlotScope } from './types';
import { ImageSlide } from './ImageSlide';
import { LightboxVideoSlide } from './LightboxVideoSlide';
import {
  CloseButton,
  Counter,
  FullscreenButton,
  SoundButton,
} from './LightboxControls';

/**
 * Props for {@link VideoSlideRenderer}. Mirrors {@link SlideSlotScope} so
 * the component can be passed `v-bind="scope"` from the overlay's
 * `slide` slot without additional wiring.
 *
 * @internal
 */
const slideRendererProps = {
  item: {
    type: Object as PropType<SlideSlotScope['item']>,
    required: true as const,
  },

  index: {
    type: Number,
    required: true as const,
  },

  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  isActive: {
    type: Boolean,
    required: true as const,
  },

  onReady: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  onWaiting: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  onError: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type VideoSlideRendererProps = ExtractPropTypes<
  typeof slideRendererProps
>;

/**
 * Props for {@link VideoControlsRenderer}. Mirrors {@link ControlsSlotScope}
 * so it can be passed `v-bind="scope"` from the overlay's `controls`
 * slot without additional wiring.
 *
 * @internal
 */
const controlsRendererProps = {
  item: {
    type: Object as PropType<ControlsSlotScope['item']>,
    required: true as const,
  },

  activeIndex: {
    type: Number,
    required: true as const,
  },

  count: {
    type: Number,
    required: true as const,
  },

  isFullscreen: {
    type: Boolean,
    required: true as const,
  },

  onClose: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  onToggleFullscreen: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type VideoControlsRendererProps = ExtractPropTypes<
  typeof controlsRendererProps
>;

/**
 * Slide renderer for the overlay's `slide` slot. Emits a
 * {@link LightboxVideoSlide} for video items and an {@link ImageSlide}
 * for image items. Self-sufficient: returning `null` would not trigger
 * the overlay's slot-fallback path (the parent sees a valid component
 * VNode, not an empty slot), so this renderer has to handle both
 * branches itself.
 *
 * Module-scoped: the definition has no runtime closure, so hoisting
 * avoids re-creating the component on every `useVideoSlideRenderer`
 * call and keeps Vue's `normalizePropsOptions` cache hot.
 */
export const VideoSlideRenderer = defineComponent({
  name: 'VideoSlideRenderer',
  props: slideRendererProps,
  setup: (props) => () =>
    (props.item.type ?? 'image') === 'video'
      ? h(LightboxVideoSlide, {
          src: props.item.src,
          poster: props.item.poster,
          isActive: props.isActive,
          size: props.size,
          slideKey: `lightbox-${props.index}`,
          onPlaying: props.onReady,
          onWaiting: props.onWaiting,
          onLoadError: props.onError,
        })
      : h(ImageSlide, {
          src: props.item.src,
          alt: props.item.title || `Image ${props.index + 1}`,
          isActive: props.isActive,
          onReady: props.onReady,
          onLoadError: props.onError,
        }),
});

/**
 * Controls renderer for the overlay's `controls` slot. Renders the
 * built-in counter, fullscreen toggle, close button — plus a sound
 * toggle when the active slide is a video.
 *
 * `isVideoSlide` is derived from the active slot item (`props.item`)
 * instead of a closure over the items array, so the component can be
 * module-scoped and stays pure with respect to its inputs.
 */
export const VideoControlsRenderer = defineComponent({
  name: 'VideoControlsRenderer',
  props: controlsRendererProps,
  setup(props) {
    const soundState = useSoundState();
    const muted = toVueRef(soundState.muted);

    // Reset mute on unmount so the next lightbox session starts muted
    // (matches the React implementation's autoplay-friendly default).
    onUnmounted(() => (soundState.muted.value = true));

    return () => [
      h('div', { class: 'rk-lightbox-controls-left' }, [
        h(Counter, {
          currentIndex: props.activeIndex,
          count: props.count,
        }),
        h(FullscreenButton, {
          isFullscreen: props.isFullscreen,
          onPress: props.onToggleFullscreen,
        }),
        props.item?.type === 'video'
          ? h(SoundButton, {
              isMuted: muted.value,
              onPress: soundState.toggle,
            })
          : null,
      ]),
      h(CloseButton, { onPress: props.onClose }),
    ];
  },
});

/**
 * Return value of {@link useVideoSlideRenderer}.
 */
export interface UseVideoSlideRendererResult {
  /**
   * Wrap `<LightboxOverlay>` in this to provide sound context. Required
   * for video mute/unmute to work.
   */
  SoundProvider: typeof SoundProvider;

  /** `true` when at least one item has `type: 'video'`. */
  hasVideo: ComputedRef<boolean>;

  /** Slide renderer. See {@link VideoSlideRenderer}. */
  VideoSlideRenderer: typeof VideoSlideRenderer;

  /** Controls renderer. See {@link VideoControlsRenderer}. */
  VideoControlsRenderer: typeof VideoControlsRenderer;
}

/**
 * Opt-in video support for the lightbox.
 *
 * Returns slot-ready renderer components plus the shared `SoundProvider`
 * that must wrap the overlay for mute state. Consumers wire the
 * renderers into `#slide` and `#controls` via `v-bind="scope"`.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { LightboxOverlay, useVideoSlideRenderer } from '@reelkit/vue-lightbox';
 * const items = [...];
 * const { VideoSlideRenderer, VideoControlsRenderer, SoundProvider } =
 *   useVideoSlideRenderer(items);
 * </script>
 *
 * <template>
 *   <SoundProvider>
 *     <LightboxOverlay :is-open="open" :items="items">
 *       <template #slide="scope">
 *         <VideoSlideRenderer v-bind="scope" />
 *       </template>
 *       <template #controls="scope">
 *         <VideoControlsRenderer v-bind="scope" />
 *       </template>
 *     </LightboxOverlay>
 *   </SoundProvider>
 * </template>
 * ```
 */
export function useVideoSlideRenderer(
  items: LightboxItem[],
): UseVideoSlideRendererResult {
  const hasVideo = computed(() => items.some((item) => item.type === 'video'));

  return {
    SoundProvider,
    hasVideo,
    VideoSlideRenderer,
    VideoControlsRenderer,
  };
}

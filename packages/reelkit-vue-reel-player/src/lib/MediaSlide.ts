import { defineComponent, h, type PropType, type VNode } from 'vue';
import type { ReelExpose } from '@reelkit/vue';
import type {
  BaseContentItem,
  NavigationSlotScope,
  NestedSlideSlotScope,
} from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import NestedSlider from './NestedSlider';

/**
 * Props accepted by the {@link MediaSlide} dispatcher.
 *
 * @internal
 */
const mediaSlideProps = {
  /** The content item whose `media` array drives the dispatch. */
  content: {
    type: Object as PropType<BaseContentItem>,
    required: true as const,
  },

  /** Whether this slide is the currently active slide in the parent reel. */
  isActive: { type: Boolean, required: true as const },

  /** `[width, height]` of the slide in pixels. */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  /**
   * Setter the parent uses to receive the inner horizontal slider's API
   * for drag coordination. Called once on mount and again with `null`
   * on unmount.
   */
  setInnerSlider: {
    type: Function as PropType<(api: ReelExpose | null) => void>,
    required: true as const,
  },

  /**
   * Enable mouse-wheel navigation in nested horizontal sliders.
   *
   * @default true
   */
  enableWheel: { type: Boolean, default: true },

  /** Reports the active video element to the parent for drag pause/resume. */
  onVideoRef: {
    type: Function as PropType<(r: HTMLVideoElement | null) => void>,
    default: undefined,
  },

  /**
   * Reports active media type changes inside a nested slider so the
   * parent can hide the sound button when an image is showing.
   */
  onActiveMediaTypeChange: {
    type: Function as PropType<(t: 'image' | 'video') => void>,
    default: undefined,
  },

  /** Signals media loaded successfully. */
  onReady: { type: Function as PropType<() => void>, default: undefined },

  /** Signals media is buffering. */
  onWaiting: { type: Function as PropType<() => void>, default: undefined },

  /** Signals media failed to load. */
  onError: { type: Function as PropType<() => void>, default: undefined },

  /** Forwarded `nestedNavigation` slot render function. */
  renderNestedNavigation: {
    type: Function as PropType<
      (scope: NavigationSlotScope) => VNode | VNode[] | null
    >,
    default: undefined,
  },

  /** Forwarded `nestedSlide` slot render function. */
  renderNestedSlide: {
    type: Function as PropType<
      (scope: NestedSlideSlotScope) => VNode | VNode[] | null
    >,
    default: undefined,
  },
};

/**
 * Dispatches to the appropriate media component based on the content item:
 *
 * - Single image → `ImageSlide`
 * - Single video → `VideoSlide`
 * - Multiple items → `NestedSlider` (horizontal carousel)
 *
 * @internal
 */
export const MediaSlide = defineComponent({
  name: 'RkMediaSlide',
  props: mediaSlideProps,
  setup(props) {
    return () => {
      const { media } = props.content;

      if (media.length === 1 && media[0].type === 'image') {
        return h(ImageSlide, {
          src: media[0].src,
          size: props.size,
          onReady: props.onReady,
          onError: props.onError,
        });
      }

      if (media.length === 1 && media[0].type === 'video') {
        return h(VideoSlide, {
          src: media[0].src,
          poster: media[0].poster,
          aspectRatio: media[0].aspectRatio,
          size: props.size,
          isActive: props.isActive,
          slideKey: props.content.id,
          onVideoRef: props.onVideoRef,
          onReady: props.onReady,
          onWaiting: props.onWaiting,
          onError: props.onError,
        });
      }

      return h(NestedSlider, {
        media,
        contentItem: props.content,
        isParentActive: props.isActive,
        size: props.size,
        contentId: props.content.id,
        setInnerSlider: props.setInnerSlider,
        enableWheel: props.enableWheel,
        onVideoRef: props.onVideoRef,
        onActiveMediaTypeChange: props.onActiveMediaTypeChange,
        onReady: props.onReady,
        onWaiting: props.onWaiting,
        onError: props.onError,
        renderNavigation: props.renderNestedNavigation,
        renderNestedSlide: props.renderNestedSlide,
      });
    };
  },
});

export default MediaSlide;

import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type PropType,
  type VNode,
} from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import {
  Reel,
  ReelIndicator,
  createLruCache,
  hasRenderedNodes,
  type ReelExpose,
} from '@reelkit/vue';
import type {
  BaseContentItem,
  MediaItem,
  NavigationSlotScope,
  NestedSlideSlotScope,
} from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import './NestedSlider.css';

/**
 * Cap on cached `defaultContent` components per nested slider instance.
 * Three is the visible window size of the inner Reel; double it for
 * generous headroom across rapid swaps without growing unboundedly.
 */
const _kDefaultNestedCacheSize = 6;

/**
 * Props accepted by the {@link NestedSlider} component.
 *
 * @internal
 */
const nestedSliderProps = {
  /** Media items rendered inside the nested horizontal carousel. */
  media: {
    type: Array as PropType<MediaItem[]>,
    required: true as const,
  },

  /** The parent content item (passed through to slot scopes). */
  contentItem: {
    type: Object as PropType<BaseContentItem>,
    required: true as const,
  },

  /** Whether the parent vertical slide is the active slide. */
  isParentActive: { type: Boolean, required: true as const },

  /** `[width, height]` of the carousel in pixels. */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  /** Stable id of the parent content item, used to derive nested slide keys. */
  contentId: { type: String, required: true as const },

  /**
   * Setter the parent uses to receive this nested slider's API for drag
   * coordination. Called once on mount and again with `null` on unmount.
   */
  setInnerSlider: {
    type: Function as PropType<(api: ReelExpose | null) => void>,
    required: true as const,
  },

  /**
   * Enable mouse-wheel navigation in the nested horizontal slider.
   *
   * @default true
   */
  enableWheel: { type: Boolean, default: true },

  /** Reports the active video element to the parent for drag pause/resume. */
  onVideoRef: {
    type: Function as PropType<(r: HTMLVideoElement | null) => void>,
    default: undefined,
  },

  /** Reports active media type changes (sound button visibility hint). */
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
  renderNavigation: {
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
 * Horizontal nested slider for multi-media content items (e.g. an Instagram
 * carousel post with both images and videos).
 *
 * Renders a horizontal `Reel` inside a vertical slide, with indicator dots
 * and left/right navigation arrows.
 *
 * @internal
 */
export const NestedSlider = defineComponent({
  name: 'RkNestedSlider',
  props: nestedSliderProps,
  setup(props) {
    let localSlider: ReelExpose | null = null;
    let videoEl: HTMLVideoElement | null = null;
    const innerIndex = ref(0);

    /**
     * See identical comment in ReelPlayerOverlay: `defaultContent` for
     * each nested slide must be a stable component reference so that
     * `<component :is="defaultContent" />` patches in place. LRU-bounded
     * so the cache can't grow forever when `media` is swapped (e.g. an
     * infinite/paginated feed).
     */
    const defaultNestedComps = createLruCache<() => VNode>(
      _kDefaultNestedCacheSize,
    );
    const defaultNestedVNodes = createLruCache<VNode>(_kDefaultNestedCacheSize);

    const handleVideoRef = (r: HTMLVideoElement | null) => {
      videoEl = r;
      props.onVideoRef?.(r);
    };

    const handleBeforeChange = () => {
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
      }
    };

    const handleAfterChange = (index: number) => {
      innerIndex.value = index;
      const item = props.media[index];
      if (item) {
        props.onActiveMediaTypeChange?.(item.type);
        if (item.type === 'image') {
          props.onReady?.();
        }
      }
    };

    const handlePrev = () => localSlider?.prev();
    const handleNext = () => localSlider?.next();

    // setInnerSlider is invoked from the inner Reel's `ref:` callback
    // (see render below) before onMounted runs, so we don't double-set
    // here. Only the unmount path needs to clear the parent's reference.
    onMounted(() => {
      if (props.isParentActive && props.media[innerIndex.value]) {
        props.onActiveMediaTypeChange?.(props.media[innerIndex.value].type);
      }
    });

    onUnmounted(() => {
      props.setInnerSlider(null);
    });

    watch(
      () => props.isParentActive,
      (active) => {
        if (active && props.media[innerIndex.value]) {
          props.onActiveMediaTypeChange?.(props.media[innerIndex.value].type);
        }
      },
    );

    watch(
      () => props.media,
      () => {
        innerIndex.value = 0;
      },
    );

    return () => {
      const items = props.media;
      const size = props.size;

      return h(
        'div',
        {
          style: {
            width: `${size[0]}px`,
            height: `${size[1]}px`,
            position: 'relative',
            backgroundColor: '#000',
          },
        },
        [
          h(
            Reel,
            {
              count: items.length,
              size,
              direction: 'horizontal',
              loop: false,
              enableNavKeys: true,
              enableWheel: props.enableWheel,
              ref: (el: unknown) => {
                const api = (el as ReelExpose | null) ?? null;
                localSlider = api;
                props.setInnerSlider(api);
              },
              onBeforeChange: handleBeforeChange,
              onAfterChange: handleAfterChange,
              reelClass: props.isParentActive
                ? 'rk-reel-nested-active'
                : undefined,
            },
            {
              item: ({
                index,
                size: itemSize,
              }: {
                index: number;
                indexInRange: number;
                size: [number, number];
              }) => {
                const item = items[index];
                const isInnerActive = index === innerIndex.value;
                const slideKey = `${props.contentId}:${item.id}`;
                const videoRefProp = isInnerActive ? handleVideoRef : undefined;

                const defaultVNode: VNode =
                  item.type === 'video'
                    ? h(VideoSlide, {
                        src: item.src,
                        poster: item.poster,
                        aspectRatio: item.aspectRatio,
                        size: itemSize,
                        isActive: props.isParentActive,
                        isInnerActive,
                        slideKey,
                        onVideoRef: videoRefProp,
                        onReady: isInnerActive ? props.onReady : undefined,
                        onWaiting: isInnerActive ? props.onWaiting : undefined,
                        onError: isInnerActive ? props.onError : undefined,
                      })
                    : h(ImageSlide, {
                        src: item.src,
                        size: itemSize,
                        onReady: isInnerActive ? props.onReady : undefined,
                        onError: isInnerActive ? props.onError : undefined,
                      });
                defaultNestedVNodes.set(slideKey, defaultVNode);
                let defaultContent = defaultNestedComps.get(slideKey);
                if (!defaultContent) {
                  defaultContent = () =>
                    defaultNestedVNodes.get(slideKey) as VNode;
                  defaultNestedComps.set(slideKey, defaultContent);
                }

                if (props.renderNestedSlide) {
                  const custom = props.renderNestedSlide({
                    item: props.contentItem,
                    media: item,
                    index,
                    size: itemSize,
                    isActive: props.isParentActive,
                    isInnerActive,
                    slideKey,
                    onVideoRef: videoRefProp,
                    onReady: isInnerActive ? props.onReady : undefined,
                    onWaiting: isInnerActive ? props.onWaiting : undefined,
                    onError: isInnerActive ? props.onError : undefined,
                    defaultContent,
                  });
                  const customArr = (
                    Array.isArray(custom) ? custom : custom ? [custom] : []
                  ) as VNode[];
                  if (hasRenderedNodes(customArr)) return customArr;
                }

                return defaultVNode;
              },
            },
          ),
          items.length > 1
            ? h('div', { class: 'rk-reel-nested-indicator' }, [
                h(ReelIndicator, {
                  count: items.length,
                  active: innerIndex.value,
                  direction: 'horizontal',
                  visible: 5,
                  radius: 3,
                  gap: 4,
                  activeColor: '#fff',
                  inactiveColor: 'rgba(255,255,255,0.4)',
                  onDotClick: (i: number) => localSlider?.goTo(i, true),
                }),
              ])
            : null,
          items.length > 1 && props.renderNavigation
            ? props.renderNavigation({
                item: props.contentItem,
                media: items[innerIndex.value],
                activeIndex: innerIndex.value,
                count: items.length,
                onPrev: handlePrev,
                onNext: handleNext,
              })
            : items.length > 1
              ? [
                  innerIndex.value > 0
                    ? h(
                        'button',
                        {
                          class: 'rk-reel-nested-nav rk-reel-nested-nav-prev',
                          onClick: handlePrev,
                          'aria-label': 'Previous',
                        },
                        [h(ChevronLeft, { size: 24 })],
                      )
                    : null,
                  innerIndex.value < items.length - 1
                    ? h(
                        'button',
                        {
                          class: 'rk-reel-nested-nav rk-reel-nested-nav-next',
                          onClick: handleNext,
                          'aria-label': 'Next',
                        },
                        [h(ChevronRight, { size: 24 })],
                      )
                    : null,
                ]
              : null,
        ],
      );
    };
  },
});

export default NestedSlider;

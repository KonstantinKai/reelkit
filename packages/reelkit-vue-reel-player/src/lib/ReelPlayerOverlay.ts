import {
  Teleport,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  toRef,
  watch,
  type ExtractPropTypes,
  type PropType,
  type VNode,
} from 'vue';
import { slotAsRender } from './utils';
import { ChevronUp, ChevronDown } from 'lucide-vue-next';
import {
  Reel,
  SoundProvider,
  captureFrame,
  captureFocusForReturn,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  createFocusTrap,
  createLruCache,
  hasRenderedNodes,
  noop,
  observeDomEvent,
  toVueRef,
  useBodyLock,
  useSoundState,
  type ReelExpose,
  type TwoAxisPosition,
  type UrlStateController,
} from '@reelkit/vue';
import type {
  BaseContentItem,
  ContentItem,
  ControlsSlotScope,
  LoadingSlotScope,
  NavigationSlotScope,
  NestedSlideSlotScope,
  SlideOverlaySlotScope,
  SlideSlotScope,
  TimelineMode,
  TimelineSlotScope,
} from './types';
import MediaSlide from './MediaSlide';
import PlayerControls from './PlayerControls';
import SlideOverlay from './SlideOverlay';
import LoadingIndicator from './LoadingIndicator';
import ErrorIndicator from './ErrorIndicator';
import { shared as sharedVideo } from './VideoSlide';
import { TimelineProvider, useTimelineState } from './useTimelineState';
import TimelineBar from './TimelineBar';
import { useViewportSize } from './useViewportSize';
import './ReelPlayerOverlay.css';

/** Imperative API exposed by `ReelPlayerOverlay` via template ref. */
export type ReelPlayerApi = ReelExpose & { close: () => void };

const _kPreloadRange = 2;
const _kDefaultTimelineMinDurationSeconds = 30;

/**
 * Cap on cached `defaultContent` components per overlay instance. Three
 * is the visible window size of the outer Reel; double it for headroom
 * across rapid navigation without growing unboundedly when `content` is
 * swapped (e.g. paginated/infinite feeds).
 */
const _kDefaultSlideCacheSize = 6;

const preloader = createContentPreloader({ maxCacheSize: 1000 });

/**
 * Shared between the public {@link ReelPlayerOverlay} component and the
 * internal `ReelPlayerContent` it wraps. Public-facing entries get an
 * `isOpen` prefix in the outer component; the inner content always
 * receives an open overlay so it doesn't need its own toggle.
 *
 * @internal
 */
const reelPlayerSharedProps = {
  /** Array of content items to display as vertical slides. */
  content: {
    type: Array as PropType<BaseContentItem[]>,
    required: true as const,
  },

  /**
   * Accessible label for the dialog region. Announced by screen readers
   * when the overlay opens.
   *
   * @default 'Video player'
   */
  ariaLabel: { type: String, default: 'Video player' },

  /**
   * Zero-based index of the initially visible slide.
   *
   * @default 0
   */
  initialIndex: { type: Number, default: 0 },

  /**
   * Inner media index to open at, for the initially visible slide only. Lets a
   * two-axis URL deep-link into a specific image of a multi-media post. Ignored
   * once the player is open and the user navigates.
   *
   * @default undefined
   */
  initialInnerIndex: { type: Number, default: undefined },

  /**
   * Aspect ratio (width / height) for the player container on desktop.
   * On mobile (< 768 px) the player always uses the full viewport.
   *
   * @default 0.5625 (9 / 16)
   */
  aspectRatio: { type: Number, default: 9 / 16 },

  /**
   * Slide transition duration in milliseconds.
   *
   * @default 300
   */
  transitionDuration: { type: Number, default: 300 },

  /**
   * Fraction of container primary size a swipe must exceed to trigger
   * a slide change. `0.12` means 12 % of viewport height (vertical) or
   * width (horizontal).
   *
   * @default 0.12
   */
  swipeDistanceFactor: { type: Number, default: 0.12 },

  /**
   * Enable infinite circular navigation. The slider wraps past the last
   * slide back to the first (and vice versa).
   *
   * @default false
   */
  loop: { type: Boolean, default: false },

  /**
   * Enable keyboard arrow-key navigation (ArrowUp / ArrowDown / ArrowLeft
   * / ArrowRight). Escape always closes the overlay regardless.
   *
   * @default true
   */
  enableNavKeys: { type: Boolean, default: true },

  /**
   * Enable mouse-wheel navigation. Each debounced wheel tick moves one slide.
   *
   * @default true
   */
  enableWheel: { type: Boolean, default: true },

  /**
   * Debounce interval in milliseconds between consecutive wheel-driven
   * slide changes.
   *
   * @default 200
   */
  wheelDebounceMs: { type: Number, default: 200 },

  /**
   * Whether the built-in playback timeline bar renders over the active video.
   *
   * @default 'auto'
   */
  timeline: {
    type: String as PropType<TimelineMode>,
    default: 'auto' as TimelineMode,
  },

  /**
   * Minimum video duration (seconds) for `timeline='auto'` to render the
   * built-in bar. Short looping clips below this threshold are suppressed.
   *
   * @default 30
   */
  timelineMinDurationSeconds: {
    type: Number,
    default: _kDefaultTimelineMinDurationSeconds,
  },
};

/** Props accepted by the public {@link ReelPlayerOverlay} component. */
const reelPlayerOverlayProps = {
  /** When `true`, the overlay renders and body scroll is locked. */
  isOpen: { type: Boolean, required: true as const },

  ...reelPlayerSharedProps,
};

/** Public props interface for the {@link ReelPlayerOverlay} component. */
export type ReelPlayerOverlayProps = ExtractPropTypes<
  typeof reelPlayerOverlayProps
>;

/**
 * Inner content of the overlay. Created as its own component so that
 * `useSoundState`, `useBodyLock`, and lifecycle hooks resolve inside the
 * `SoundProvider` scope.
 *
 * @internal
 */
const ReelPlayerContent = defineComponent({
  name: 'RkReelPlayerContent',
  inheritAttrs: false,
  props: reelPlayerSharedProps,
  emits: {
    close: () => true,
    slideChange: (_: number) => true,
    innerSlideChange: (_outer: number, _inner: number) => true,
    apiReady: (_: ReelPlayerApi) => true,
  },
  setup(props, { emit, slots, expose }) {
    const sliderRef = shallowRef<ReelExpose | null>(null);
    const innerSliderRef = shallowRef<ReelExpose | null>(null);
    let overlayEl: HTMLDivElement | null = null;
    let videoEl: HTMLVideoElement | null = null;
    let videoPausedOnDrag = false;
    const soundState = useSoundState();
    const timelineState = useTimelineState();
    const timelineDuration = toVueRef(timelineState.duration);

    const aspectRatio = toRef(props, 'aspectRatio');
    const size = useViewportSize(aspectRatio);

    const activeIndex = ref(props.initialIndex);
    const loadingCtrl = createContentLoadingController(
      true,
      props.initialIndex,
    );
    const innerMediaType = ref<'image' | 'video' | null>(null);
    const loadingState = toVueRef(loadingCtrl.isLoading);
    const errorState = toVueRef(loadingCtrl.isError);

    /**
     * Cache of stable functional components for each slide's `defaultContent`.
     * The component reference must stay constant across renders so that
     * `<component :is="defaultContent" />` inside a custom `#slide` slot
     * patches in place instead of unmounting and remounting (which would
     * tear down the active video and reset NestedSlider state). LRU-bounded
     * so the cache can't grow forever when `content` is swapped.
     */
    const defaultSlideComps = createLruCache<() => VNode[]>(
      _kDefaultSlideCacheSize,
    );
    const defaultSlideVNodes = createLruCache<VNode[]>(_kDefaultSlideCacheSize);

    useBodyLock(true);

    const hasVideoContent = (index: number): boolean => {
      const item = props.content[index];
      return item?.media.some((m) => m.type === 'video') ?? false;
    };

    const handleVideoRef = (r: HTMLVideoElement | null) => {
      videoEl = r;
    };

    const handleActiveMediaTypeChange = (t: 'image' | 'video') => {
      innerMediaType.value = t;
    };

    const handleInnerIndexChange = (innerIndex: number) => {
      emit('innerSlideChange', activeIndex.value, innerIndex);
    };

    const handleBeforeChange = () => {
      soundState.disabled.value = true;
      if (videoEl) {
        videoEl.pause();
        const key = videoEl.dataset['slideKey'];
        const frame = captureFrame(videoEl);
        if (key && frame) {
          sharedVideo.capturedFrames.set(key, frame);
        }
      }
    };

    const handleAfterChange = (index: number) => {
      loadingCtrl.setActiveIndex(index);
      const src = props.content[index]?.media[0]?.src;
      if (src && preloader.isErrored(src)) {
        loadingCtrl.onError(index);
      } else if (src && preloader.isLoaded(src)) {
        loadingCtrl.onReady(index);
      }
      innerMediaType.value = null;
      if (hasVideoContent(index)) {
        soundState.disabled.value = false;
      }
      activeIndex.value = index;
      emit('slideChange', index);
      // A single-media post has no nested slider to report an inner index on
      // activation, so report 0 here; a multi-media post's nested slider
      // reports its own live inner index when it becomes active.
      const media = props.content[index]?.media;
      if (!media || media.length <= 1) {
        emit('innerSlideChange', index, 0);
      }
    };

    const handleSlideDragStart = () => {
      innerSliderRef.value?.unobserve();
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
        videoPausedOnDrag = true;
      }
    };

    const handleSlideDragEnd = () => {
      innerSliderRef.value?.observe();
    };

    const handleSlideDragCanceled = () => {
      if (videoPausedOnDrag && videoEl) {
        videoEl.play().catch(noop);
      }
      videoPausedOnDrag = false;
    };

    const handleClose = () => emit('close');
    const handlePrev = () => sliderRef.value?.prev();
    const handleNext = () => sliderRef.value?.next();

    const disposables = createDisposableList();

    const preloadNeighbors = () => {
      const items = props.content;
      const idx = activeIndex.value;
      const start = Math.max(0, idx - _kPreloadRange);
      const end = Math.min(items.length - 1, idx + _kPreloadRange);
      for (let i = start; i <= end; i++) {
        if (i === idx) continue;
        for (const m of items[i].media) {
          if (m.type === 'video') {
            if (m.poster) preloader.preload(m.poster, 'image');
          } else {
            preloader.preload(m.src, 'image');
          }
        }
      }
    };

    onMounted(() => {
      disposables.push(
        observeDomEvent(window, 'keydown', (e) => {
          if ((e as KeyboardEvent).key === 'Escape') emit('close');
        }),
      );

      disposables.push(captureFocusForReturn());
      if (overlayEl) {
        overlayEl.focus({ preventScroll: true });
        disposables.push(createFocusTrap(overlayEl));
      }

      const initialSrc = props.content[activeIndex.value]?.media[0]?.src;
      if (initialSrc) {
        disposables.push(
          preloader.onLoaded(initialSrc, () =>
            loadingCtrl.onReady(activeIndex.value),
          ),
        );
      }
    });

    // watchEffect tracks both activeIndex and props.content automatically,
    // so preloading reacts to consumer-side content swaps (e.g. an
    // infinite/paginated feed appending items mid-session) without
    // needing to enumerate sources by hand.
    watch([activeIndex, () => props.content], preloadNeighbors, {
      immediate: true,
    });

    watch(
      () => size.value,
      () => sliderRef.value?.adjust(),
    );

    onUnmounted(disposables.dispose);

    watch(
      sliderRef,
      (api) => {
        if (api) {
          const publicApi: ReelPlayerApi = {
            next: api.next,
            prev: api.prev,
            goTo: api.goTo,
            adjust: api.adjust,
            observe: api.observe,
            unobserve: api.unobserve,
            close: handleClose,
          };
          emit('apiReady', publicApi);
        }
      },
      { flush: 'post' },
    );

    expose({
      next: () => sliderRef.value?.next(),
      prev: () => sliderRef.value?.prev(),
      goTo: (index: number, anim?: boolean) =>
        sliderRef.value?.goTo(index, anim) ?? Promise.resolve(),
      adjust: () => sliderRef.value?.adjust(),
      observe: () => sliderRef.value?.observe(),
      unobserve: () => sliderRef.value?.unobserve(),
      close: handleClose,
    } satisfies ReelPlayerApi);

    const renderSlideOverlay = (
      item: BaseContentItem,
      index: number,
      isActive: boolean,
    ): VNode | VNode[] | null => {
      const slot = slots['slideOverlay'];
      if (slot) {
        const scope: SlideOverlaySlotScope = { item, index, isActive };
        const res = slot(scope);
        return res ?? null;
      }
      const record = item as unknown as Record<string, unknown>;
      const author =
        'author' in item
          ? (record['author'] as { name: string; avatar: string } | undefined)
          : undefined;
      const description =
        'description' in item
          ? (record['description'] as string | undefined)
          : undefined;
      const likes =
        'likes' in item ? (record['likes'] as number | undefined) : undefined;
      return h(SlideOverlay, { author, description, likes });
    };

    return () => {
      const items = props.content;
      const [w, h0] = size.value;
      if (w <= 0 || h0 <= 0) return null;

      const renderLoadingOverlay = () => {
        if (errorState.value) {
          const errSlot = slots['error'];
          if (errSlot) {
            const scope: LoadingSlotScope = {
              item: items[activeIndex.value],
              activeIndex: activeIndex.value,
            };
            return errSlot(scope);
          }
          return h(ErrorIndicator);
        }
        if (loadingState.value) {
          const loadSlot = slots['loading'];
          if (loadSlot) {
            const scope: LoadingSlotScope = {
              item: items[activeIndex.value],
              activeIndex: activeIndex.value,
            };
            return loadSlot(scope);
          }
          return h(LoadingIndicator);
        }
        return null;
      };

      const renderControlsNode = () => {
        const idx = activeIndex.value;
        const hasVideo =
          items[idx]?.media.some((m) => m.type === 'video') ?? false;
        const isMultiMedia = items[idx]?.media.length > 1;
        const soundDisabled = isMultiMedia && innerMediaType.value === 'image';
        const ctrlSlot = slots['controls'];
        if (ctrlSlot) {
          const scope: ControlsSlotScope = {
            item: items[idx],
            soundState,
            activeIndex: idx,
            content: items,
            onClose: handleClose,
          };
          return ctrlSlot(scope);
        }
        return h(PlayerControls, {
          onClose: handleClose,
          showSound: hasVideo,
          soundDisabled,
        });
      };

      const renderTimelineNode = () => {
        const mode = props.timeline;
        if (mode === 'never') return null;
        const idx = activeIndex.value;
        const item = items[idx];
        if (!item) return null;

        const anyVideo = item.media.some((m) => m.type === 'video');
        const isSingle = item.media.length === 1;
        const activeMediaIsVideo = isSingle
          ? item.media[0]?.type === 'video'
          : innerMediaType.value === 'video';

        if (mode === 'always') {
          if (!anyVideo) return null;
        } else {
          if (!activeMediaIsVideo) return null;
          if (timelineDuration.value < props.timelineMinDurationSeconds) {
            return null;
          }
        }

        const defaultContent = h(TimelineBar);

        const timelineSlot = slots['timeline'];
        if (timelineSlot) {
          const scope: TimelineSlotScope = {
            item,
            activeIndex: idx,
            timelineState,
            defaultContent: () => [defaultContent],
          };
          return timelineSlot(scope);
        }
        return defaultContent;
      };

      const renderNavigationNode = () => {
        const idx = activeIndex.value;
        const navSlot = slots['navigation'];
        if (navSlot) {
          const scope: NavigationSlotScope = {
            item: items[idx],
            activeIndex: idx,
            count: items.length,
            onPrev: handlePrev,
            onNext: handleNext,
          };
          return navSlot(scope);
        }
        // Loop mode never sits at an edge; nav always navigates.
        const prevDisabled = !props.loop && idx === 0;
        const nextDisabled = !props.loop && idx === items.length - 1;
        return h('div', { class: 'rk-reel-nav-arrows' }, [
          h(
            'button',
            {
              onClick: prevDisabled ? undefined : handlePrev,
              class: 'rk-reel-button rk-reel-nav-button',
              'aria-label': 'Previous',
              'aria-disabled': prevDisabled,
              disabled: prevDisabled,
            },
            [h(ChevronUp, { size: 28 })],
          ),
          h(
            'button',
            {
              onClick: nextDisabled ? undefined : handleNext,
              class: 'rk-reel-button rk-reel-nav-button',
              'aria-label': 'Next',
              'aria-disabled': nextDisabled,
              disabled: nextDisabled,
            },
            [h(ChevronDown, { size: 28 })],
          ),
        ]);
      };

      return h(
        'div',
        {
          ref: (el: unknown) => {
            overlayEl = (el as HTMLDivElement | null) ?? null;
          },
          class: 'rk-reel-overlay',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': props.ariaLabel,
          tabindex: -1,
        },
        [
          h('div', { class: 'rk-reel-container' }, [
            h(
              Reel,
              {
                count: items.length,
                size: [w, h0],
                direction: 'vertical',
                loop: props.loop,
                enableNavKeys: props.enableNavKeys,
                enableWheel: props.enableWheel,
                wheelDebounceMs: props.wheelDebounceMs,
                transitionDuration: props.transitionDuration,
                swipeDistanceFactor: props.swipeDistanceFactor,
                initialIndex: props.initialIndex,
                ref: (el: unknown) => {
                  sliderRef.value = (el as ReelExpose | null) ?? null;
                },
                onBeforeChange: handleBeforeChange,
                onAfterChange: handleAfterChange,
                onSlideDragStart: handleSlideDragStart,
                onSlideDragEnd: handleSlideDragEnd,
                onSlideDragCanceled: handleSlideDragCanceled,
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
                  const isActive = index === activeIndex.value;
                  const onReady = () => {
                    loadingCtrl.onReady(index);
                    const src = item.media[0]?.src;
                    if (src) preloader.markLoaded(src);
                  };
                  const onWaiting = () => loadingCtrl.onWaiting(index);
                  const onError = () => {
                    const src = item.media[0]?.src;
                    if (src) preloader.markErrored(src);
                    loadingCtrl.onError(index);
                  };

                  const defaultMedia = h(MediaSlide, {
                    content: item,
                    isActive,
                    size: itemSize,
                    setInnerSlider: (api) => {
                      innerSliderRef.value = api;
                    },
                    enableWheel: props.enableWheel,
                    initialInnerIndex:
                      index === props.initialIndex
                        ? props.initialInnerIndex
                        : undefined,
                    onVideoRef: isActive ? handleVideoRef : undefined,
                    onReady,
                    onWaiting,
                    onError,
                    onActiveMediaTypeChange: isActive
                      ? handleActiveMediaTypeChange
                      : undefined,
                    onInnerIndexChange: isActive
                      ? handleInnerIndexChange
                      : undefined,
                    renderNestedNavigation: slotAsRender<NavigationSlotScope>(
                      slots['nestedNavigation'],
                    ),
                    renderNestedSlide: slotAsRender<NestedSlideSlotScope>(
                      slots['nestedSlide'],
                    ),
                  });
                  const overlayNode = renderSlideOverlay(item, index, isActive);
                  const defaultVNodes: VNode[] = [defaultMedia];
                  if (overlayNode) {
                    defaultVNodes.push(
                      ...(Array.isArray(overlayNode)
                        ? overlayNode
                        : [overlayNode]),
                    );
                  }
                  defaultSlideVNodes.set(item.id, defaultVNodes);
                  let defaultContent = defaultSlideComps.get(item.id);
                  if (!defaultContent) {
                    defaultContent = () =>
                      defaultSlideVNodes.get(item.id) ?? [];
                    defaultSlideComps.set(item.id, defaultContent);
                  }

                  const slideSlot = slots['slide'];
                  if (slideSlot) {
                    const scope: SlideSlotScope = {
                      item,
                      index,
                      size: itemSize,
                      isActive,
                      slideKey: item.id,
                      innerSliderRef,
                      enableWheel: props.enableWheel,
                      defaultContent,
                      onVideoRef: isActive ? handleVideoRef : undefined,
                      onActiveMediaTypeChange: isActive
                        ? handleActiveMediaTypeChange
                        : undefined,
                      onReady,
                      onWaiting,
                      onError,
                    };
                    const custom = slideSlot(scope);
                    if (hasRenderedNodes(custom)) {
                      return h(
                        'div',
                        {
                          class: 'rk-reel-slide-wrapper',
                          role: 'group',
                          'aria-roledescription': 'slide',
                          'aria-label': `Slide ${index + 1} of ${props.content.length}`,
                          style: {
                            width: `${itemSize[0]}px`,
                            height: `${itemSize[1]}px`,
                            position: 'relative',
                          },
                        },
                        custom,
                      );
                    }
                  }

                  return h(
                    'div',
                    {
                      class: 'rk-reel-slide-wrapper',
                      role: 'group',
                      'aria-roledescription': 'slide',
                      'aria-label': `Slide ${index + 1} of ${props.content.length}`,
                      style: {
                        width: `${itemSize[0]}px`,
                        height: `${itemSize[1]}px`,
                        position: 'relative',
                      },
                    },
                    defaultVNodes,
                  );
                },
              },
            ),
            renderLoadingOverlay(),
            renderControlsNode(),
            renderTimelineNode(),
          ]),
          renderNavigationNode(),
        ],
      );
    };
  },
});

/**
 * Wraps the player content in the shell both overlays share: a `Teleport` to
 * the body, then the sound and timeline providers `ReelPlayerContent` reads
 * from. Written once so the controlled and url-driven overlays cannot drift.
 */
const renderPlayerWrapper = (content: VNode): VNode =>
  h(Teleport, { to: 'body' }, [
    h(SoundProvider, null, {
      default: () => [h(TimelineProvider, null, { default: () => [content] })],
    }),
  ]);

/**
 * Full-screen, Instagram/TikTok-style vertical reel player overlay for Vue 3.
 *
 * Renders a `<Teleport to="body">` containing a virtualized vertical slider
 * with media playback, gesture/keyboard/wheel navigation, and optional sound
 * controls. Supports full customization via scoped slots: `slide`,
 * `slideOverlay`, `controls`, `navigation`, `nestedSlide`, `nestedNavigation`,
 * `loading`, `error`.
 *
 * Wraps content in a `SoundProvider` (from `@reelkit/vue`) for scoped
 * mute/unmute state. Locks body scroll while open. Closes on `Escape`.
 */
export const ReelPlayerOverlay = defineComponent({
  name: 'ReelPlayerOverlay',
  inheritAttrs: false,
  props: reelPlayerOverlayProps,
  emits: {
    close: () => true,
    slideChange: (_: number) => true,
    innerSlideChange: (_outer: number, _inner: number) => true,
    apiReady: (_: ReelPlayerApi) => true,
    // Emitted alongside `close` so consumers can drive the overlay via
    // `v-model:is-open="..."`. The legacy `:is-open` + `@close` API
    // continues to work.
    'update:isOpen': (_: boolean) => true,
  },
  setup(props, { emit, slots, expose }) {
    // Forward the inner ReelPlayerContent's exposed API up so consumers
    // can use a single template ref on `<ReelPlayerOverlay>` regardless
    // of the isOpen wrapping. When closed the calls are safely no-op.
    const innerApi = shallowRef<ReelPlayerApi | null>(null);
    const handleApiReady = (api: ReelPlayerApi) => {
      innerApi.value = api;
      emit('apiReady', api);
    };

    const requestClose = () => {
      emit('close');
      emit('update:isOpen', false);
    };

    expose({
      next: () => innerApi.value?.next(),
      prev: () => innerApi.value?.prev(),
      goTo: (index: number, anim?: boolean) =>
        innerApi.value?.goTo(index, anim) ?? Promise.resolve(),
      adjust: () => innerApi.value?.adjust(),
      observe: () => innerApi.value?.observe(),
      unobserve: () => innerApi.value?.unobserve(),
      close: requestClose,
    } satisfies ReelPlayerApi);

    return () => {
      if (!props.isOpen) {
        innerApi.value = null;
        return null;
      }

      return renderPlayerWrapper(
        h(
          ReelPlayerContent,
          {
            ...props,
            onClose: requestClose,
            onSlideChange: (i: number) => emit('slideChange', i),
            onInnerSlideChange: (outer: number, inner: number) =>
              emit('innerSlideChange', outer, inner),
            onApiReady: handleApiReady,
          },
          slots,
        ),
      );
    };
  },
});

/** Props accepted by the public {@link ReelPlayerUrlOverlay} component. */
const reelPlayerUrlOverlayProps = {
  ...reelPlayerSharedProps,

  /**
   * URL-state controller from `useOverlayUrlState`. Its `position` drives
   * whether the overlay is open and which slide it shows; the overlay writes
   * back through it on slide change and close.
   *
   * Pick the URL depth by which key the controller was built with. A one-axis
   * `urlIndexKey` gives a `number` position (`?reel=3`, the vertical post
   * only); a two-axis `urlIndexTwoAxisKey` gives a `{ outer, inner }` position
   * (`?reel=3.2`, the post plus the inner media index of a multi-media
   * carousel). The overlay discriminates the mode at runtime from the position
   * shape — no mode prop.
   */
  controller: {
    type: Object as PropType<
      UrlStateController<number> | UrlStateController<TwoAxisPosition>
    >,
    required: true as const,
  },
} as const;

/** Public props interface for the {@link ReelPlayerUrlOverlay} component. */
export type ReelPlayerUrlOverlayProps = ExtractPropTypes<
  typeof reelPlayerUrlOverlayProps
>;

/**
 * Reel player whose open state lives in the URL. Build the controller with
 * `useOverlayUrlState` and pass it as `controller`: the address bar owns the
 * player, so it opens when the controller's index names a slide and closes when
 * it clears — links are shareable and the back button closes when it was opened
 * from within the app. A shared link opened directly in a fresh tab has no
 * history behind it, so browser-back leaves the site; the close button or
 * Escape removes the parameter in place and stays.
 *
 * Opening pushes one history entry and every slide change replaces it, so
 * paging a feed adds no entries and one back step always leaves. The URL depth
 * follows the controller's key: a one-axis `urlIndexKey` addresses the vertical
 * post only (`?reel=3`), a two-axis `urlIndexTwoAxisKey` also carries the inner
 * media index of a multi-media post (`?reel=3.2`). Pick one key per app — the
 * two wire shapes are deliberately distinct and do not cross-decode.
 *
 * The controlled `ReelPlayerOverlay` and this url-driven overlay are separate
 * components on purpose: each carries exactly one open-state driver, so there is
 * no mutually-exclusive prop to police.
 */
export const ReelPlayerUrlOverlay = defineComponent({
  name: 'ReelPlayerUrlOverlay',
  inheritAttrs: false,
  props: reelPlayerUrlOverlayProps,
  emits: {
    close: () => true,
    slideChange: (_: number) => true,
    innerSlideChange: (_outer: number, _inner: number) => true,
    apiReady: (_: ReelPlayerApi) => true,
  },
  setup(props, { emit, slots, expose }) {
    const innerApi = shallowRef<ReelPlayerApi | null>(null);

    // The controller's position shape is the single source of truth for its
    // mode, so narrow the union once here rather than scattering casts. A union
    // of two typed controllers has an unusable intersection `set()` and cannot
    // feed `toVueRef` as one signal; viewing it as one controller over the
    // merged position keeps both the read and the write honest, and the render
    // discriminates the actual shape at runtime.
    const controller = props.controller as UrlStateController<
      number | TwoAxisPosition
    >;
    const position = toVueRef(controller.position);

    const requestClose = () => {
      controller.set(null);
      emit('close');
    };

    const handleApiReady = (api: ReelPlayerApi) => {
      innerApi.value = api;
      emit('apiReady', api);
    };

    expose({
      next: () => innerApi.value?.next(),
      prev: () => innerApi.value?.prev(),
      goTo: (index: number, anim?: boolean) =>
        innerApi.value?.goTo(index, anim) ?? Promise.resolve(),
      adjust: () => innerApi.value?.adjust(),
      observe: () => innerApi.value?.observe(),
      unobserve: () => innerApi.value?.unobserve(),
      close: requestClose,
    } satisfies ReelPlayerApi);

    return () => {
      const pos = position.value;
      if (pos === null) {
        innerApi.value = null;
        return null;
      }

      // Runtime discrimination: a number is one-axis (post only); an object is
      // two-axis (post + inner media index).
      const twoAxis = typeof pos !== 'number';
      const outerIndex = twoAxis ? pos.outer : pos;
      const initialInner = twoAxis ? pos.inner : undefined;

      return renderPlayerWrapper(
        h(
          ReelPlayerContent,
          {
            content: props.content,
            ariaLabel: props.ariaLabel,
            initialIndex: outerIndex,
            initialInnerIndex: initialInner,
            aspectRatio: props.aspectRatio,
            transitionDuration: props.transitionDuration,
            swipeDistanceFactor: props.swipeDistanceFactor,
            loop: props.loop,
            enableNavKeys: props.enableNavKeys,
            enableWheel: props.enableWheel,
            wheelDebounceMs: props.wheelDebounceMs,
            timeline: props.timeline,
            timelineMinDurationSeconds: props.timelineMinDurationSeconds,
            onClose: requestClose,
            onSlideChange: (i: number) => {
              // One-axis writes the post index on outer nav. Two-axis leaves
              // the write to innerSlideChange, which fires on activation with
              // the post's live inner index — writing here would name inner 0
              // before that correction lands.
              if (!twoAxis) controller.set(i);
              emit('slideChange', i);
            },
            onInnerSlideChange: (outer: number, inner: number) => {
              if (twoAxis) controller.set({ outer, inner });
              emit('innerSlideChange', outer, inner);
            },
            onApiReady: handleApiReady,
          },
          slots,
        ),
      );
    };
  },
});

export type { ContentItem };

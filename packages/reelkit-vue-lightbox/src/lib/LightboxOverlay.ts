import {
  Teleport,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type ExtractPropTypes,
  type PropType,
  type VNode,
} from 'vue';
import { ImageOff } from 'lucide-vue-next';
import {
  Reel,
  SwipeToClose,
  captureFocusForReturn,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  createFocusTrap,
  flipTransition,
  hasRenderedNodes,
  observeDomEvent,
  slideTransition,
  toVueRef,
  useBodyLock,
  useFullscreen,
  type ReelExpose,
  type SwipeToCloseDirection,
  type TransitionTransformFn,
} from '@reelkit/vue';
import type {
  ControlsSlotScope,
  ErrorSlotScope,
  InfoSlotScope,
  LightboxItem,
  LoadingSlotScope,
  NavigationSlotScope,
  SlideSlotScope,
  TransitionType,
} from './types';
import { ImageSlide } from './ImageSlide';
import { LightboxControls } from './LightboxControls';
import { LightboxNavigation } from './LightboxNavigation';
import { lightboxFadeTransition } from './lightboxFadeTransition';
import { lightboxZoomTransition } from './lightboxZoomTransition';
import './styles.css';

/** Imperative API exposed by `<LightboxOverlay>` via template ref. */
export interface LightboxApi {
  next(): void;
  prev(): void;
  goTo(index: number, animate?: boolean): Promise<void>;
  adjust(): void;
  observe(): void;
  unobserve(): void;
  close(): void;
}

/**
 * Number of neighbours to preload on each side of the active slide.
 * Matches the React + Angular implementations.
 */
const _kPreloadRange = 2;

const _kTransitionMap: Record<TransitionType, TransitionTransformFn> = {
  slide: slideTransition,
  fade: lightboxFadeTransition,
  flip: flipTransition,
  'zoom-in': lightboxZoomTransition,
};

const preloader = createContentPreloader({ maxCacheSize: 1000 });

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Shared prop definitions used by both the public wrapper and the inner
 * content component. The wrapper adds `isOpen` on top.
 *
 * @internal
 */
const lightboxSharedProps = {
  /** Items to display as horizontal slides. */
  items: {
    type: Array as PropType<LightboxItem[]>,
    required: true as const,
  },
  /**
   * Accessible label for the dialog region.
   *
   * @default 'Image gallery'
   */
  ariaLabel: { type: String, default: 'Image gallery' },
  /**
   * Zero-based index of the initially visible item.
   *
   * @default 0
   */
  initialIndex: { type: Number, default: 0 },
  /**
   * Built-in transition alias. Ignored when `transitionFn` is provided.
   *
   * @default 'slide'
   */
  transition: {
    type: String as PropType<TransitionType>,
    default: 'slide' as TransitionType,
  },
  /** Custom transition function. Overrides `transition` alias. */
  transitionFn: {
    type: Function as PropType<TransitionTransformFn>,
    default: undefined,
  },
  /**
   * Slide transition duration in milliseconds.
   *
   * @default 300
   */
  transitionDuration: { type: Number, default: 300 },
  /**
   * Fraction of container primary size a swipe must exceed to trigger a
   * slide change.
   *
   * @default 0.12
   */
  swipeDistanceFactor: { type: Number, default: 0.12 },
  /**
   * Direction of the swipe-to-close gesture on mobile.
   *
   * @default 'up'
   */
  swipeToCloseDirection: {
    type: String as PropType<SwipeToCloseDirection>,
    default: 'up' as SwipeToCloseDirection,
  },
  /**
   * Enable infinite loop navigation.
   *
   * @default false
   */
  loop: { type: Boolean, default: false },
  /**
   * Enable keyboard arrow-key navigation.
   *
   * @default true
   */
  enableNavKeys: { type: Boolean, default: true },
  /**
   * Enable mouse wheel navigation.
   *
   * @default true
   */
  enableWheel: { type: Boolean, default: true },
  /**
   * Debounce duration for wheel events in ms.
   *
   * @default 200
   */
  wheelDebounceMs: { type: Number, default: 200 },
  /**
   * Render the built-in title/description info overlay.
   *
   * @default true
   */
  showInfo: { type: Boolean, default: true },
  /**
   * Render the built-in controls bar.
   *
   * @default true
   */
  showControls: { type: Boolean, default: true },
  /**
   * Render the built-in prev/next navigation arrows on desktop.
   *
   * @default true
   */
  showNavigation: { type: Boolean, default: true },
} as const;

const lightboxOverlayProps = {
  ...lightboxSharedProps,
  /**
   * Controls overlay visibility. Two-way bindable via `v-model:is-open`.
   */
  isOpen: { type: Boolean, required: true as const },
} as const;

export type LightboxOverlayProps = ExtractPropTypes<
  typeof lightboxOverlayProps
>;

/**
 * Inner content. Rendered only when the outer wrapper's `isOpen` is true,
 * so mount/unmount doubles as the open/close lifecycle.
 *
 * @internal
 */
const LightboxContent = defineComponent({
  name: 'RkLightboxContent',
  inheritAttrs: false,
  props: lightboxSharedProps,
  emits: {
    close: () => true,
    slideChange: (_: number) => true,
    apiReady: (_: LightboxApi) => true,
  },
  setup(props, { emit, slots, expose }) {
    const containerRef = shallowRef<HTMLDivElement | null>(null);
    const sliderRef = shallowRef<ReelExpose | null>(null);

    const size = shallowRef<[number, number]>(
      typeof window !== 'undefined'
        ? [window.innerWidth, window.innerHeight]
        : [0, 0],
    );
    const isMobile = ref(isTouchDevice());
    const activeIndex = ref(props.initialIndex);

    const loadingCtrl = createContentLoadingController(
      true,
      props.initialIndex,
    );
    const isLoading = toVueRef(loadingCtrl.isLoading);
    const isError = toVueRef(loadingCtrl.isError);

    useBodyLock(true);

    const fs = useFullscreen({ elementRef: containerRef });
    const isFullscreen = toVueRef(fs.isFullscreen);

    const handleClose = () => emit('close');

    const handleToggleFullscreen = () => fs.toggle().catch(() => undefined);

    const handlePrev = () => sliderRef.value?.prev();
    const handleNext = () => sliderRef.value?.next();

    const handleAfterChange = (index: number) => {
      loadingCtrl.setActiveIndex(index);
      const src = props.items[index]?.src;
      if (src && preloader.isErrored(src)) {
        loadingCtrl.onError(index);
      } else if (src && preloader.isLoaded(src)) {
        loadingCtrl.onReady(index);
      }
      activeIndex.value = index;
      emit('slideChange', index);
    };

    const preloadNeighbors = () => {
      const items = props.items;
      const idx = activeIndex.value;
      const start = Math.max(0, idx - _kPreloadRange);
      const end = Math.min(items.length - 1, idx + _kPreloadRange);
      for (let i = start; i <= end; i++) {
        if (i === idx) continue;
        const item = items[i];
        if (!item) continue;
        if (item.type === 'video') {
          if (item.poster) preloader.preload(item.poster, 'image');
        } else {
          preloader.preload(item.src, 'image');
        }
      }
    };

    const disposables = createDisposableList();

    onMounted(() => {
      disposables.push(captureFocusForReturn());
      const el = containerRef.value;
      if (el) {
        el.focus({ preventScroll: true });
        disposables.push(createFocusTrap(el));
      }

      disposables.push(
        observeDomEvent(window, 'resize', () => {
          size.value = [window.innerWidth, window.innerHeight];
          isMobile.value = isTouchDevice();
        }),
        observeDomEvent(window, 'keydown', (e) => {
          const event = e as KeyboardEvent;
          if (event.key !== 'Escape') return;
          if (isFullscreen.value) {
            fs.exit().catch(() => undefined);
          } else {
            handleClose();
          }
        }),
      );

      const initialSrc = props.items[activeIndex.value]?.src;
      if (initialSrc) {
        disposables.push(
          preloader.onLoaded(initialSrc, () =>
            loadingCtrl.onReady(activeIndex.value),
          ),
        );
      }
    });

    watch([activeIndex, () => props.items], preloadNeighbors, {
      immediate: true,
    });

    watch(
      () => size.value,
      () => sliderRef.value?.adjust(),
    );

    onUnmounted(disposables.dispose);

    const makeApi = (): LightboxApi => ({
      next: () => sliderRef.value?.next(),
      prev: () => sliderRef.value?.prev(),
      goTo: (index: number, animate?: boolean) =>
        sliderRef.value?.goTo(index, animate) ?? Promise.resolve(),
      adjust: () => sliderRef.value?.adjust(),
      observe: () => sliderRef.value?.observe(),
      unobserve: () => sliderRef.value?.unobserve(),
      close: handleClose,
    });

    watch(
      sliderRef,
      (api) => {
        if (api) emit('apiReady', makeApi());
      },
      { flush: 'post' },
    );

    expose(makeApi());

    const renderSlideContent = (
      index: number,
      itemSize: [number, number],
    ): VNode | VNode[] => {
      const item = props.items[index];
      const isActive = index === activeIndex.value;
      const onReady = () => loadingCtrl.onReady(index);
      const onWaiting = () => loadingCtrl.onWaiting(index);
      const onError = () => {
        preloader.markErrored(item.src);
        loadingCtrl.onError(index);
      };

      const slideSlot = slots['slide'];
      if (slideSlot) {
        const scope: SlideSlotScope = {
          item,
          index,
          size: itemSize,
          isActive,
          onReady,
          onWaiting,
          onError,
        };
        const nodes = slideSlot(scope);
        if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
          return nodes as VNode[];
        }
      }

      return h(ImageSlide, {
        src: item.src,
        alt: item.title || `Image ${index + 1}`,
        isActive,
        onReady: () => {
          preloader.markLoaded(item.src);
          onReady();
        },
        onLoadError: onError,
      });
    };

    const renderControlsLayer = (): VNode | VNode[] | null => {
      if (!props.showControls) return null;
      const idx = activeIndex.value;
      const items = props.items;
      const item = items[idx];
      if (!item) return null;

      const scope: ControlsSlotScope = {
        item,
        activeIndex: idx,
        count: items.length,
        isFullscreen: isFullscreen.value,
        onClose: handleClose,
        onToggleFullscreen: handleToggleFullscreen,
      };
      const slot = slots['controls'];
      if (slot) {
        const nodes = slot(scope);
        if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
          return nodes as VNode[];
        }
      }
      return h(LightboxControls, {
        currentIndex: idx,
        count: items.length,
        isFullscreen: isFullscreen.value,
        onClose: handleClose,
        onToggleFullscreen: handleToggleFullscreen,
      });
    };

    const renderNavigationLayer = (): VNode | VNode[] | null => {
      if (!props.showNavigation) return null;
      const items = props.items;
      const idx = activeIndex.value;
      const item = items[idx];
      if (!item) return null;
      if (isMobile.value) return null;
      if (items.length <= 1) return null;

      const scope: NavigationSlotScope = {
        item,
        activeIndex: idx,
        count: items.length,
        onPrev: handlePrev,
        onNext: handleNext,
      };
      const slot = slots['navigation'];
      if (slot) {
        const nodes = slot(scope);
        if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
          return nodes as VNode[];
        }
      }
      return h(LightboxNavigation, {
        activeIndex: idx,
        count: items.length,
        loop: props.loop,
        onPrev: handlePrev,
        onNext: handleNext,
      });
    };

    const renderInfoLayer = (): VNode | VNode[] | null => {
      if (!props.showInfo) return null;
      const idx = activeIndex.value;
      const item = props.items[idx];
      if (!item) return null;

      const scope: InfoSlotScope = { item, index: idx };
      const slot = slots['info'];
      if (slot) {
        const nodes = slot(scope);
        if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
          return nodes as VNode[];
        }
      }
      if (!item.title && !item.description) return null;
      return h('div', { class: 'rk-lightbox-info' }, [
        item.title
          ? h('h2', { class: 'rk-lightbox-info-title' }, item.title)
          : null,
        item.description
          ? h('p', { class: 'rk-lightbox-info-description' }, item.description)
          : null,
      ]);
    };

    const renderLoadingError = (): VNode | VNode[] | null => {
      const idx = activeIndex.value;
      const item = props.items[idx];
      if (!item) return null;

      if (isError.value) {
        const scope: ErrorSlotScope = { item, activeIndex: idx };
        const slot = slots['error'];
        if (slot) {
          const nodes = slot(scope);
          if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
            return nodes as VNode[];
          }
        }
        return h(
          'div',
          {
            class: 'rk-lightbox-error',
            role: 'img',
            'aria-label': 'Content unavailable',
          },
          [
            h(ImageOff, {
              size: 48,
              strokeWidth: 1.5,
              'aria-hidden': 'true',
            }),
            h(
              'span',
              { class: 'rk-lightbox-error-text' },
              'Content unavailable',
            ),
          ],
        );
      }

      if (isLoading.value) {
        const scope: LoadingSlotScope = { item, activeIndex: idx };
        const slot = slots['loading'];
        if (slot) {
          const nodes = slot(scope);
          if (hasRenderedNodes(nodes as VNode[] | null | undefined)) {
            return nodes as VNode[];
          }
        }
        return h('div', { class: 'rk-lightbox-spinner' });
      }

      return null;
    };

    return () => {
      const items = props.items;
      const [width, height] = size.value;
      if (width <= 0 || height <= 0) return null;

      const transitionFn =
        props.transitionFn ?? _kTransitionMap[props.transition];

      return h(
        'div',
        {
          ref: (el: unknown) => {
            containerRef.value = (el as HTMLDivElement | null) ?? null;
          },
          class: 'rk-lightbox-overlay',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': props.ariaLabel,
          tabindex: -1,
        },
        [
          h(
            SwipeToClose,
            {
              direction: props.swipeToCloseDirection,
              enabled: isMobile.value,
              onClose: handleClose,
            },
            {
              default: () =>
                h(
                  Reel,
                  {
                    count: items.length,
                    size: [width, height],
                    direction: 'horizontal',
                    loop: props.loop,
                    enableNavKeys: props.enableNavKeys,
                    enableWheel: props.enableWheel,
                    wheelDebounceMs: props.wheelDebounceMs,
                    transitionDuration: props.transitionDuration,
                    swipeDistanceFactor: props.swipeDistanceFactor,
                    initialIndex: props.initialIndex,
                    transition: transitionFn,
                    ref: (el: unknown) => {
                      sliderRef.value = (el as ReelExpose | null) ?? null;
                    },
                    onAfterChange: handleAfterChange,
                  },
                  {
                    item: ({
                      index,
                      size: itemSize,
                    }: {
                      index: number;
                      indexInRange: number;
                      size: [number, number];
                    }) =>
                      h(
                        'div',
                        {
                          class: 'rk-lightbox-slide',
                          role: 'group',
                          'aria-roledescription': 'slide',
                          'aria-label': `Image ${index + 1} of ${items.length}`,
                          style: {
                            width: `${itemSize[0]}px`,
                            height: `${itemSize[1]}px`,
                          },
                        },
                        renderSlideContent(index, itemSize),
                      ),
                  },
                ),
            },
          ),
          h('div', { class: 'rk-lightbox-top-shade' }),
          renderControlsLayer(),
          renderNavigationLayer(),
          renderInfoLayer(),
          renderLoadingError(),
        ],
      );
    };
  },
});

/**
 * Full-screen image and video gallery lightbox overlay for Vue 3.
 *
 * Renders a `<Teleport to="body">` containing a horizontal slider with
 * keyboard navigation, fullscreen support, and optional video slides.
 * Supports full customization via scoped slots: `slide`, `controls`,
 * `navigation`, `info`, `loading`, `error`.
 *
 * Locks body scroll while open. Closes on `Escape` (exits fullscreen
 * first when active) or on the close button. Two-way bindable via
 * `v-model:is-open`.
 */
export const LightboxOverlay = defineComponent({
  name: 'LightboxOverlay',
  inheritAttrs: false,
  props: lightboxOverlayProps,
  emits: {
    close: () => true,
    slideChange: (_: number) => true,
    apiReady: (_: LightboxApi) => true,
    // Emitted alongside `close` so consumers can drive the overlay via
    // `v-model:is-open="..."`. The legacy `:is-open` + `@close` API
    // continues to work.
    'update:isOpen': (_: boolean) => true,
  },
  setup(props, { emit, slots, expose }) {
    const innerApi = shallowRef<LightboxApi | null>(null);

    const requestClose = () => {
      emit('close');
      emit('update:isOpen', false);
    };

    expose({
      next: () => innerApi.value?.next(),
      prev: () => innerApi.value?.prev(),
      goTo: (index: number, animate?: boolean) =>
        innerApi.value?.goTo(index, animate) ?? Promise.resolve(),
      adjust: () => innerApi.value?.adjust(),
      observe: () => innerApi.value?.observe(),
      unobserve: () => innerApi.value?.unobserve(),
      close: requestClose,
    } satisfies LightboxApi);

    return () => {
      if (!props.isOpen) {
        innerApi.value = null;
        return null;
      }
      return h(Teleport, { to: 'body' }, [
        h(
          LightboxContent,
          {
            items: props.items,
            ariaLabel: props.ariaLabel,
            initialIndex: props.initialIndex,
            transition: props.transition,
            transitionFn: props.transitionFn,
            transitionDuration: props.transitionDuration,
            swipeDistanceFactor: props.swipeDistanceFactor,
            swipeToCloseDirection: props.swipeToCloseDirection,
            loop: props.loop,
            enableNavKeys: props.enableNavKeys,
            enableWheel: props.enableWheel,
            wheelDebounceMs: props.wheelDebounceMs,
            showInfo: props.showInfo,
            showControls: props.showControls,
            showNavigation: props.showNavigation,
            onClose: requestClose,
            onSlideChange: (i: number) => emit('slideChange', i),
            onApiReady: (api: LightboxApi) => {
              innerApi.value = api;
              emit('apiReady', api);
            },
          },
          slots,
        ),
      ]);
    };
  },
});

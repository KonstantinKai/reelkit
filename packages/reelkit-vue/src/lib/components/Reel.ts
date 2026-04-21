import {
  defineComponent,
  h,
  ref,
  shallowRef,
  provide,
  onMounted,
  onUnmounted,
  watch,
  type ExtractPropTypes,
  type PropType,
  type VNode,
} from 'vue';
import {
  createSliderController,
  createSignal,
  createDisposableList,
  animate,
  first,
  last,
  noop,
  defaultRangeExtractor,
  slideTransition,
  type RangeExtractor,
  type SliderDirection,
  type TransitionTransformFn,
} from '@reelkit/core';
import { RK_REEL_KEY, type ReelContextValue } from '../context/ReelContext';
import { toVueRef } from '../composables/toVueRef';

/**
 * Imperative API exposed by the {@link Reel} component via template ref.
 * Provides programmatic control over slider navigation and lifecycle.
 */
export type ReelExpose = {
  /** Animate to the next slide. */
  next: () => void;

  /** Animate to the previous slide. */
  prev: () => void;

  /**
   * Navigate to a specific slide index. Returns a promise that
   * resolves when the transition completes.
   */
  goTo: (index: number, animate?: boolean) => Promise<void>;

  /** Recalculate positions (useful after resize or layout change). */
  adjust: () => void;

  /** Start listening to gesture, keyboard, and wheel events. */
  observe: () => void;

  /** Stop listening to gesture, keyboard, and wheel events. */
  unobserve: () => void;
};

const defaultKeyExtractor = (index: number) => index.toString();

/** Props accepted by the {@link Reel} component. */
const reelProps = {
  /** Total number of slides. */
  count: { type: Number, required: true as const },

  /**
   * Index of the initial active slide.
   *
   * @default 0
   */
  initialIndex: { type: Number, default: 0 },

  /**
   * Slide axis.
   *
   * @default 'vertical'
   */
  direction: {
    type: String as PropType<SliderDirection>,
    default: 'vertical',
  },

  /**
   * Enable infinite circular navigation — the slider wraps past the last
   * slide back to the first (and vice versa).
   *
   * @default false
   */
  loop: { type: Boolean, default: false },

  /**
   * Duration of slide transition animations, in milliseconds.
   *
   * @default 300
   */
  transitionDuration: { type: Number, default: 300 },

  /**
   * Fraction of container primary size a swipe must exceed to trigger
   * a slide change. `0.12` means a 12 %-of-height swipe (vertical) or
   * 12 %-of-width swipe (horizontal).
   *
   * @default 0.12
   */
  swipeDistanceFactor: { type: Number, default: 0.12 },

  /**
   * Custom function that selects which 3 indexes to render for a given
   * active index. Core always keeps the visible range at 3 slides
   * (previous, current, next) — this hook lets you override *which*
   * three, e.g. for loop-mode edge cases with small item counts.
   * Defaults to {@link defaultRangeExtractor}.
   */
  rangeExtractor: {
    type: Function as PropType<RangeExtractor>,
    default: undefined,
  },

  /**
   * Explicit `[width, height]` of the slider container in pixels.
   * Omit to auto-size from the element's CSS via `ResizeObserver`.
   */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    default: undefined,
  },

  /**
   * Enable keyboard arrow-key navigation. When enabled, ArrowUp/ArrowDown
   * (vertical) or ArrowLeft/ArrowRight (horizontal) move the active slide.
   *
   * @default true
   */
  enableNavKeys: { type: Boolean, default: true },

  /**
   * Enable mouse-wheel navigation. Each debounced wheel tick moves one slide.
   *
   * @default false
   */
  enableWheel: { type: Boolean, default: false },

  /**
   * Debounce interval in milliseconds between consecutive wheel-driven
   * slide changes.
   *
   * @default 200
   */
  wheelDebounceMs: { type: Number, default: 200 },

  /**
   * Enable touch/mouse drag navigation. When `false`, the gesture
   * controller is not attached — slides change only via keyboard, wheel,
   * or programmatic API.
   *
   * @default true
   */
  enableGestures: { type: Boolean, default: true },

  /**
   * Custom transform function applied per slide during transitions.
   * Pass one of the built-in transitions (`slideTransition`,
   * `cubeTransition`, `fadeTransition`, `flipTransition`, `zoomTransition`)
   * or your own. Defaults to `slideTransition`.
   */
  transition: {
    type: Function as PropType<TransitionTransformFn>,
    default: undefined,
  },

  /**
   * Custom key function for Vue's virtual DOM diffing. Defaults to the
   * slide index. Override for loop mode with small item counts, where
   * the same index can appear more than once in the visible range —
   * see {@link createDefaultKeyExtractorForLoop}.
   */
  keyExtractor: {
    type: Function as PropType<(index: number, indexInRange: number) => string>,
    default: undefined,
  },

  /**
   * Replaces the default keyboard navigation handler. When provided, core
   * will NOT call its built-in `changeIndex` for ArrowUp/ArrowDown — the
   * supplied callback is expected to implement navigation (or deliberately
   * block it). Omit to use default navigation.
   *
   * This is a callback prop (not a Vue emit) because core treats its
   * presence as an opt-in to override default behavior — an emit-style
   * listener can't be reliably detected at setup time.
   */
  onNavKeyPress: {
    type: Function as PropType<(increment: -1 | 1) => void>,
    default: undefined,
  },

  /**
   * Accessible label for the carousel region. Read by screen readers in
   * place of the generic "carousel" role description.
   */
  ariaLabel: { type: String, default: undefined },

  /** CSS class(es) applied to the root container element. */
  reelClass: { type: [String, Array, Object], default: undefined },

  /** Inline styles merged into the root container element. */
  reelStyle: {
    type: Object as PropType<Record<string, string | number>>,
    default: undefined,
  },
};

/** Public props interface for the {@link Reel} component. */
export type ReelProps = ExtractPropTypes<typeof reelProps>;

/**
 * Creates a key extractor that handles duplicate keys when loop mode is
 * active with small item counts (e.g. 2 items). In loop mode, the same
 * index can appear multiple times in the visible range; this extractor
 * appends a `_cloned` suffix to disambiguate.
 */
export const createDefaultKeyExtractorForLoop =
  (count: number, keyPrefix?: string) =>
  (index: number, indexInRange: number) => {
    const key = `${keyPrefix ?? ''}${index}`;

    if (count === 2 && [0, 1].includes(index) && indexInRange === 0) {
      return `${key}_cloned`;
    }

    return key;
  };

/**
 * Virtualized one-item slider component. Renders only the visible slides
 * (typically 3: previous, current, next) to the DOM at any time, enabling
 * efficient handling of large lists (10,000+ items).
 *
 * Supports touch/mouse gestures, keyboard navigation, and optional mouse
 * wheel scrolling. Use template ref for imperative control via {@link ReelExpose}.
 */
export const Reel = defineComponent({
  name: 'Reel',
  inheritAttrs: false,
  props: reelProps,
  emits: [
    'beforeChange',
    'afterChange',
    'slideDragStart',
    'slideDragEnd',
    'slideDragCanceled',
    'tap',
    'doubleTap',
    'longPress',
    'longPressEnd',
  ],
  setup(props, { emit, slots, expose }) {
    if (typeof window === 'undefined') {
      expose({
        next: noop,
        prev: noop,
        goTo: () => Promise.resolve(),
        adjust: noop,
        observe: noop,
        unobserve: noop,
      } satisfies ReelExpose);
      return () =>
        h('div', {
          class: props.reelClass,
          style: props.reelStyle,
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': props.ariaLabel,
        });
    }

    const containerRef = ref<HTMLElement | null>(null);
    const measuredSize = ref<[number, number]>([0, 0]);

    const liveText = ref('');
    let isFirstRender = true;

    const isAutoSize = () => props.size === undefined;
    const resolvedSize = (): [number, number] =>
      isAutoSize() ? measuredSize.value : props.size!;

    const transitionFn = () => props.transition ?? slideTransition;
    const keyExtractorFn = () => props.keyExtractor ?? defaultKeyExtractor;

    const axisValue = shallowRef(0);

    const controller = createSliderController(
      {
        count: props.count,
        initialIndex: props.initialIndex,
        direction: props.direction,
        loop: props.loop,
        transitionDuration: props.transitionDuration,
        swipeDistanceFactor: props.swipeDistanceFactor,
        rangeExtractor: props.rangeExtractor,
        enableWheel: props.enableWheel,
        wheelDebounceMs: props.wheelDebounceMs,
        enableGestures: props.enableGestures,
        enableNavKeys: props.enableNavKeys,
      },
      {
        onBeforeChange: (index, nextIndex, rangeIndex) => {
          emit('beforeChange', index, nextIndex, rangeIndex);
        },
        onAfterChange: (index, rangeIndex) => {
          if (!isFirstRender) {
            liveText.value = `Slide ${index + 1} of ${props.count}`;
          }
          isFirstRender = false;
          emit('afterChange', index, rangeIndex);
        },
        onDragStart: (index) => emit('slideDragStart', index),
        onDragEnd: (index) => emit('slideDragEnd', index),
        onDragCanceled: (index) => emit('slideDragCanceled', index),
        onTap: (e) => emit('tap', e),
        onDoubleTap: (e) => emit('doubleTap', e),
        onLongPress: (e) => emit('longPress', e),
        onLongPressEnd: (e) => emit('longPressEnd', e),
        // Only forward to controller when consumer provides a handler —
        // core treats its presence as an override of default navigation.
        ...(props.onNavKeyPress ? { onNavKeyPress: props.onNavKeyPress } : {}),
      },
    );

    const countSignal = createSignal(props.count);
    const reelContextValue: ReelContextValue = {
      index: controller.state.index,
      count: countSignal,
      goTo: controller.goTo,
    };
    provide(RK_REEL_KEY, reelContextValue);

    const visibleIndexes = toVueRef(controller.state.indexes);

    const disposables = createDisposableList();
    let cancelAnimation: (() => void) | null = null;

    disposables.push(
      controller.state.axisValue.observe(() => {
        const { value, duration, done } = controller.state.axisValue.value;

        if (cancelAnimation) {
          cancelAnimation();
          cancelAnimation = null;
        }

        if (duration > 0) {
          cancelAnimation = animate({
            from: axisValue.value,
            to: value,
            duration,
            onUpdate: (v) => {
              axisValue.value = v;
            },
            onComplete: () => {
              cancelAnimation = null;
              done?.();
            },
          });
          return;
        }

        axisValue.value = value;
        done?.();
      }),
    );

    watch(
      [
        () => props.count,
        () => props.direction,
        () => props.loop,
        () => props.transitionDuration,
        () => props.swipeDistanceFactor,
        () => props.rangeExtractor,
        () => props.enableGestures,
        () => props.enableNavKeys,
        () => props.enableWheel,
      ],
      () => {
        countSignal.value = props.count;
        controller.updateConfig({
          count: props.count,
          direction: props.direction,
          loop: props.loop,
          transitionDuration: props.transitionDuration,
          swipeDistanceFactor: props.swipeDistanceFactor,
          enableGestures: props.enableGestures,
          enableNavKeys: props.enableNavKeys,
          enableWheel: props.enableWheel,
          ...(props.rangeExtractor
            ? { rangeExtractor: props.rangeExtractor }
            : {}),
        });
      },
    );

    watch(
      () => resolvedSize(),
      (newSize) => {
        const primary =
          props.direction === 'horizontal' ? first(newSize) : last(newSize);
        controller.setPrimarySize(primary);
      },
      { flush: 'post' },
    );

    let resizeObserver: ResizeObserver | null = null;

    const startResizeObserver = () => {
      stopResizeObserver();
      const el = containerRef.value;
      if (!el) return;
      resizeObserver = new ResizeObserver(() => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w > 0 && h > 0) {
          const prev = measuredSize.value;
          if (prev[0] !== w || prev[1] !== h) {
            measuredSize.value = [w, h];
          }
        }
      });
      resizeObserver.observe(el);
    };

    const stopResizeObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };

    watch(
      () => props.size,
      () => {
        if (isAutoSize()) {
          startResizeObserver();
        } else {
          stopResizeObserver();
        }
      },
    );

    onMounted(() => {
      if (!containerRef.value) return;

      const size = resolvedSize();
      const primary =
        props.direction === 'horizontal' ? first(size) : last(size);
      controller.setPrimarySize(primary);

      controller.attach(containerRef.value);
      controller.observe();

      if (isAutoSize()) {
        startResizeObserver();
      }
    });

    onUnmounted(() => {
      if (cancelAnimation) {
        cancelAnimation();
        cancelAnimation = null;
      }
      disposables.dispose();
      controller.unobserve();
      controller.detach();
      stopResizeObserver();
    });

    expose({
      next: () => controller.next(),
      prev: () => controller.prev(),
      goTo: (index: number, anim?: boolean) => controller.goTo(index, anim),
      adjust: () => controller.adjust(),
      observe: () => controller.observe(),
      unobserve: () => controller.unobserve(),
    } satisfies ReelExpose);

    return () => {
      const size = resolvedSize();
      const isHorizontal = props.direction === 'horizontal';
      const primarySize = isHorizontal ? first(size) : last(size);
      const hasMeasured = !isAutoSize() || primarySize > 0;
      const currentTransitionFn = transitionFn();
      const currentKeyExtractor = keyExtractorFn();

      const rootStyle: Record<string, string | number> = {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        ...(isAutoSize()
          ? { width: '100%', height: '100%' }
          : { width: `${first(size)}px`, height: `${last(size)}px` }),
        ...(props.reelStyle ?? {}),
      };

      const children: VNode[] = [];

      const slideWrapperStyle = {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      };

      const itemSlot = slots['item'];
      if (hasMeasured && itemSlot) {
        const idxs = visibleIndexes.value;
        const currentRangeIndex = controller.getRangeIndex();
        const slideNodes: VNode[] = [];

        for (let i = 0; i < idxs.length; i++) {
          const styles = currentTransitionFn(
            axisValue.value,
            i,
            currentRangeIndex,
            primarySize,
            props.direction,
          );

          const slideStyle: Record<string, string | number> = {
            position: 'absolute',
            top: '0',
            left: '0',
            [isHorizontal ? 'width' : 'height']: `${primarySize}px`,
            [isHorizontal ? 'height' : 'width']: '100%',
            backfaceVisibility: 'hidden',
          };

          if (styles.transform) slideStyle['transform'] = styles.transform;
          if (styles.transformOrigin)
            slideStyle['transformOrigin'] = styles.transformOrigin;
          if (styles.opacity !== undefined)
            slideStyle['opacity'] = styles.opacity;
          if (styles.zIndex !== undefined) slideStyle['zIndex'] = styles.zIndex;

          const activeIndex = controller.state.index.value;
          const isActive = idxs[i] === activeIndex;

          slideNodes.push(
            h(
              'div',
              {
                key: currentKeyExtractor(idxs[i], i),
                'data-index': idxs[i],
                role: 'tabpanel',
                inert: !isActive ? true : undefined,
                style: slideStyle,
              },
              itemSlot({
                index: idxs[i],
                indexInRange: i,
                size,
              }),
            ),
          );
        }

        children.push(h('div', { style: slideWrapperStyle }, slideNodes));
      } else {
        children.push(h('div', { style: slideWrapperStyle }));
      }

      children.push(
        h(
          'div',
          {
            'aria-live': 'polite',
            'aria-atomic': 'true',
            style: {
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: '0',
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: '0',
            },
          },
          liveText.value,
        ),
      );

      const defaultSlot = slots['default'];
      if (defaultSlot) {
        children.push(...(defaultSlot() as VNode[]));
      }

      return h(
        'div',
        {
          ref: containerRef,
          class: props.reelClass,
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': props.ariaLabel,
          style: rootStyle,
        },
        children,
      );
    };
  },
});

export { defaultRangeExtractor };

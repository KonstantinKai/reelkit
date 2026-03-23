import {
  defineComponent,
  h,
  ref,
  provide,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
  type VNode,
} from 'vue';
import {
  createSliderController,
  createSignal,
  animate,
  first,
  last,
  type RangeExtractor,
  type SliderDirection,
} from '@reelkit/core';
import { RK_REEL_KEY, type ReelContextValue } from '../context/ReelContext';

export type ReelExpose = {
  next: () => void;
  prev: () => void;
  goTo: (index: number, animate?: boolean) => Promise<void>;
  adjust: () => void;
  observe: () => void;
  unobserve: () => void;
};

export const Reel = defineComponent({
  name: 'Reel',
  props: {
    count: { type: Number, required: true },
    initialIndex: { type: Number, default: 0 },
    direction: {
      type: String as PropType<SliderDirection>,
      default: 'vertical',
    },
    loop: { type: Boolean, default: false },
    transitionDuration: { type: Number, default: 300 },
    swipeDistanceFactor: { type: Number, default: 0.12 },
    rangeExtractor: {
      type: Function as PropType<RangeExtractor>,
      default: undefined,
    },
    size: {
      type: Array as unknown as PropType<[number, number]>,
      default: undefined,
    },
    useNavKeys: { type: Boolean, default: true },
    enableWheel: { type: Boolean, default: false },
    wheelDebounceMs: { type: Number, default: 200 },
  },
  emits: [
    'beforeChange',
    'afterChange',
    'slideDragStart',
    'slideDragEnd',
    'slideDragCanceled',
  ],
  setup(props, { emit, slots, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const measuredSize = ref<[number, number]>([0, 0]);

    const isAutoSize = () => props.size === undefined;
    const resolvedSize = (): [number, number] =>
      isAutoSize() ? measuredSize.value : props.size!;

    const axisValue = ref(0);
    const visibleIndexes = ref<number[]>([]);

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
      },
      {
        onBeforeChange: (index, nextIndex, rangeIndex) => {
          emit('beforeChange', index, nextIndex, rangeIndex);
        },
        onAfterChange: (index, rangeIndex) => {
          emit('afterChange', index, rangeIndex);
        },
        onDragStart: (index) => emit('slideDragStart', index),
        onDragEnd: (index) => emit('slideDragEnd', index),
        onDragCanceled: (index) => emit('slideDragCanceled', index),
      },
    );

    const countSignal = createSignal(props.count);
    const reelContextValue: ReelContextValue = {
      index: controller.state.index,
      count: countSignal,
      goTo: controller.goTo,
    };
    provide(RK_REEL_KEY, reelContextValue);

    const disposers: (() => void)[] = [];
    let cancelAnimation: (() => void) | null = null;

    visibleIndexes.value = controller.state.indexes.value;
    disposers.push(
      controller.state.indexes.observe(() => {
        visibleIndexes.value = controller.state.indexes.value;
      }),
    );

    disposers.push(
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
              setTimeout(() => done?.(), 0);
            },
          });
          return;
        }

        axisValue.value = value;
        if (done) {
          setTimeout(() => done(), 0);
        }
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
      ],
      () => {
        countSignal.value = props.count;
        controller.updateConfig({
          count: props.count,
          direction: props.direction,
          loop: props.loop,
          transitionDuration: props.transitionDuration,
          swipeDistanceFactor: props.swipeDistanceFactor,
          rangeExtractor: props.rangeExtractor,
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
    );

    watch(
      () => props.useNavKeys,
      (useNav) => {
        if (useNav) controller.observe();
        else controller.unobserve();
      },
    );

    let resizeObserver: ResizeObserver | null = null;

    onMounted(() => {
      if (!containerRef.value) return;

      const size = resolvedSize();
      const primary =
        props.direction === 'horizontal' ? first(size) : last(size);
      controller.setPrimarySize(primary);

      controller.attach(containerRef.value);
      if (props.useNavKeys) {
        controller.observe();
      }

      if (isAutoSize()) {
        const el = containerRef.value;
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
      }
    });

    onUnmounted(() => {
      if (cancelAnimation) {
        cancelAnimation();
        cancelAnimation = null;
      }
      disposers.forEach((d) => d());
      controller.unobserve();
      controller.detach();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
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

      const rootStyle: Record<string, string> = {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      };

      if (!isAutoSize()) {
        rootStyle['width'] = `${first(size)}px`;
        rootStyle['height'] = `${last(size)}px`;
      }

      const children: VNode[] = [];

      const itemSlot = slots['item'];
      if (hasMeasured && itemSlot) {
        const idxs = visibleIndexes.value;
        const slideNodes: VNode[] = [];

        for (let i = 0; i < idxs.length; i++) {
          slideNodes.push(
            h(
              'div',
              { key: idxs[i], 'data-index': idxs[i] },
              itemSlot({
                index: idxs[i],
                indexInRange: i,
                size,
              }),
            ),
          );
        }

        children.push(
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                display: 'flex',
                transform: `translate${isHorizontal ? 'X' : 'Y'}(${axisValue.value}px)`,
                flexDirection: isHorizontal ? 'row' : 'column',
                [isHorizontal ? 'width' : 'height']:
                  `${idxs.length * primarySize}px`,
                [isHorizontal ? 'height' : 'width']: '100%',
              },
            },
            slideNodes,
          ),
        );
      }

      const defaultSlot = slots['default'];
      if (defaultSlot) {
        children.push(...(defaultSlot() as VNode[]));
      }

      return h('div', { ref: containerRef, style: rootStyle }, children);
    };
  },
});

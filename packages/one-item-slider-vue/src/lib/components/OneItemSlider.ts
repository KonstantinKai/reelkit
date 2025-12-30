import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
  type SlotsType,
} from 'vue';
import {
  createSliderController,
  animate,
  type SliderController,
  type SliderDirection,
  type RangeExtractor,
} from '@kdevsoft/one-item-slider-core';

export type OneItemSliderSlotProps = {
  index: number;
  axisValue: number;
  indexes: number[];
};

export type OneItemSliderExpose = {
  next: () => Promise<void>;
  prev: () => Promise<void>;
  goTo: (index: number, animate?: boolean) => Promise<void>;
  adjust: () => void;
};

export const OneItemSlider = defineComponent({
  name: 'OneItemSlider',
  props: {
    count: {
      type: Number,
      required: true,
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String as PropType<SliderDirection>,
      default: 'vertical',
    },
    loop: {
      type: Boolean,
      default: false,
    },
    transitionDuration: {
      type: Number,
      default: 300,
    },
    swipeDistanceFactor: {
      type: Number,
      default: 0.15,
    },
    rangeExtractor: {
      type: Function as PropType<RangeExtractor>,
      default: undefined,
    },
    size: {
      type: Array as unknown as PropType<[number, number]>,
      required: true,
    },
    enableGestures: {
      type: Boolean,
      default: true,
    },
    enableKeyboard: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:index', 'indexChange'],
  slots: Object as SlotsType<{
    default: OneItemSliderSlotProps;
  }>,
  setup(props, { emit, slots, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const controllerRef = ref<SliderController | null>(null);

    const index = ref(props.initialIndex);
    const axisValue = ref(0);
    const indexes = ref<number[]>([]);

    const disposers: (() => void)[] = [];

    onMounted(() => {
      if (!containerRef.value) return;

      const primarySize = props.direction === 'vertical' ? props.size[1] : props.size[0];

      const controller = createSliderController(
        {
          count: props.count,
          initialIndex: props.initialIndex,
          direction: props.direction,
          loop: props.loop,
          transitionDuration: props.transitionDuration,
          swipeDistanceFactor: props.swipeDistanceFactor,
          rangeExtractor: props.rangeExtractor,
        },
        {
          onAfterChange: (newIndex: number) => {
            emit('update:index', newIndex);
            emit('indexChange', newIndex);
          },
        }
      );

      controller.setPrimarySize(primarySize);
      controller.attach(containerRef.value);

      if (props.enableGestures || props.enableKeyboard) {
        controller.observe();
      }

      // Initialize state from signals
      index.value = controller.state.index.value;
      axisValue.value = controller.state.axisValue.value.value;
      indexes.value = controller.state.indexes.value;

      // Animation state
      let cancelAnimation: (() => void) | null = null;

      // Subscribe to state changes using observe
      disposers.push(
        controller.state.index.observe(() => {
          index.value = controller.state.index.value;
        })
      );

      disposers.push(
        controller.state.axisValue.observe(() => {
          const { value, duration, done } = controller.state.axisValue.value;

          // Cancel any in-progress animation
          if (cancelAnimation) {
            cancelAnimation();
            cancelAnimation = null;
          }

          if (duration > 0) {
            // Run animation
            cancelAnimation = animate({
              from: axisValue.value,
              to: value,
              duration,
              onUpdate: (v) => {
                axisValue.value = v;
              },
              onComplete: () => {
                cancelAnimation = null;
                // Move done to next task cycle
                setTimeout(() => done?.(), 0);
              },
            });
            return;
          }

          // No animation, just set value immediately
          axisValue.value = value;
          // Still need to call done if provided
          if (done) {
            setTimeout(() => done(), 0);
          }
        })
      );

      disposers.push(
        controller.state.indexes.observe(() => {
          indexes.value = controller.state.indexes.value;
        })
      );

      // Cleanup animation on unmount
      disposers.push(() => {
        if (cancelAnimation) {
          cancelAnimation();
          cancelAnimation = null;
        }
      });

      controllerRef.value = controller;
    });

    onUnmounted(() => {
      disposers.forEach((d) => d());
      controllerRef.value?.dispose();
      controllerRef.value = null;
    });

    watch(
      () => props.size,
      (newSize: [number, number]) => {
        const primarySize = props.direction === 'vertical' ? newSize[1] : newSize[0];
        controllerRef.value?.setPrimarySize(primarySize);
      }
    );

    const next = async () => {
      await controllerRef.value?.next();
    };

    const prev = async () => {
      await controllerRef.value?.prev();
    };

    const goTo = async (targetIndex: number, animate = false) => {
      await controllerRef.value?.goTo(targetIndex, animate);
    };

    const adjust = () => {
      controllerRef.value?.adjust();
    };

    expose({ next, prev, goTo, adjust });

    return () => {
      const slotProps: OneItemSliderSlotProps = {
        index: index.value,
        axisValue: axisValue.value,
        indexes: indexes.value,
      };

      return h(
        'div',
        {
          ref: containerRef,
          style: {
            position: 'relative',
            overflow: 'hidden',
            width: `${props.size[0]}px`,
            height: `${props.size[1]}px`,
            touchAction: 'none',
            userSelect: 'none',
          },
        },
        slots.default?.(slotProps)
      );
    };
  },
});

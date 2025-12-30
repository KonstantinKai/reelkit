import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  createSliderController,
  type SliderConfig,
  type SliderController,
} from '@reelkit/core';

export type UseSliderOptions = Omit<SliderConfig, 'count'> & {
  count: number;
  onIndexChange?: (index: number) => void;
};

export type UseSliderReturn = {
  index: Ref<number>;
  axisValue: Ref<number>;
  indexes: Ref<number[]>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  goTo: (index: number, animate?: boolean) => Promise<void>;
  adjust: () => void;
  setPrimarySize: (size: number) => void;
  attach: (element: HTMLElement) => void;
  detach: () => void;
  observe: () => void;
  unobserve: () => void;
};

export const useSlider = (options: UseSliderOptions): UseSliderReturn => {
  const {
    count,
    initialIndex = 0,
    direction = 'vertical',
    loop = false,
    transitionDuration = 300,
    swipeDistanceFactor = 0.15,
    rangeExtractor,
    onIndexChange,
  } = options;

  const index = ref(initialIndex);
  const axisValue = ref(0);
  const indexes = ref<number[]>([]);
  const controllerRef = ref<SliderController | null>(null);
  const disposers: (() => void)[] = [];

  onMounted(() => {
    const controller = createSliderController(
      {
        count,
        initialIndex,
        direction,
        loop,
        transitionDuration,
        swipeDistanceFactor,
        rangeExtractor,
      },
      {
        onAfterChange: (newIndex: number) => {
          onIndexChange?.(newIndex);
        },
      }
    );

    // Subscribe to state changes using observe
    disposers.push(
      controller.state.index.observe(() => {
        index.value = controller.state.index.value;
      })
    );

    disposers.push(
      controller.state.axisValue.observe(() => {
        axisValue.value = controller.state.axisValue.value.value;
      })
    );

    disposers.push(
      controller.state.indexes.observe(() => {
        indexes.value = controller.state.indexes.value;
      })
    );

    controllerRef.value = controller;
  });

  onUnmounted(() => {
    disposers.forEach((d) => d());
    controllerRef.value?.dispose();
    controllerRef.value = null;
  });

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

  const setPrimarySize = (size: number) => {
    controllerRef.value?.setPrimarySize(size);
  };

  const attach = (element: HTMLElement) => {
    controllerRef.value?.attach(element);
  };

  const detach = () => {
    controllerRef.value?.detach();
  };

  const observe = () => {
    controllerRef.value?.observe();
  };

  const unobserve = () => {
    controllerRef.value?.unobserve();
  };

  return {
    index,
    axisValue,
    indexes,
    next,
    prev,
    goTo,
    adjust,
    setPrimarySize,
    attach,
    detach,
    observe,
    unobserve,
  };
};

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  createGestureController,
  type GestureControllerConfig,
  type GestureControllerEvents,
  type GestureController,
} from '@reelkit/core';

export type UseGesturesOptions = {
  config?: GestureControllerConfig;
  events?: GestureControllerEvents;
};

export const useGestures = (
  elementRef: Ref<HTMLElement | null>,
  options: UseGesturesOptions = {},
) => {
  const controllerRef = ref<GestureController | null>(null);

  const { config = {}, events = {} } = options;

  onMounted(() => {
    if (!elementRef.value) return;

    const controller = createGestureController(config, events);

    controller.attach(elementRef.value);
    controller.observe();
    controllerRef.value = controller;
  });

  onUnmounted(() => {
    controllerRef.value?.detach();
    controllerRef.value = null;
  });

  const updateEvents = (newEvents: Partial<GestureControllerEvents>) => {
    controllerRef.value?.updateEvents(newEvents);
  };

  return { updateEvents };
};

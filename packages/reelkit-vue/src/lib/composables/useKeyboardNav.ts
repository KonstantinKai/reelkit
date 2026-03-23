import { onMounted, onUnmounted, ref } from 'vue';
import {
  createKeyboardController,
  type KeyboardControllerConfig,
  type NavKey,
  type KeyboardController,
} from '@reelkit/core';

export type UseKeyboardNavOptions = KeyboardControllerConfig & {
  onKeyPress: (key: NavKey) => void;
};

export const useKeyboardNav = (options: UseKeyboardNavOptions) => {
  const controllerRef = ref<KeyboardController | null>(null);

  const { filter, throttleMs, onKeyPress } = options;

  onMounted(() => {
    const controller = createKeyboardController(
      { filter, throttleMs },
      { onKeyPress },
    );

    controller.attach();
    controllerRef.value = controller;
  });

  onUnmounted(() => {
    controllerRef.value?.detach();
    controllerRef.value = null;
  });
};

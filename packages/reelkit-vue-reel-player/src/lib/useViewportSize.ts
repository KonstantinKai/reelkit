import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import {
  fitAspectRatio,
  getViewportSize,
  observeViewportSize,
  type Disposer,
} from '@reelkit/vue';

/**
 * Reactive `[width, height]` sized for an overlay that keeps the configured
 * aspect ratio on desktop and fills the viewport on mobile (768px wide and
 * narrower). A zero, negative or non-finite ratio falls back to 9/16.
 *
 * Updates on `window.resize`. Safe to call during SSR (returns `[0, 0]` until mounted).
 */
export function useViewportSize(
  aspectRatio: Ref<number | undefined>,
): Ref<[number, number]> {
  const size = ref<[number, number]>([0, 0]);

  const update = () => {
    const next = fitAspectRatio(getViewportSize(), aspectRatio.value);
    if (next[0] !== size.value[0] || next[1] !== size.value[1]) {
      size.value = next;
    }
  };

  let disposeResize: Disposer | null = null;

  onMounted(() => {
    update();
    disposeResize = observeViewportSize(update);
    // Watch is registered after mount so the initial sync above isn't
    // immediately followed by a duplicate fire from the watcher.
    watch(aspectRatio, update, { flush: 'post' });
  });

  onUnmounted(() => {
    disposeResize?.();
    disposeResize = null;
  });

  return size;
}

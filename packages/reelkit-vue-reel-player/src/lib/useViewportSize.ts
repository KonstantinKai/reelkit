import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import { observeDomEvent } from '@reelkit/vue';

const _kDefaultAspectRatio = 9 / 16;
const _kMobileBreakpoint = 768;

/**
 * Reactive `[width, height]` sized for an overlay that keeps the configured
 * aspect ratio on desktop and fills the viewport on mobile (< 768px).
 *
 * Updates on `window.resize`. Safe to call during SSR (returns `[0, 0]` until mounted).
 */
export function useViewportSize(
  aspectRatio: Ref<number | undefined>,
): Ref<[number, number]> {
  const size = ref<[number, number]>([0, 0]);

  const compute = (): [number, number] => {
    if (typeof window === 'undefined') return [0, 0];
    const ratio = aspectRatio.value ?? _kDefaultAspectRatio;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w < _kMobileBreakpoint) return [w, h];
    let width = h * ratio;
    let height = h;
    if (width > w) {
      width = w;
      height = w / ratio;
    }
    return [width, height];
  };

  const update = () => {
    const next = compute();
    if (next[0] !== size.value[0] || next[1] !== size.value[1]) {
      size.value = next;
    }
  };

  let disposeResize: (() => void) | null = null;

  onMounted(() => {
    update();
    disposeResize = observeDomEvent(window, 'resize', update);
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

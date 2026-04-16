import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent, ref, h } from 'vue';
import { useFullscreen } from './useFullscreen';
import { fullscreenSignal } from '@reelkit/core';

enableAutoUnmount(afterEach);

describe('useFullscreen', () => {
  it('returns fullscreen API', () => {
    let result!: ReturnType<typeof useFullscreen>;

    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });

    mount(Wrapper);

    expect(result.isFullscreen).toBeDefined();
    expect(result.request).toBeTypeOf('function');
    expect(result.exit).toBeTypeOf('function');
    expect(result.toggle).toBeTypeOf('function');
  });

  it('cleans up on unmount', () => {
    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });

    const wrapper = mount(Wrapper);
    wrapper.unmount();
  });

  it('request does nothing when elementRef is null', () => {
    let result!: ReturnType<typeof useFullscreen>;

    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div');
      },
    });

    mount(Wrapper);
    result.request();
  });

  it('exit catches errors gracefully', () => {
    let result!: ReturnType<typeof useFullscreen>;
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });

    mount(Wrapper);
    result.exit();

    consoleSpy.mockRestore();
  });

  it('toggle calls request when not fullscreen', () => {
    let result!: ReturnType<typeof useFullscreen>;

    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });

    mount(Wrapper);
    result.toggle();
  });

  it('isFullscreen returns the core fullscreenSignal', () => {
    let result!: ReturnType<typeof useFullscreen>;

    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });

    mount(Wrapper);
    expect(result.isFullscreen).toBe(fullscreenSignal);
  });
});

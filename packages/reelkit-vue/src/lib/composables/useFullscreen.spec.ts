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

  it('request awaits exit before requesting when already fullscreen', async () => {
    const calls: string[] = [];
    const fakeFullscreenEl = document.createElement('div');
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: function () {
        calls.push('request');
        return Promise.resolve();
      },
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: function () {
        calls.push('exit');
        return Promise.resolve();
      },
    });
    // core's exitFullscreen guards with `!checkFullscreen()`; stub the DOM so
    // the check returns a truthy element and exit is actually invoked.
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fakeFullscreenEl,
    });

    let result!: ReturnType<typeof useFullscreen>;
    const Wrapper = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null);
        result = useFullscreen({ elementRef });
        return () => h('div', { ref: elementRef });
      },
    });
    mount(Wrapper);

    const prev = fullscreenSignal.value;
    fullscreenSignal.value = true;

    await result.request();

    expect(calls).toEqual(['exit', 'request']);

    fullscreenSignal.value = prev;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .requestFullscreen;
    delete (document as unknown as Record<string, unknown>).exitFullscreen;
    delete (document as unknown as Record<string, unknown>).fullscreenElement;
  });
});

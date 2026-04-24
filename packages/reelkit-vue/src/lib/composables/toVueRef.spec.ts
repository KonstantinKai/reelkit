import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { createSignal } from '@reelkit/core';
import { toVueRef } from './toVueRef';

describe('toVueRef', () => {
  it('mirrors the source value into a Vue ref', async () => {
    const source = createSignal(0);
    let lastSeen = -1;

    const Host = defineComponent({
      setup() {
        const mirrored = toVueRef(source);
        return () => {
          lastSeen = mirrored.value;
          return h('span', String(mirrored.value));
        };
      },
    });

    const wrapper = mount(Host);
    expect(lastSeen).toBe(0);

    source.value = 42;
    await wrapper.vm.$nextTick();
    expect(lastSeen).toBe(42);

    source.value = 7;
    await wrapper.vm.$nextTick();
    expect(lastSeen).toBe(7);
  });

  it('stops updating after unmount (listener disposed)', async () => {
    const source = createSignal(0);
    let renderCount = 0;

    const Host = defineComponent({
      setup() {
        const mirrored = toVueRef(source);
        return () => {
          renderCount++;
          return h('span', String(mirrored.value));
        };
      },
    });

    const wrapper = mount(Host);
    const initialRenderCount = renderCount;

    source.value = 1;
    await wrapper.vm.$nextTick();
    expect(renderCount).toBeGreaterThan(initialRenderCount);

    const beforeUnmountCount = renderCount;
    wrapper.unmount();

    source.value = 2;
    source.value = 3;
    await new Promise((r) => setTimeout(r, 0));
    expect(renderCount).toBe(beforeUnmountCount);
  });

  it('picks up a resync that fires while the first observer subscribes', () => {
    // A lazy signal (e.g. core `fullscreenSignal`) may refresh its `.value`
    // inside `observe()` when the observer count transitions from 0 → 1.
    // `toVueRef` must surface that post-subscribe value, not the
    // pre-subscribe snapshot.
    const source = createSignal(true);
    let observers = 0;
    const lazy = {
      get value() {
        return source.value;
      },
      set value(v: boolean) {
        source.value = v;
      },
      observe(listener: () => void) {
        observers++;
        if (observers === 1) {
          // Simulates DOM state that diverged during the lazy window.
          source.value = false;
        }
        const dispose = source.observe(listener);
        return () => {
          dispose();
          observers--;
        };
      },
    };

    let captured: boolean | undefined;
    const Host = defineComponent({
      setup() {
        const mirrored = toVueRef(lazy);
        captured = mirrored.value;
        return () => h('span', String(mirrored.value));
      },
    });

    mount(Host);
    expect(captured).toBe(false);
  });
});

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
});

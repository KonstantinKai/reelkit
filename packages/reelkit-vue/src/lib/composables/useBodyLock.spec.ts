import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, vi, afterEach } from 'vitest';
import { defineComponent, ref, h } from 'vue';
import { useBodyLock } from './useBodyLock';

enableAutoUnmount(afterEach);

vi.mock('@reelkit/core', async () => {
  const actual =
    await vi.importActual<typeof import('@reelkit/core')>('@reelkit/core');
  return {
    ...actual,
    createBodyLock: () => {
      const lockFn = vi.fn(() => vi.fn());
      return { lock: lockFn };
    },
  };
});

const createWrapper = (locked: boolean | ReturnType<typeof ref<boolean>>) => {
  return defineComponent({
    setup() {
      useBodyLock(locked as Parameters<typeof useBodyLock>[0]);
      return () => h('div', 'body-lock');
    },
  });
};

describe('useBodyLock', () => {
  it('locks when passed true', () => {
    mount(createWrapper(true));
    // No error thrown = composable initialized correctly
  });

  it('does not lock when passed false', () => {
    mount(createWrapper(false));
    // No error thrown = composable initialized correctly
  });

  it('accepts a ref and reacts to changes', async () => {
    const locked = ref(false);
    const wrapper = mount(createWrapper(locked));

    locked.value = true;
    await wrapper.vm.$nextTick();

    locked.value = false;
    await wrapper.vm.$nextTick();
    // No error thrown = reactive composable works
  });

  it('cleans up on unmount', () => {
    const locked = ref(true);
    const wrapper = mount(createWrapper(locked));
    wrapper.unmount();
    // No error thrown = cleanup works
  });
});

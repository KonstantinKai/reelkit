import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { defineComponent, ref, h } from 'vue';
import { sharedBodyLock } from '@reelkit/core';
import { useBodyLock } from './useBodyLock';

enableAutoUnmount(afterEach);

const createWrapper = (locked: boolean | ReturnType<typeof ref<boolean>>) => {
  return defineComponent({
    setup() {
      useBodyLock(locked as Parameters<typeof useBodyLock>[0]);
      return () => h('div', 'body-lock');
    },
  });
};

describe('useBodyLock', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(vi.fn());
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    document.body.style.overscrollBehavior = '';
  });

  afterEach(() => {
    while (sharedBodyLock.locked) sharedBodyLock.unlock();
    vi.restoreAllMocks();
  });

  it('locks when passed true', () => {
    mount(createWrapper(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not lock when passed false', () => {
    mount(createWrapper(false));
    expect(document.body.style.overflow).toBe('');
  });

  it('accepts a ref and reacts to changes', async () => {
    const locked = ref(false);
    const wrapper = mount(createWrapper(locked));

    locked.value = true;
    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    locked.value = false;
    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('');
  });

  it('cleans up on unmount', () => {
    const locked = ref(true);
    const wrapper = mount(createWrapper(locked));
    expect(document.body.style.overflow).toBe('hidden');
    wrapper.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('shares the lock across concurrent component instances', () => {
    const a = mount(createWrapper(true));
    expect(sharedBodyLock.locked).toBe(true);

    const b = mount(createWrapper(true));
    expect(sharedBodyLock.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    a.unmount();
    // b still holds — body must remain locked
    expect(sharedBodyLock.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    b.unmount();
    expect(sharedBodyLock.locked).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });
});

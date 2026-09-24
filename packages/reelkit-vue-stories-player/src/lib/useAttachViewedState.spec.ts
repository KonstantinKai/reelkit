import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, shallowRef } from 'vue';
import type { StoriesViewedStateController } from '@reelkit/stories-core';
import { useAttachViewedState } from './useAttachViewedState';

const createController = () => {
  const release = vi.fn();
  const attach = vi.fn(() => release);
  return {
    viewed: { attach } as unknown as StoriesViewedStateController,
    attach,
    release,
  };
};

const mountWith = (initial: StoriesViewedStateController | undefined) => {
  const current = shallowRef(initial);
  const wrapper = mount(
    defineComponent({
      setup() {
        useAttachViewedState(() => current.value);
        return () => null;
      },
    }),
  );
  return { wrapper, current };
};

describe('useAttachViewedState', () => {
  it('attaches the controller while mounted and lets go on unmount', () => {
    const { viewed, attach, release } = createController();
    const { wrapper } = mountWith(viewed);

    expect(attach).toHaveBeenCalledOnce();
    expect(release).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(release).toHaveBeenCalledOnce();
  });

  it('moves the attachment to a controller swapped in', async () => {
    const first = createController();
    const second = createController();
    const { current } = mountWith(first.viewed);

    current.value = second.viewed;
    await nextTick();

    expect(first.release).toHaveBeenCalledOnce();
    expect(second.attach).toHaveBeenCalledOnce();
  });

  it('does nothing without a controller', () => {
    expect(() => mountWith(undefined).wrapper.unmount()).not.toThrow();
  });
});

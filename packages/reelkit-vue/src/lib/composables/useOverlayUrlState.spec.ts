import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, expect, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import {
  urlIndexKey,
  indexCodec,
  type UrlAdapter,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/core';
import {
  useOverlayUrlState,
  type OverlayUrlStateOptions,
} from './useOverlayUrlState';

/** In-memory adapter: a test moves the URL and lets the composable react. */
function fakeAdapter(initialQuery = '') {
  let query = initialQuery;
  const listeners = new Set<() => void>();
  const adapter: UrlAdapter = {
    read: () => query,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    push: (to) => {
      query = to;
      listeners.forEach((fn) => fn());
    },
    replace: (to) => {
      query = to;
    },
    getState: () => null,
    goBack: () => undefined,
  };
  return { adapter, listeners, query: () => query };
}

function mountHook<Id = number>(
  options: OverlayUrlStateOptions<Id>,
): { wrapper: ReturnType<typeof mount>; get: () => UrlStateController } {
  let controller!: UrlStateController;
  const wrapper = mount(
    defineComponent({
      setup() {
        controller = useOverlayUrlState(options);
        return () => h('div');
      },
    }),
  );
  return { wrapper, get: () => controller };
}

enableAutoUnmount(afterEach);

describe('useOverlayUrlState', () => {
  it('opens at the index the parameter names, bounded by the index locator', async () => {
    const { adapter } = fakeAdapter('?photo=1');
    const { get } = mountHook({
      param: 'photo',
      adapter,
      ...urlIndexKey(() => 3),
    });

    await nextTick();
    expect(get().position.value).toBe(1);
  });

  it('drops a parameter past the live count and heals the url', async () => {
    const { adapter, query } = fakeAdapter('?photo=99');
    const { get } = mountHook({
      param: 'photo',
      adapter,
      ...urlIndexKey(() => 3),
    });

    await nextTick();
    expect(get().position.value).toBeNull();
    expect(query()).not.toContain('photo=99');
  });

  it('detaches the adapter listener on unmount', async () => {
    const { adapter, listeners } = fakeAdapter('?photo=0');
    const { wrapper } = mountHook({
      param: 'photo',
      adapter,
      ...urlIndexKey(() => 1),
    });

    await nextTick();
    expect(listeners.size).toBe(1);

    wrapper.unmount();
    expect(listeners.size).toBe(0);
  });

  it('passes the supplied locator through to the controller as-is', async () => {
    const { adapter } = fakeAdapter('?photo=1');
    // A locator that maps an id to a fixed slot proves the composable wraps
    // nothing — the controller resolves through exactly what was handed in.
    const locator: UrlLocator<number> = {
      locate: () => 2,
      identify: (index) => index,
    };
    const { get } = mountHook({
      param: 'photo',
      adapter,
      codec: indexCodec,
      locator,
    });

    await nextTick();
    expect(get().position.value).toBe(2);
  });
});

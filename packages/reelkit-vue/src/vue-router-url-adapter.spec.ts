import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h, reactive, nextTick } from 'vue';
import type { UrlAdapter } from '@reelkit/core';

// A reactive stand-in for Vue Router's resolved route, plus spies for the
// router's navigation methods. `push`/`replace` resolve on the next tick, the
// same async shape real navigation has.
const route = reactive({ fullPath: '/gallery?photo=1', path: '/gallery' });
const push = vi.fn((to: { path: string; query: Record<string, string> }) => {
  const query = new URLSearchParams(to.query).toString();
  route.fullPath = query ? `${to.path}?${query}` : to.path;
  route.path = to.path;
  return Promise.resolve();
});
const replace = vi.fn(push);
const back = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push, replace, back }),
  useRoute: () => route,
}));

import { useVueRouterUrlAdapter } from './vue-router-url-adapter';

/** Mounts the composable inside a component so its effect scope is real. */
function mountAdapter(): UrlAdapter {
  let adapter!: UrlAdapter;
  mount(
    defineComponent({
      setup() {
        adapter = useVueRouterUrlAdapter();
        return () => h('div');
      },
    }),
  );
  return adapter;
}

beforeEach(() => {
  route.fullPath = '/gallery?photo=1';
  route.path = '/gallery';
  push.mockClear();
  replace.mockClear();
  back.mockClear();
  sessionStorage.clear();
  window.history.replaceState({ position: 0 }, '');
});

describe('useVueRouterUrlAdapter', () => {
  it('reads the query string out of the resolved full path', () => {
    expect(mountAdapter().read()).toBe('?photo=1');
  });

  it('reads an empty string when the route carries no query', () => {
    route.fullPath = '/gallery';
    expect(mountAdapter().read()).toBe('');
  });

  it('notifies subscribers when the resolved path changes', async () => {
    const adapter = mountAdapter();
    const listener = vi.fn();
    adapter.subscribe(listener);

    route.fullPath = '/gallery?photo=2';
    await nextTick();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', async () => {
    const adapter = mountAdapter();
    const listener = vi.fn();
    adapter.subscribe(listener)();

    route.fullPath = '/gallery?photo=2';
    await nextTick();

    expect(listener).not.toHaveBeenCalled();
  });

  it('pushes query params through the router and round-trips its state stamp', async () => {
    const adapter = mountAdapter();
    adapter.push('?photo=3', { open: true });
    await Promise.resolve();

    expect(push).toHaveBeenCalledWith({
      path: '/gallery',
      query: { photo: '3' },
    });
    // The stamp is keyed by the history position the entry landed on.
    expect(adapter.getState()).toEqual({ open: true });
  });

  it('merges successive stamps at the same history position', async () => {
    const adapter = mountAdapter();
    adapter.push('?photo=3', { open: true });
    await Promise.resolve();
    adapter.replace('?photo=3', { seen: 1 });
    await Promise.resolve();

    expect(replace).toHaveBeenCalled();
    expect(adapter.getState()).toEqual({ open: true, seen: 1 });
  });

  it('degrades silently when sessionStorage is unavailable', async () => {
    // Private mode / prerender: touching storage throws. The adapter must
    // swallow it and behave as if no stamp was ever written.
    const unavailable = () => {
      throw new Error('SecurityError');
    };
    vi.stubGlobal('sessionStorage', {
      getItem: unavailable,
      setItem: unavailable,
    });
    const adapter = mountAdapter();

    expect(() => adapter.push('?photo=3', { open: true })).not.toThrow();
    await Promise.resolve();
    expect(adapter.getState()).toBeNull();

    vi.unstubAllGlobals();
  });

  it('steps back through the router', () => {
    mountAdapter().goBack();
    expect(back).toHaveBeenCalled();
  });
});

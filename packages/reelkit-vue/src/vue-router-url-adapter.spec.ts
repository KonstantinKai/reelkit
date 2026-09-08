import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import {
  createUrlStateController,
  urlIndexKey,
  type UrlAdapter,
  type UrlChange,
  type UrlStateController,
} from '@reelkit/core';
import { useVueRouterUrlAdapter } from './vue-router-url-adapter';

// A real Vue Router over jsdom's real History API, so every notification,
// every state round trip, and every back step is the router's own doing
// rather than a mock's.
const Page = defineComponent({ render: () => h('div') });

const createTestRouter = () =>
  createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/gallery', component: Page },
      { path: '/home', component: Page },
    ],
  });

/** Mounts the composable inside a routed component so its scope is real. */
const mountAdapter = async (router: Router, url: string) => {
  await router.push(url);
  await router.isReady();

  let adapter!: UrlAdapter;
  mount(
    defineComponent({
      setup() {
        adapter = useVueRouterUrlAdapter();
        return () => h('div');
      },
    }),
    { global: { plugins: [router] } },
  );

  const changes: Array<UrlChange | undefined> = [];
  adapter.subscribe((change) => changes.push(change));
  return { adapter, changes };
};

const here = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

/** Resolves once the next back or forward step has landed. */
const nextPop = () =>
  new Promise<void>((resolve) =>
    window.addEventListener('popstate', () => resolve(), { once: true }),
  );

/** Lets a navigation the adapter started run to completion. */
const settle = () => new Promise((done) => setTimeout(done, 0));

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('useVueRouterUrlAdapter', () => {
  it('reads the query without the fragment', async () => {
    const { adapter } = await mountAdapter(
      createTestRouter(),
      '/gallery?photo=2#details',
    );
    expect(adapter.read()).toBe('?photo=2');
  });

  it('reads no query when the question mark sits inside the fragment', async () => {
    const { adapter } = await mountAdapter(
      createTestRouter(),
      '/gallery#details?photo=2',
    );
    expect(adapter.read()).toBe('');
  });

  it('reports a same-page push made through the router as push evidence', async () => {
    const router = createTestRouter();
    const { adapter, changes } = await mountAdapter(router, '/gallery');

    await router.push('/gallery?photo=2');

    expect(adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([{ kind: 'push' }]);
  });

  it('reports a replace and a back step as such', async () => {
    const router = createTestRouter();
    const { adapter, changes } = await mountAdapter(router, '/gallery');

    await router.push('/gallery?photo=2');
    await router.replace('/gallery?photo=3');
    const landed = nextPop();
    router.back();
    await landed;
    await settle();

    expect(changes).toEqual([
      { kind: 'push' },
      { kind: 'replace' },
      { kind: 'pop' },
    ]);
    expect(adapter.read()).toBe('');
  });

  it('reports no evidence for a push that arrived from another page', async () => {
    const router = createTestRouter();
    const { adapter, changes } = await mountAdapter(router, '/home');

    await router.push('/gallery?photo=2');

    expect(adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([undefined]);
  });

  it('stops notifying after unsubscribe', async () => {
    const router = createTestRouter();
    const { adapter } = await mountAdapter(router, '/gallery');
    const listener = vi.fn();
    adapter.subscribe(listener)();

    await router.push('/gallery?photo=2');

    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the path, fragment, and the rest of the query through push, replace, and removal', async () => {
    const router = createTestRouter();
    const { adapter } = await mountAdapter(
      router,
      '/gallery?tag=a&tag=b&empty=&label=a%26b#details',
    );

    adapter.push('?tag=a&tag=b&empty=&label=a%26b&photo=2');
    await settle();
    let search = new URLSearchParams(window.location.search);
    expect(window.location.pathname).toBe('/gallery');
    expect(window.location.hash).toBe('#details');
    expect(search.getAll('tag')).toEqual(['a', 'b']);
    expect(search.get('empty')).toBe('');
    expect(search.get('label')).toBe('a&b');
    expect(search.get('photo')).toBe('2');

    adapter.replace('?tag=a&tag=b&empty=&label=a%26b&photo=3');
    await settle();
    search = new URLSearchParams(window.location.search);
    expect(search.get('photo')).toBe('3');
    expect(search.getAll('tag')).toEqual(['a', 'b']);
    expect(window.location.hash).toBe('#details');

    adapter.replace('?tag=a&tag=b&empty=&label=a%26b');
    await settle();
    search = new URLSearchParams(window.location.search);
    expect(search.has('photo')).toBe(false);
    expect(search.getAll('tag')).toEqual(['a', 'b']);
    expect(search.get('empty')).toBe('');
    expect(search.get('label')).toBe('a&b');
    expect(window.location.hash).toBe('#details');
  });

  it('round-trips a pushed state through the real history entry and merges on replace', async () => {
    const router = createTestRouter();
    const { adapter } = await mountAdapter(router, '/gallery');

    adapter.push('?photo=2', { open: true });
    await settle();
    expect(adapter.getState()).toMatchObject({ open: true });

    adapter.replace('?photo=3', { seen: 1 });
    await settle();
    expect(adapter.getState()).toMatchObject({ open: true, seen: 1 });
    // The router's own keys survive the merge.
    expect(adapter.getState()).toMatchObject({ current: '/gallery?photo=3' });
  });

  it('leaves no stamp on an unrelated entry pushed at the same position later', async () => {
    const router = createTestRouter();
    const { adapter } = await mountAdapter(router, '/gallery');

    adapter.push('?photo=2', { open: true });
    await settle();
    expect(adapter.getState()).toMatchObject({ open: true });

    const landed = nextPop();
    router.back();
    await landed;
    await settle();

    await router.push('/home');
    expect(adapter.getState()).not.toHaveProperty('open');
  });

  it('steps back through the router', async () => {
    const router = createTestRouter();
    const { adapter } = await mountAdapter(router, '/gallery');
    await router.push('/gallery?photo=2');

    const landed = nextPop();
    adapter.goBack();
    await landed;

    expect(here()).toBe('/gallery');
  });
});

describe('useVueRouterUrlAdapter driving a controller', () => {
  /** A controller bound to a real router, mounted the way an overlay is. */
  const mountController = async (router: Router, url: string) => {
    await router.push(url);
    await router.isReady();

    let controller!: UrlStateController;
    mount(
      defineComponent({
        setup() {
          controller = createUrlStateController({
            param: 'photo',
            adapter: useVueRouterUrlAdapter(),
            ...urlIndexKey(() => 5),
          });
          controller.attach();
          return () => h('div');
        },
      }),
      { global: { plugins: [router] } },
    );
    return controller;
  };

  it('closes a link-opened overlay with one back step and keeps the fragment', async () => {
    const router = createTestRouter();
    const controller = await mountController(router, '/gallery#details');
    const opened = window.history.state.position;

    await router.push('/gallery?photo=2#details');
    expect(controller.position.value).toBe(2);
    // The claim the controller makes on the way in is a router replace of
    // its own, and it has to land before the entry reads as owned.
    await settle();
    expect(window.history.state).toMatchObject({ __rk_url_owner: 'photo' });

    const landed = nextPop();
    controller.set(null);
    await landed;
    await settle();

    expect(here()).toBe('/gallery#details');
    expect(controller.position.value).toBeNull();
    expect(window.history.state.position).toBe(opened);
  });

  it('clears a cold deep link in place', async () => {
    const router = createTestRouter();
    const controller = await mountController(
      router,
      '/gallery?photo=2#details',
    );
    const opened = window.history.state.position;
    expect(controller.position.value).toBe(2);

    controller.set(null);
    await settle();

    expect(here()).toBe('/gallery#details');
    expect(controller.position.value).toBeNull();
    expect(window.history.state.position).toBe(opened);
  });

  it('opens from a controller write, swipes without adding entries, and closes with one step', async () => {
    const router = createTestRouter();
    const controller = await mountController(router, '/gallery?tag=a&tag=b');
    const before = window.history.state.position;

    controller.set(1);
    await settle();
    expect(controller.position.value).toBe(1);
    expect(window.history.state.position).toBe(before + 1);

    controller.set(3);
    await settle();
    expect(new URLSearchParams(window.location.search).get('photo')).toBe('3');
    expect(new URLSearchParams(window.location.search).getAll('tag')).toEqual([
      'a',
      'b',
    ]);
    expect(window.history.state.position).toBe(before + 1);

    const landed = nextPop();
    controller.set(null);
    await landed;
    await settle();

    expect(window.location.search).toBe('?tag=a&tag=b');
    expect(window.history.state.position).toBe(before);
    expect(controller.position.value).toBeNull();
  });

  it('closes locally when a navigation guard refuses the opening push', async () => {
    const router = createTestRouter();
    const controller = await mountController(router, '/gallery');
    router.beforeEach((to) => !to.query['photo']);

    controller.set(1);
    expect(controller.position.value).toBe(1);
    await settle();
    expect(window.location.search).toBe('');

    controller.set(null);
    await settle();

    expect(controller.position.value).toBeNull();
    expect(controller.value.value).toBeNull();
    expect(here()).toBe('/gallery');
  });
});

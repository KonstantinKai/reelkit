import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import {
  useOverlayUrlState,
  urlIndexKey,
  urlIndexTwoAxisKey,
  type UrlAdapter,
} from '@reelkit/vue';
import { createFakeUrlAdapter } from '@reelkit/core/testing';
import { ReelPlayerUrlOverlay, type ReelPlayerApi } from './ReelPlayerOverlay';
import type { ContentItem } from './types';

const sampleContent: ContentItem[] = [
  {
    id: 'a',
    media: [
      { id: 'a-1', type: 'image', src: 'https://x/a.jpg', aspectRatio: 9 / 16 },
    ],
    author: { name: 'A', avatar: 'https://x/av-a.jpg' },
    likes: 1,
    description: 'a',
  },
  {
    id: 'b',
    media: [
      { id: 'b-1', type: 'image', src: 'https://x/b.jpg', aspectRatio: 9 / 16 },
    ],
    author: { name: 'B', avatar: 'https://x/av-b.jpg' },
    likes: 2,
    description: 'b',
  },
];

class MockResizeObserver {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
}

function urlHost(
  adapter: UrlAdapter,
  slots?: Record<string, unknown>,
  onApiReady?: (api: ReelPlayerApi) => void,
) {
  return defineComponent({
    setup() {
      const controller = useOverlayUrlState({
        param: 'reel',
        adapter,
        ...urlIndexKey(() => sampleContent.length),
      });
      return () =>
        h(
          ReelPlayerUrlOverlay,
          { content: sampleContent, controller, onApiReady },
          slots ?? {},
        );
    },
  });
}

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: 768,
    configurable: true,
  });
  (
    global as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ReelPlayerUrlOverlay', () => {
  it('opens at the slide the parameter names', async () => {
    const { adapter } = createFakeUrlAdapter('?reel=1');
    mount(urlHost(adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });

  it('stays closed when the parameter is absent', async () => {
    const { adapter } = createFakeUrlAdapter('');
    mount(urlHost(adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
  });

  it('opens in reaction to a later URL change, not only the initial read', async () => {
    // A static `.value` snapshot would never see this push; toVueRef must make
    // the render track the signal.
    const state = createFakeUrlAdapter('');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();

    state.adapter.push('?reel=0', null);
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });

  it('closes and clears the parameter on the close button', async () => {
    const state = createFakeUrlAdapter('?reel=0');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();

    (
      document.querySelector('.rk-reel-close-btn') as HTMLElement | null
    )?.click();
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
    expect(state.adapter.read()).not.toContain('reel');
  });

  it('drops a parameter that names no slide instead of opening it', async () => {
    const state = createFakeUrlAdapter('?reel=99');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
    expect(state.adapter.read()).not.toContain('reel=99');
  });

  it('adds a single history entry when opened from an absent parameter', async () => {
    const state = createFakeUrlAdapter('');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();

    state.adapter.push('?reel=0', null);
    await nextTick();
    await nextTick();

    // One push total: the deliberate open above. The controller added none.
    expect(state.counts.push).toBe(1);
  });

  it('replaces instead of pushing on slide change, so paging never buries the back button', async () => {
    const state = createFakeUrlAdapter('?reel=0');
    let api: ReelPlayerApi | null = null;
    mount(
      urlHost(state.adapter, undefined, (readyApi) => (api = readyApi)),
      { attachTo: document.body },
    );
    await nextTick();
    expect(api).not.toBeNull();
    const replacesBefore = state.counts.replace;

    await api!.goTo(1, false);
    await nextTick();

    expect(state.adapter.read()).toContain('reel=1');
    expect(state.counts.replace).toBeGreaterThan(replacesBefore);
    expect(state.counts.push).toBe(0);
  });

  it('forwards a custom controls slot through to the content', async () => {
    const { adapter } = createFakeUrlAdapter('?reel=0');
    mount(
      urlHost(adapter, {
        controls: () => h('button', { class: 'my-controls' }, 'x'),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    expect(document.querySelector('.my-controls')).not.toBeNull();
  });

  it('mounts without a provider error, proving sound and timeline context resolve', async () => {
    // ReelPlayerContent calls useSoundState and useTimelineState; both throw if
    // their providers are missing from the url overlay's wrapping.
    const { adapter } = createFakeUrlAdapter('?reel=0');
    expect(() =>
      mount(urlHost(adapter), { attachTo: document.body }),
    ).not.toThrow();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });
});

// post 0 and 1 are single-media, post 2 is a multi-media carousel.
const twoAxisContent: ContentItem[] = [
  {
    id: 'a',
    media: [
      { id: 'a-1', type: 'image', src: 'https://x/a.jpg', aspectRatio: 9 / 16 },
    ],
    author: { name: 'A', avatar: 'https://x/av-a.jpg' },
    likes: 1,
    description: 'a',
  },
  {
    id: 'b',
    media: [
      { id: 'b-1', type: 'image', src: 'https://x/b.jpg', aspectRatio: 9 / 16 },
    ],
    author: { name: 'B', avatar: 'https://x/av-b.jpg' },
    likes: 2,
    description: 'b',
  },
  {
    id: 'c',
    media: [
      {
        id: 'c-1',
        type: 'image',
        src: 'https://x/c1.jpg',
        aspectRatio: 9 / 16,
      },
      {
        id: 'c-2',
        type: 'image',
        src: 'https://x/c2.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: { name: 'C', avatar: 'https://x/av-c.jpg' },
    likes: 3,
    description: 'c',
  },
];

function urlHostTwoAxis(
  adapter: UrlAdapter,
  onApiReady?: (api: ReelPlayerApi) => void,
) {
  return defineComponent({
    setup() {
      const controller = useOverlayUrlState({
        param: 'reel',
        adapter,
        ...urlIndexTwoAxisKey({
          outerCount: () => twoAxisContent.length,
          innerCounts: () => twoAxisContent.map((c) => c.media.length),
        }),
      });
      return () =>
        h(
          ReelPlayerUrlOverlay,
          { content: twoAxisContent, controller, onApiReady },
          {},
        );
    },
  });
}

describe('ReelPlayerUrlOverlay (two-axis)', () => {
  it('opens at a two-axis position, seeding the named outer post', async () => {
    const { adapter } = createFakeUrlAdapter('?reel=2.1');
    mount(urlHostTwoAxis(adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });

  it('treats a bare one-axis param as malformed and stays closed', async () => {
    const state = createFakeUrlAdapter('?reel=3');
    mount(urlHostTwoAxis(state.adapter), { attachTo: document.body });
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
    expect(state.adapter.read()).not.toContain('reel=3');
  });

  it('writes both axes strictly dotted on outer navigation', async () => {
    // Outer nav to a single-media post reports inner 0 on activation, so the
    // two-axis wire stays dotted rather than collapsing to a bare outer.
    const state = createFakeUrlAdapter('?reel=0.0');
    let api: ReelPlayerApi | null = null;
    mount(
      urlHostTwoAxis(state.adapter, (readyApi) => (api = readyApi)),
      {
        attachTo: document.body,
      },
    );
    await nextTick();
    expect(api).not.toBeNull();

    await api!.goTo(1, false);
    await nextTick();

    expect(state.adapter.read()).toContain('reel=1.0');
    expect(state.counts.push).toBe(0);
  });

  it('closes and clears the parameter', async () => {
    const state = createFakeUrlAdapter('?reel=2.1');
    mount(urlHostTwoAxis(state.adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();

    (
      document.querySelector('.rk-reel-close-btn') as HTMLElement | null
    )?.click();
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
    expect(state.adapter.read()).not.toContain('reel');
  });
});

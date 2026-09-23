import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/stories-core';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { StoriesRingList } from './StoriesRingList';
import { StoriesOverlay } from './StoriesOverlay';

const groups: StoriesGroup[] = [
  {
    author: { id: 'alice', name: 'Alice', avatar: 'alice.jpg' },
    stories: [
      { id: 'a1', mediaType: 'image', src: 'a1.jpg' },
      { id: 'a2', mediaType: 'image', src: 'a2.jpg' },
    ],
  },
  {
    author: { id: 'bob', name: 'Bob', avatar: 'bob.jpg' },
    stories: [{ id: 'b1', mediaType: 'image', src: 'b1.jpg' }],
  },
];

let wrapper: VueWrapper | null = null;

const renderList = (props: Record<string, unknown> = {}) => {
  wrapper = mount(StoriesRingList, { props: { groups, ...props } });
  return wrapper;
};

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

const ringOf = (name: string) =>
  wrapper!.find(`[aria-label="${name}'s stories"]`);
const isUnseen = (name: string) =>
  ringOf(name).classes('rk-stories-ring--active');

const viewedFor = (stored: string | null = null) => {
  const storage = createFakeStorageAdapter({ initial: stored });
  const viewed = createStoriesViewedStateController({
    storageKey: 'seen',
    storage: storage.adapter,
    groups: () => groups,
  });
  return { storage, viewed };
};

describe('StoriesRingList', () => {
  it('draws every ring unwatched when told nothing', () => {
    renderList();
    expect(isUnseen('Alice')).toBe(true);
    expect(isUnseen('Bob')).toBe(true);
  });

  // One way in for what was seen, on the list and on the player alike: the
  // controller. A map prop beside it would be a second, silently slower path.
  it('takes viewed state through the controller only', () => {
    for (const component of [StoriesRingList, StoriesOverlay]) {
      const props = Object.keys(component['props']);
      expect(props).toContain('viewed');
      expect(props).not.toContain('viewedState');
    }
  });

  it('emits the group of a ring that is clicked', async () => {
    renderList();
    await ringOf('Bob').trigger('click');
    expect(wrapper!.emitted('select')).toEqual([[1]]);
  });

  it('keeps each name under its ring at the ring width', () => {
    renderList({ ringSize: 72 });
    const name = wrapper!.find('.rk-stories-ring-list-name')
      .element as HTMLElement;
    expect(name.style.maxWidth).toBe('72px');
  });

  describe('given a viewed controller', () => {
    it('reads the store when it mounts and draws the rings from it', async () => {
      const { viewed, storage } = viewedFor('["bob.b1"]');
      renderList({ viewed });
      await nextTick();

      expect(storage.counts.read).toBeGreaterThan(0);
      expect(isUnseen('Alice')).toBe(true);
      expect(isUnseen('Bob')).toBe(false);
    });

    // Nothing above the list re-renders here: the rings follow the signal.
    it('repaints a ring when a story is marked seen', async () => {
      const { viewed } = viewedFor();
      renderList({ viewed });
      expect(isUnseen('Bob')).toBe(true);

      viewed.markViewed(1, 0);
      await nextTick();

      expect(isUnseen('Bob')).toBe(false);
    });

    it('follows a controller that replaced the first', async () => {
      const first = viewedFor().viewed;
      const second = viewedFor().viewed;
      renderList({ viewed: first });
      await wrapper!.setProps({ viewed: second });

      second.markViewed(1, 0);
      await nextTick();

      expect(isUnseen('Bob')).toBe(false);
    });

    it('stops following the store when it unmounts', () => {
      const { viewed, storage } = viewedFor();
      renderList({ viewed });
      wrapper!.unmount();
      wrapper = null;

      storage.fireExternalChange('["bob.b1"]');

      expect(viewed.viewedState.value.get('bob')).toBeUndefined();
    });
  });

  // A server render reads no storage, so it agrees with the first client
  // render: every ring unwatched, whatever the viewer saw before.
  it('renders on the server without touching storage or the window', async () => {
    const { viewed, storage } = viewedFor('["bob.b1"]');
    const originalWindow = globalThis.window;
    // @ts-expect-error removed to stand in for a server without a window
    delete globalThis.window;
    try {
      const html = await renderToString(
        createSSRApp({
          render: () => [
            h(StoriesRingList, { groups, viewed }),
            h(StoriesOverlay, { isOpen: false, groups, viewed }),
          ],
        }),
      );
      expect(storage.counts.read).toBe(0);
      expect(html.match(/rk-stories-ring--active/g)).toHaveLength(2);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});

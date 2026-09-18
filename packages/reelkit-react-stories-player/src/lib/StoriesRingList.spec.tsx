import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/stories-core';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { StoriesRingList } from './StoriesRingList';

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

const ringOf = (name: string) =>
  screen.getByRole('button', { name: `${name}'s stories` });
const isUnseen = (name: string) =>
  ringOf(name).classList.contains('rk-stories-ring--active');

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
    render(<StoriesRingList groups={groups} onSelect={vi.fn()} />);

    expect(isUnseen('Alice')).toBe(true);
    expect(isUnseen('Bob')).toBe(true);
  });

  // One way in for what was seen, on the list and on the player alike: the
  // controller. A map prop beside it would be a second, silently slower path.
  it('takes viewed state through the controller only', () => {
    for (const file of ['StoriesRingList.tsx', 'StoriesOverlay.tsx']) {
      const source = readFileSync(join(__dirname, file), 'utf8');
      const props = source.match(
        /export interface (?:StoriesRingListProps|StoriesOverlayProps)[^{]*\{[\s\S]*?\n\}/,
      )?.[0];

      expect(props, file).toBeDefined();
      expect(props).toMatch(/\n {2}viewed\?: StoriesViewedStateController;/);
      expect(props).not.toMatch(/\n {2}viewedState\??:/);
    }
  });

  it('reports the group of a ring that is clicked', () => {
    const onSelect = vi.fn();
    render(<StoriesRingList groups={groups} onSelect={onSelect} />);

    act(() => {
      screen.getByRole('button', { name: "Bob's stories" }).click();
    });

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  describe('given a viewed controller', () => {
    it('reads the store when it mounts and draws the rings from it', () => {
      const { viewed, storage } = viewedFor('["bob.b1"]');
      render(
        <StoriesRingList groups={groups} viewed={viewed} onSelect={vi.fn()} />,
      );

      expect(storage.counts.read).toBeGreaterThan(0);
      expect(isUnseen('Alice')).toBe(true);
      expect(isUnseen('Bob')).toBe(false);
    });

    // Nothing above the list re-renders here: the rings follow the signal.
    it('repaints a ring when a story is marked seen', () => {
      const { viewed } = viewedFor();
      render(
        <StoriesRingList groups={groups} viewed={viewed} onSelect={vi.fn()} />,
      );
      expect(isUnseen('Bob')).toBe(true);

      act(() => {
        viewed.markViewed(1, 0);
      });

      expect(isUnseen('Bob')).toBe(false);
    });

    it('follows a controller that replaced the first', () => {
      const first = viewedFor().viewed;
      const second = viewedFor().viewed;
      const { rerender } = render(
        <StoriesRingList groups={groups} viewed={first} onSelect={vi.fn()} />,
      );
      rerender(
        <StoriesRingList groups={groups} viewed={second} onSelect={vi.fn()} />,
      );

      act(() => {
        second.markViewed(1, 0);
      });

      expect(isUnseen('Bob')).toBe(false);
    });

    it('stops following the store when it unmounts', () => {
      const { viewed, storage } = viewedFor();
      const { unmount } = render(
        <StoriesRingList groups={groups} viewed={viewed} onSelect={vi.fn()} />,
      );
      unmount();

      storage.fireExternalChange('["bob.b1"]');

      expect(viewed.viewedState.value.get('bob')).toBeUndefined();
    });
  });
});

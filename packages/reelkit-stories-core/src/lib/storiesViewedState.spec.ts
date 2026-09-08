import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import {
  createViewedStateController,
  twoAxisViewedTracking,
  urlIndexTwoAxisKey,
  urlStableIdTwoAxisKey,
  type TwoAxisPosition,
  type ViewedStateController,
} from '@reelkit/core';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { createStoriesViewedState } from './storiesViewedState';
import type { StoriesGroup, StoryItem } from './types';

const story = (id: string): StoryItem => ({
  id,
  mediaType: 'image',
  src: `${id}.jpg`,
});

const group = (id: string, ...storyIds: string[]): StoriesGroup => ({
  author: { id, name: id, avatar: `${id}.png` },
  stories: storyIds.map(story),
});

const feed = () => [
  group('alice', 'a1', 'a2', 'a3'),
  group('bob', 'b1', 'b2'),
  group('carol', 'c1'),
];

const setup = (stored: string | null, groups: () => StoriesGroup[] = feed) => {
  const storage = createFakeStorageAdapter({ initial: stored });
  const controller: ViewedStateController<TwoAxisPosition> =
    createViewedStateController({
      storageKey: 'seen',
      storage: storage.adapter,
      ...urlStableIdTwoAxisKey({
        outerItems: () => groups().map((g) => ({ id: g.author.id })),
        innerItems: (outer) =>
          groups().find((g) => g.author.id === outer.id)?.stories ?? [],
      }),
      ...twoAxisViewedTracking,
    });
  controller.attach();

  return {
    storage,
    controller,
    viewed: createStoriesViewedState(controller, groups),
  };
};

describe('createStoriesViewedState', () => {
  it('counts a group up to the furthest story reached', () => {
    const { viewed } = setup('["alice.a2"]');

    expect(viewed.viewedCounts().get('alice')).toBe(2);
  });

  it('leaves a group nothing is stored for out of the counts', () => {
    const { viewed } = setup('["alice.a1"]');

    expect(viewed.viewedCounts().has('bob')).toBe(false);
  });

  it('opens a partly watched group on its first unseen story', () => {
    const { viewed } = setup('["alice.a1"]');

    expect(viewed.resumeStoryIndex(0)).toBe(1);
  });

  it('starts a fully watched group over', () => {
    const { viewed } = setup('["alice.a3"]');

    expect(viewed.resumeStoryIndex(0)).toBe(0);
  });

  it('starts an unknown group at its first story', () => {
    const { viewed } = setup(null);

    expect(viewed.resumeStoryIndex(1)).toBe(0);
    expect(viewed.resumeStoryIndex(99)).toBe(0);
  });

  it('marks a one-story group watched as soon as its only story is seen', () => {
    const { viewed } = setup(null);

    viewed.markViewed(2, 0);

    expect(viewed.viewedCounts().get('carol')).toBe(1);
    expect(viewed.resumeStoryIndex(2)).toBe(0);
  });

  it('lights a watched group again when a story is added to it', () => {
    let groups = feed();
    const { viewed } = setup('["alice.a3"]', () => groups);

    expect(viewed.resumeStoryIndex(0)).toBe(0);

    groups = [
      { ...groups[0], stories: [...groups[0].stories, story('a4')] },
      groups[1],
      groups[2],
    ];

    expect(viewed.viewedCounts().get('alice')).toBe(3);
    expect(viewed.resumeStoryIndex(0)).toBe(3);
  });

  it('follows a group that moved rather than counting whoever took its slot', () => {
    let groups = feed();
    const { viewed } = setup('["carol.c1"]', () => groups);

    expect(viewed.viewedCounts().get('carol')).toBe(1);

    groups = [groups[2], groups[0], groups[1]];

    expect(viewed.viewedCounts().get('carol')).toBe(1);
    expect(viewed.viewedCounts().has('alice')).toBe(false);
  });

  it('takes the furthest of two entries that land on one group', () => {
    // A feed repeating an author resolves both entries to the same slot.
    const groups = () => [group('alice', 'a1', 'a2', 'a3')];
    const { viewed } = setup('["alice.a1","alice.a3"]', groups);

    expect(viewed.viewedCounts().get('alice')).toBe(3);
  });

  // A ring is drawn once per author, so a feed carrying the same author twice
  // has to collapse their groups into one count. Positions address the groups
  // here because an id-addressed key resolves both entries to the first match,
  // which is the one case where the collapse never comes up.
  it('reports the furthest of two groups sharing an author', () => {
    const groups = [
      group('alice', 'a1', 'a2', 'a3'),
      group('bob', 'b1'),
      group('alice', 'a4'),
    ];
    const storage = createFakeStorageAdapter({ initial: '["0.2","2.0"]' });
    const controller = createViewedStateController({
      storageKey: 'seen',
      storage: storage.adapter,
      ...urlIndexTwoAxisKey({
        outerCount: () => groups.length,
        innerCounts: () => groups.map((g) => g.stories.length),
      }),
      ...twoAxisViewedTracking,
    });
    controller.attach();

    const viewed = createStoriesViewedState(controller, () => groups);

    // Her later group is one story in; reporting whichever came last would
    // show that instead of the three she has actually watched.
    expect(viewed.viewedCounts().get('alice')).toBe(3);
  });

  // The default feed getter builds a fresh array per call. These hand a
  // stable one over, since identity is what the reuse is keyed on.
  it('reuses the last resolve while neither the store nor the feed has changed', () => {
    const stable = feed();
    const { controller, viewed } = setup(
      '["alice.a2","bob.b1","carol.c1"]',
      () => stable,
    );
    const resolve = vi.spyOn(controller, 'resolve');

    const first = viewed.viewedCounts();
    const second = viewed.viewedCounts();

    expect(second).toBe(first);
    expect(resolve).toHaveBeenCalledTimes(3);

    viewed.resumeStoryIndex(1);
    expect(resolve).toHaveBeenCalledTimes(3);
  });

  it('resolves again when the feed array is replaced', () => {
    let groups = feed();
    const { controller, viewed } = setup(
      '["alice.a2","bob.b1","carol.c1"]',
      () => groups,
    );
    const resolve = vi.spyOn(controller, 'resolve');

    const before = viewed.viewedCounts();
    groups = [...groups];
    const after = viewed.viewedCounts();

    expect(after).not.toBe(before);
    expect(resolve).toHaveBeenCalledTimes(6);
  });

  it('resolves again when the store publishes', () => {
    const stable = feed();
    const { controller, viewed } = setup('["alice.a2"]', () => stable);
    const resolve = vi.spyOn(controller, 'resolve');

    viewed.viewedCounts();
    viewed.markViewed(1, 0);
    viewed.viewedCounts();

    expect(resolve).toHaveBeenCalledTimes(3);
  });

  it('places each stored entry once however many groups the feed holds', () => {
    const { controller, viewed } = setup('["alice.a2","bob.b1","carol.c1"]');
    const resolve = vi.spyOn(controller, 'resolve');

    viewed.viewedCounts();

    expect(resolve).toHaveBeenCalledTimes(3);
  });

  it('never counts past the stories a group still has', () => {
    let groups = feed();
    const { viewed } = setup('["alice.a3"]', () => groups);

    groups = [{ ...groups[0], stories: [story('a3')] }, groups[1], groups[2]];

    expect(viewed.viewedCounts().get('alice')).toBe(1);
    expect(viewed.resumeStoryIndex(0)).toBe(0);
  });
});

/**
 * A snippet only reads as an example when it is tagged as one — untagged, it
 * renders as description prose and editor hover shows no example at all.
 */
describe('documentation', () => {
  const source = readFileSync(join(__dirname, 'storiesViewedState.ts'), 'utf8');

  it('gives createStoriesViewedState a tagged example', () => {
    const declared = source.search(/^export const createStoriesViewedState\b/m);
    expect(declared).toBeGreaterThan(-1);

    const doc = source.slice(0, declared).split('/**').pop() ?? '';
    expect(doc).toContain('@example');
  });

  it('tags every fenced snippet rather than leaving it loose in a description', () => {
    const fences = (source.match(/^ \* ```/gm) ?? []).length;
    const tags = (source.match(/@example/g) ?? []).length;

    expect(tags).toBe(fences / 2);
  });
});

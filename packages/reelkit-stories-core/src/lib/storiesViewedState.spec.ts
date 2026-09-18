import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import {
  createViewedStateController,
  twoAxisViewedTracking,
  urlIndexTwoAxisKey,
  urlStableIdTwoAxisKey,
} from '@reelkit/core';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { createStoriesViewedStateController } from './storiesViewedState';
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

const setup = (
  stored: string | null = null,
  config: Partial<
    Parameters<typeof createStoriesViewedStateController>[0]
  > = {},
) => {
  const storage = createFakeStorageAdapter({ initial: stored });
  // One array handed out every time, as a real feed does: the counts are kept
  // while the same array comes back.
  const groups = feed();
  const viewed = createStoriesViewedStateController({
    storageKey: 'seen',
    storage: storage.adapter,
    groups: () => groups,
    ...config,
  });
  return { storage, viewed };
};

describe('createStoriesViewedStateController', () => {
  describe('wiring rings, resume and recording from one call', () => {
    it('counts what storage holds once it is attached', () => {
      const { viewed } = setup('["alice.a2"]');
      viewed.attach();

      expect(viewed.viewedState.value.get('alice')).toBe(2);
    });

    it('opens a group on the first story not yet seen', () => {
      const { viewed } = setup('["alice.a2"]');
      viewed.attach();

      expect(viewed.resumeStoryIndex(0)).toBe(2);
      expect(viewed.resumeStoryIndex(1)).toBe(0);
    });

    it('records a story, raises the count and tells whoever follows the signal', () => {
      const { viewed, storage } = setup();
      viewed.attach();
      const listener = vi.fn();
      viewed.viewedState.observe(listener);

      viewed.markViewed(1, 0);

      expect(listener).toHaveBeenCalled();
      expect(viewed.viewedState.value.get('bob')).toBe(1);
      expect(storage.stored).toBe('["bob.b1"]');
    });

    it('hands back the same map until something is seen', () => {
      const { viewed } = setup('["alice.a1"]');
      viewed.attach();

      const before = viewed.viewedState.value;
      expect(viewed.viewedState.value).toBe(before);

      viewed.markViewed(0, 1);
      expect(viewed.viewedState.value).not.toBe(before);
    });

    it('forgets everything on request', () => {
      const { viewed } = setup('["alice.a2","bob.b1"]');
      viewed.attach();

      viewed.forget();

      expect(viewed.viewedState.value.size).toBe(0);
      expect(viewed.resumeStoryIndex(0)).toBe(0);
    });

    it('exposes the store it is built on', () => {
      const { viewed } = setup('["alice.a2"]');
      viewed.attach();

      expect(viewed.controller.resolve('alice')).toEqual({
        outer: 0,
        inner: 1,
      });
    });
  });

  // The store holds one entry per group, naming the furthest story reached.
  // Counts and resume positions are read off that, against the feed as it is
  // now.
  describe('counting what was seen', () => {
    it('leaves a group nothing is stored for out of the counts', () => {
      const { viewed } = setup('["alice.a1"]');
      viewed.attach();

      expect(viewed.viewedState.value.has('bob')).toBe(false);
    });

    it('starts a fully watched group over', () => {
      const { viewed } = setup('["alice.a3"]');
      viewed.attach();

      expect(viewed.resumeStoryIndex(0)).toBe(0);
    });

    it('starts an unknown group at its first story', () => {
      const { viewed } = setup();
      viewed.attach();

      expect(viewed.resumeStoryIndex(1)).toBe(0);
      expect(viewed.resumeStoryIndex(99)).toBe(0);
    });

    it('marks a one-story group watched as soon as its only story is seen', () => {
      const { viewed } = setup();
      viewed.attach();

      viewed.markViewed(2, 0);

      expect(viewed.viewedState.value.get('carol')).toBe(1);
      expect(viewed.resumeStoryIndex(2)).toBe(0);
    });

    it('lights a watched group again when a story is added to it', () => {
      let groups = feed();
      const { viewed } = setup('["alice.a3"]', { groups: () => groups });
      viewed.attach();
      expect(viewed.resumeStoryIndex(0)).toBe(0);

      groups = [
        { ...groups[0], stories: [...groups[0].stories, story('a4')] },
        groups[1],
        groups[2],
      ];

      expect(viewed.viewedState.value.get('alice')).toBe(3);
      expect(viewed.resumeStoryIndex(0)).toBe(3);
    });

    it('follows a group that moved rather than counting whoever took its slot', () => {
      let groups = feed();
      const { viewed } = setup('["carol.c1"]', { groups: () => groups });
      viewed.attach();
      expect(viewed.viewedState.value.get('carol')).toBe(1);

      groups = [groups[2], groups[0], groups[1]];

      expect(viewed.viewedState.value.get('carol')).toBe(1);
      expect(viewed.viewedState.value.has('alice')).toBe(false);
    });

    it('takes the furthest of two entries that land on one group', () => {
      // A feed repeating an author resolves both entries to the same slot.
      const groups = [group('alice', 'a1', 'a2', 'a3')];
      const { viewed } = setup('["alice.a1","alice.a3"]', {
        groups: () => groups,
      });
      viewed.attach();

      expect(viewed.viewedState.value.get('alice')).toBe(3);
    });

    // A ring is drawn once per author, so a feed carrying the same author
    // twice has to collapse their groups into one count. Positions address the
    // groups here because the default id key resolves both entries to the
    // first match, which is the one case where the collapse never comes up.
    it('reports the furthest of two groups sharing an author', () => {
      const groups = [
        group('alice', 'a1', 'a2', 'a3'),
        group('bob', 'b1'),
        group('alice', 'a4'),
      ];
      const storage = createFakeStorageAdapter({ initial: '["0.2","2.0"]' });
      const viewed = createStoriesViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        key: urlIndexTwoAxisKey({
          outerCount: () => groups.length,
          innerCounts: () => groups.map((g) => g.stories.length),
        }),
        groups: () => groups,
      });
      viewed.attach();

      // Her later group is one story in; reporting whichever came last would
      // show that instead of the three she has actually watched.
      expect(viewed.viewedState.value.get('alice')).toBe(3);
    });

    it('never counts past the stories a group still has', () => {
      let groups = feed();
      const { viewed } = setup('["alice.a3"]', { groups: () => groups });
      viewed.attach();

      groups = [{ ...groups[0], stories: [story('a3')] }, groups[1], groups[2]];

      expect(viewed.viewedState.value.get('alice')).toBe(1);
      expect(viewed.resumeStoryIndex(0)).toBe(0);
    });
  });

  // Resolving walks every stored entry through the key, so the result is kept
  // while neither the store nor the feed array has changed.
  describe('reusing a resolve', () => {
    it('reuses the last resolve while neither the store nor the feed has changed', () => {
      const { viewed } = setup('["alice.a2","bob.b1","carol.c1"]');
      viewed.attach();
      const resolve = vi.spyOn(viewed.controller, 'resolve');

      const first = viewed.viewedState.value;
      const second = viewed.viewedState.value;

      expect(second).toBe(first);
      expect(resolve).toHaveBeenCalledTimes(3);

      viewed.resumeStoryIndex(1);
      expect(resolve).toHaveBeenCalledTimes(3);
    });

    it('resolves again when the feed array is replaced', () => {
      let groups = feed();
      const { viewed } = setup('["alice.a2","bob.b1","carol.c1"]', {
        groups: () => groups,
      });
      viewed.attach();
      const resolve = vi.spyOn(viewed.controller, 'resolve');

      const before = viewed.viewedState.value;
      groups = [...groups];
      const after = viewed.viewedState.value;

      expect(after).not.toBe(before);
      expect(resolve).toHaveBeenCalledTimes(6);
    });

    it('resolves again when the store publishes', () => {
      const { viewed } = setup('["alice.a2"]');
      viewed.attach();
      const resolve = vi.spyOn(viewed.controller, 'resolve');

      const before = viewed.viewedState.value;
      viewed.markViewed(1, 0);
      const after = viewed.viewedState.value;

      expect(after).not.toBe(before);
      expect(resolve).toHaveBeenCalledTimes(3);
    });
  });

  // Anyone who wired the store by hand before this existed has entries in
  // storage already. They have to read back the same.
  describe('stored text', () => {
    it('reads what the hand-wired store wrote under the same key', () => {
      const storage = createFakeStorageAdapter();
      const byHand = createViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        ...urlStableIdTwoAxisKey({
          outerItems: () => feed().map((g) => ({ id: g.author.id })),
          innerItems: (outer) =>
            feed().find((g) => g.author.id === outer.id)?.stories ?? [],
        }),
        ...twoAxisViewedTracking,
      });
      byHand.attach();
      byHand.record({ outer: 0, inner: 1 });
      byHand.record({ outer: 2, inner: 0 });

      const viewed = createStoriesViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        groups: feed,
      });
      viewed.attach();

      expect(viewed.viewedState.value.get('alice')).toBe(2);
      expect(viewed.viewedState.value.get('carol')).toBe(1);
    });

    it('names a story by author id and story id', () => {
      const { viewed, storage } = setup();
      viewed.attach();

      viewed.markViewed(0, 2);

      expect(storage.stored).toBe('["alice.a3"]');
    });
  });

  // The feed is read through a getter, every time it is needed. A feed that
  // pages in more groups only has to make the getter return them.
  describe('a feed that grows', () => {
    it('counts and resumes groups the getter starts returning later', () => {
      let groups = feed();
      const { viewed } = setup('["dave.d1"]', { groups: () => groups });
      viewed.attach();
      expect(viewed.viewedState.value.get('dave')).toBeUndefined();

      groups = [...groups, group('dave', 'd1', 'd2')];

      expect(viewed.viewedState.value.get('dave')).toBe(1);
      expect(viewed.resumeStoryIndex(3)).toBe(1);

      viewed.markViewed(3, 1);
      expect(viewed.viewedState.value.get('dave')).toBe(2);
    });
  });

  // Switching the feature off is not passing the controller to the
  // components, so there is no switch here to test: the config carries none.
  it('has no switch of its own', () => {
    const source = readFileSync(
      join(__dirname, 'storiesViewedState.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/\n {2}enabled\??:/);
  });

  describe('config', () => {
    it('uses a key of the caller in place of the stable ids', () => {
      // Created directly rather than through `setup`, whose option type fixes
      // the identity to the default: here it is inferred from the key.
      const storage = createFakeStorageAdapter();
      const groups = feed();
      const viewed = createStoriesViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        key: urlIndexTwoAxisKey({
          outerCount: () => groups.length,
          innerCounts: () => groups.map((g) => g.stories.length),
        }),
        groups: () => groups,
      });
      viewed.attach();

      viewed.markViewed(1, 1);

      expect(storage.stored).toBe('["1.1"]');
      expect(viewed.viewedState.value.get('bob')).toBe(2);
    });

    it('passes a lifetime on, so entries are stamped', () => {
      const { viewed, storage } = setup(null, { ttlMs: 60_000 });
      viewed.attach();

      viewed.markViewed(0, 0);

      const [entry] = JSON.parse(storage.stored ?? '[]') as unknown[];
      expect(Array.isArray(entry)).toBe(true);
      expect((entry as unknown[])[0]).toBe('alice.a1');
    });

    it('passes a cap on, so the oldest group is dropped past it', () => {
      const { viewed, storage } = setup(null, { maxTracks: 1 });
      viewed.attach();

      viewed.markViewed(0, 0);
      viewed.markViewed(1, 0);

      expect(storage.stored).toBe('["bob.b1"]');
    });

    // Read when the controller is created and never again, like the store it
    // is built on. Switching means creating another controller.
    it('writes under the storage key it was created with', () => {
      const config = {
        storageKey: 'first',
        storage: createFakeStorageAdapter().adapter,
        groups: feed,
      };
      const write = vi.spyOn(config.storage, 'write');
      const viewed = createStoriesViewedStateController(config);
      viewed.attach();

      config.storageKey = 'second';
      viewed.markViewed(0, 0);

      expect(write).toHaveBeenCalledWith('first', expect.any(String));
    });
  });

  // Nothing is read until `attach`, so what a server renders and what the
  // browser hydrates are the same: nothing seen yet.
  describe('before it is attached', () => {
    it('reads no storage and shows nothing seen', () => {
      const { viewed, storage } = setup('["alice.a2"]');

      expect(viewed.viewedState.value.size).toBe(0);
      expect(viewed.resumeStoryIndex(0)).toBe(0);
      expect(storage.counts.read).toBe(0);
    });

    it('tells whoever follows the signal once storage is read', () => {
      const { viewed } = setup('["alice.a2"]');
      const listener = vi.fn();
      viewed.viewedState.observe(listener);

      viewed.attach();

      expect(listener).toHaveBeenCalled();
      expect(viewed.viewedState.value.get('alice')).toBe(2);
    });
  });

  // A ring list and a player both attach, each from its own mount, and either
  // can leave first. The store stays attached until the last of them has gone.
  describe('attached by more than one component', () => {
    const otherTabWrites = (
      storage: ReturnType<typeof createFakeStorageAdapter>,
    ) => storage.fireExternalChange('["carol.c1"]');

    it('keeps following storage until the last one lets go', () => {
      const { viewed, storage } = setup();
      const leaveFirst = viewed.attach();
      const leaveSecond = viewed.attach();

      leaveFirst();
      otherTabWrites(storage);
      expect(viewed.viewedState.value.get('carol')).toBe(1);

      leaveSecond();
      storage.fireExternalChange('["carol.c1","bob.b2"]');
      expect(viewed.viewedState.value.get('bob')).toBeUndefined();
    });

    it('is following again after being let go and attached once more', () => {
      const { viewed, storage } = setup();
      viewed.attach()();
      viewed.attach();

      otherTabWrites(storage);

      expect(viewed.viewedState.value.get('carol')).toBe(1);
    });

    it('counts a letting go only once however often it is called', () => {
      const { viewed, storage } = setup();
      const leaveFirst = viewed.attach();
      viewed.attach();

      leaveFirst();
      leaveFirst();
      otherTabWrites(storage);

      expect(viewed.viewedState.value.get('carol')).toBe(1);
    });
  });

  // A snippet only reads as an example when it is tagged as one — untagged, it
  // renders as description prose and editor hover shows no example at all.
  it('tags every fenced snippet in its documentation as an example', () => {
    const source = readFileSync(
      join(__dirname, 'storiesViewedState.ts'),
      'utf8',
    );
    const fences = (source.match(/^ \* ```/gm) ?? []).length;
    const tags = (source.match(/@example/g) ?? []).length;

    expect(fences).toBeGreaterThan(0);
    expect(tags).toBe(fences / 2);
  });

  // One public entry for what was seen, and one module: the stories view it
  // used to wrap is folded in.
  it('is the only viewed-state entry the package exports', () => {
    const index = readFileSync(join(__dirname, '..', 'index.ts'), 'utf8');

    expect(index).toContain('createStoriesViewedStateController');
    expect(index).not.toMatch(/\bcreateStoriesViewedState\b/);
    expect(index).not.toMatch(/\bStoriesViewedState\b/);
    expect(existsSync(join(__dirname, 'storiesViewedController.ts'))).toBe(
      false,
    );
  });

  // Vue and Angular use this exactly as React does, so nothing here may pull
  // in a framework.
  it('imports no framework', () => {
    const source = readFileSync(
      join(__dirname, 'storiesViewedState.ts'),
      'utf8',
    );
    const imports = Array.from(
      source.matchAll(/from '([^']+)'/g),
      (match) => match[1],
    );

    expect(imports.length).toBeGreaterThan(0);
    for (const imported of imports) {
      expect(imported).toMatch(/^(@reelkit\/core|\.\/)/);
    }
  });
});

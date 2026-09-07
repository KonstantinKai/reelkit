import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFakeStorageAdapter } from '../../testing';
import { urlIndexKey } from './urlIndexKey';
import { urlStableIdTwoAxisKey } from './urlStableIdKey';
import {
  createViewedStateController,
  twoAxisViewedTracking,
  createLocalStorageAdapter,
  createMemoryStorageAdapter,
  createSessionStorageAdapter,
} from './viewedState';
import type { StorageAdapter } from './viewedState';

interface Story {
  id: string;
}

interface Group {
  id: string;
  stories: Story[];
}

const group = (id: string, ...storyIds: string[]): Group => ({
  id,
  stories: storyIds.map((storyId) => ({ id: storyId })),
});

const feed = [
  group('user_1', 'a1', 'a2', 'a3'),
  group('user_2', 'b1', 'b2'),
  group('user_3', 'c1'),
];

/**
 * A stories-shaped controller: groups addressed by their stable id, stories by
 * theirs, one track per group. The shape every invariant below is about.
 */
const createStoriesViewedController = (
  storage: StorageAdapter,
  groups: () => Group[] = () => feed,
) =>
  createViewedStateController({
    storageKey: 'seen',
    storage,
    ...urlStableIdTwoAxisKey<Group, Story>({
      outerItems: groups,
      innerItems: (outer) => outer.stories,
    }),
    ...twoAxisViewedTracking,
  });

describe('createViewedStateController', () => {
  it('stores the same text the URL parameter would carry', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    controller.record({ outer: 0, inner: 1 });

    expect(storage.stored).toBe('["user_1.a2"]');
  });

  it('resolves a stored entry to the position its item holds now', () => {
    const storage = createFakeStorageAdapter({ initial: '["user_1.a3"]' });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 2 });
  });

  // Durability follows the key: an identity-addressed entry names the same
  // item after the collection is reordered, which a stored index could not.
  it('follows an item that moved instead of naming its old slot', () => {
    let groups = feed;
    const storage = createFakeStorageAdapter({ initial: '["user_3.c1"]' });
    const controller = createStoriesViewedController(
      storage.adapter,
      () => groups,
    );
    controller.attach();

    expect(controller.resolve('user_3')).toEqual({ outer: 2, inner: 0 });

    groups = [feed[2], feed[0], feed[1]];
    expect(controller.resolve('user_3')).toEqual({ outer: 0, inner: 0 });
  });

  it('drops entries that can never be read and keeps ones that merely cannot be placed', () => {
    const storage = createFakeStorageAdapter({
      initial: '["user_1.a2", 42, "", "ghost.x1"]',
    });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    // The number and the blank name nothing under any state of the feed.
    // `ghost` reads back fine and is simply not loaded, so it is kept.
    expect([...controller.entries.value.keys()].sort()).toEqual([
      'ghost',
      'user_1',
    ]);
    expect(controller.resolve('ghost')).toBeNull();
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });
  });

  it('survives a payload that is not even an array', () => {
    const storage = createFakeStorageAdapter({ initial: '{"user_1":3}' });
    const controller = createStoriesViewedController(storage.adapter);

    expect(() => controller.attach()).not.toThrow();
    expect(controller.entries.value.size).toBe(0);
  });

  it('collapses duplicate entries for one track to the furthest', () => {
    const storage = createFakeStorageAdapter({
      initial: '["user_1.a3", "user_1.a1"]',
    });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    expect(controller.entries.value.get('user_1')).toBe('user_1.a3');
  });

  it('ignores a position behind the one already stored', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    controller.record({ outer: 0, inner: 2 });
    const writesAfterFirst = storage.counts.write;
    controller.record({ outer: 0, inner: 0 });

    expect(storage.stored).toBe('["user_1.a3"]');
    expect(storage.counts.write).toBe(writesAfterFirst);
  });

  it('reads nothing until it is attached', () => {
    const storage = createFakeStorageAdapter({ initial: '["user_1.a2"]' });
    const controller = createStoriesViewedController(storage.adapter);

    expect(controller.entries.value.size).toBe(0);
    expect(storage.counts.read).toBe(0);

    controller.attach();
    expect(controller.entries.value.size).toBe(1);
  });

  // The whole key is rewritten on every write, so a controller that serialised only
  // what it holds in memory would erase every track it had not read.
  it('preserves tracks it never recorded, even before it attaches', () => {
    const storage = createFakeStorageAdapter({
      initial: '["user_1.a3", "user_2.b1"]',
    });
    const controller = createStoriesViewedController(storage.adapter);

    controller.record({ outer: 2, inner: 0 });

    expect(JSON.parse(storage.stored ?? '[]').sort()).toEqual([
      'user_1.a3',
      'user_2.b1',
      'user_3.c1',
    ]);
  });

  it('keeps a second tab progress that landed after this one last read', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();
    controller.record({ outer: 0, inner: 0 });

    // Another tab records a different group. No event is delivered yet — this
    // controller still believes it holds the whole picture.
    storage.fireExternalChange('["user_1.a1", "user_2.b2"]');
    expect(controller.entries.value.size).toBe(2);

    controller.record({ outer: 0, inner: 1 });

    expect(JSON.parse(storage.stored ?? '[]').sort()).toEqual([
      'user_1.a2',
      'user_2.b2',
    ]);
  });

  it('adopts a change another document made', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    storage.fireExternalChange('["user_2.b2"]');

    expect(controller.resolve('user_2')).toEqual({ outer: 1, inner: 1 });
  });

  it('empties out when another document clears the area', () => {
    const storage = createFakeStorageAdapter({ initial: '["user_1.a2"]' });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    storage.fireExternalChange(null);

    expect(controller.entries.value.size).toBe(0);
  });

  it('keeps the position in memory when storage refuses the write, and retries next time', () => {
    const storage = createFakeStorageAdapter({ failWrites: true });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    expect(() => controller.record({ outer: 0, inner: 1 })).not.toThrow();
    expect(storage.stored).toBeNull();
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });

    storage.setFailWrites(false);
    controller.record({ outer: 0, inner: 2 });

    expect(storage.stored).toBe('["user_1.a3"]');
  });

  // Reading a position back into an identity is only ever asked of an on-screen
  // item, so a caller recording a stale one makes the key cycle throw. That
  // must not surface inside a playback callback.
  it('drops a write whose position cannot be read back into an identity', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    expect(() => controller.record({ outer: 99, inner: 0 })).not.toThrow();
    expect(storage.stored).toBeNull();
  });

  it('never asks the locator to fetch for an entry it cannot place', () => {
    const locateAsync = vi.fn();
    const storage = createFakeStorageAdapter({ initial: '["7"]' });
    const controller = createViewedStateController({
      storageKey: 'seen',
      storage: storage.adapter,
      ...urlIndexKey(() => 3, locateAsync),
    });
    controller.attach();

    expect(controller.resolve('')).toBeNull();
    expect(locateAsync).not.toHaveBeenCalled();
  });

  it('notifies observers on a record, a forget, and an external change', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    const observer = vi.fn();
    controller.entries.observe(observer);

    controller.record({ outer: 0, inner: 1 });
    storage.fireExternalChange('["user_2.b1"]');
    controller.forget();

    expect(observer).toHaveBeenCalledTimes(3);
  });

  it('clears storage rather than just memory', () => {
    const storage = createFakeStorageAdapter({
      initial: '["user_1.a2", "user_2.b1"]',
    });
    const controller = createStoriesViewedController(storage.adapter);
    controller.attach();

    controller.forget('user_1');
    expect(storage.stored).toBe('["user_2.b1"]');
    expect(controller.entries.value.size).toBe(1);

    controller.forget();
    expect(storage.stored).toBe('[]');
    expect(controller.entries.value.size).toBe(0);
  });

  it('attaches once however many times it is asked, and detaches cleanly', () => {
    const storage = createFakeStorageAdapter();
    const controller = createStoriesViewedController(storage.adapter);

    const detach = controller.attach();
    controller.attach();
    expect(storage.listenerCount).toBe(1);

    detach();
    detach();
    expect(storage.listenerCount).toBe(0);
  });

  it('keeps one entry for a whole gallery when no tracking is supplied', () => {
    const storage = createFakeStorageAdapter();
    const controller = createViewedStateController({
      storageKey: 'seen',
      storage: storage.adapter,
      ...urlIndexKey(() => 10),
    });
    controller.attach();

    controller.record(4);
    controller.record(2);
    controller.record(7);

    expect(storage.stored).toBe('["7"]');
    expect(controller.resolve('')).toBe(7);
  });
});

describe('entry lifetimes', () => {
  const _kDay = 24 * 60 * 60 * 1000;
  const _kStart = 1_785_600_000_000;

  const createExpiring = (storage: StorageAdapter, ttlMs?: number) =>
    createViewedStateController({
      storageKey: 'seen',
      storage,
      ttlMs,
      ...urlStableIdTwoAxisKey<Group, Story>({
        outerItems: () => feed,
        innerItems: (outer) => outer.stories,
      }),
      ...twoAxisViewedTracking,
    });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(_kStart);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('leaves the payload as bare strings when no lifetime is set', () => {
    const storage = createFakeStorageAdapter();
    const controller = createExpiring(storage.adapter);
    controller.attach();

    controller.record({ outer: 0, inner: 1 });
    vi.setSystemTime(_kStart + 5000 * _kDay);
    controller.record({ outer: 1, inner: 0 });

    expect(storage.stored).toBe('["user_1.a2","user_2.b1"]');
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });
  });

  it('stamps entries once a lifetime is set', () => {
    const storage = createFakeStorageAdapter();
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    controller.record({ outer: 0, inner: 1 });

    expect(storage.stored).toBe(`[["user_1.a2",${_kStart}]]`);
  });

  it('reads a payload mixing stamped and unstamped entries', () => {
    const storage = createFakeStorageAdapter({
      initial: `["user_1.a2",["user_2.b1",${_kStart}]]`,
    });
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });
    expect(controller.resolve('user_2')).toEqual({ outer: 1, inner: 0 });
  });

  it('forgets an entry older than its lifetime', () => {
    const storage = createFakeStorageAdapter({
      initial: `[["user_1.a2",${_kStart - 2 * _kDay}]]`,
    });
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    expect(controller.resolve('user_1')).toBeNull();
    expect(controller.entries.value.size).toBe(0);
  });

  it('drops an expired entry from storage on the next write', () => {
    const storage = createFakeStorageAdapter({
      initial: `[["user_1.a2",${_kStart - 2 * _kDay}],["user_2.b1",${_kStart}]]`,
    });
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    controller.record({ outer: 2, inner: 0 });

    expect(storage.stored).not.toContain('user_1.a2');
    expect(storage.stored).toContain('user_2.b1');
    expect(storage.stored).toContain('user_3.c1');
  });

  it('keeps a track alive while it is still being watched', () => {
    const storage = createFakeStorageAdapter();
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    controller.record({ outer: 0, inner: 0 });

    // Twenty hours on, still inside the day, and watched again — which restarts
    // the clock rather than counting from the first view.
    vi.setSystemTime(_kStart + 20 * 60 * 60 * 1000);
    controller.record({ outer: 0, inner: 1 });

    vi.setSystemTime(_kStart + 40 * 60 * 60 * 1000);
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });
  });

  it("refreshes a track's lifetime even when the position is behind", () => {
    const storage = createFakeStorageAdapter();
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    controller.record({ outer: 0, inner: 2 });

    // Re-watching from the start says nothing new about progress, but it does
    // say the viewer is still here.
    vi.setSystemTime(_kStart + 20 * 60 * 60 * 1000);
    controller.record({ outer: 0, inner: 0 });

    vi.setSystemTime(_kStart + 40 * 60 * 60 * 1000);
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 2 });
  });

  it('expires a track that stopped being watched', () => {
    const storage = createFakeStorageAdapter();
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    controller.record({ outer: 0, inner: 1 });

    vi.setSystemTime(_kStart + 2 * _kDay);
    expect(createExpiring(storage.adapter, _kDay).resolve('user_1')).toBeNull();
  });

  it('treats an entry with no timestamp as fresh, and stamps it on the next write', () => {
    const storage = createFakeStorageAdapter({
      initial: '["user_1.a2","user_2.b1"]',
    });
    const controller = createExpiring(storage.adapter, _kDay);
    controller.attach();

    // Written long before any lifetime existed, so switching one on must not
    // read as "older than a day" and delete it.
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });

    controller.record({ outer: 2, inner: 0 });
    expect(storage.stored).toBe(
      `[["user_1.a2",${_kStart}],["user_2.b1",${_kStart}],["user_3.c1",${_kStart}]]`,
    );
  });

  it('leaves lifetimes behind when the option is taken away again', () => {
    const storage = createFakeStorageAdapter({
      initial: `[["user_1.a2",${_kStart - 5000 * _kDay}]]`,
    });
    const controller = createExpiring(storage.adapter);
    controller.attach();

    // Ancient by any lifetime, but none is configured now, so it stands.
    expect(controller.resolve('user_1')).toEqual({ outer: 0, inner: 1 });

    controller.record({ outer: 1, inner: 0 });
    expect(storage.stored).toBe('["user_1.a2","user_2.b1"]');
  });
});

/**
 * A snippet only reads as an example when it is tagged as one — untagged, it
 * renders as description prose and editor hover shows no example at all.
 */
describe('documentation', () => {
  const source = readFileSync(join(__dirname, 'viewedState.ts'), 'utf8');

  it.each([
    'createViewedStateController',
    'twoAxisViewedTracking',
    'ViewedStateOptions',
  ])('gives %s a tagged example', (name) => {
    // Anchor on the declaration, not the first mention: the name also appears
    // inside earlier doc comments as an `{@link}`.
    const declared = source.search(
      new RegExp(`^export (const|interface) ${name}\\b`, 'm'),
    );
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

/**
 * A storage area whose every operation can be made to throw, standing in for
 * the failures the web storage specification actually defines.
 */
const fakeStorage = (overrides: Partial<Storage> = {}): Storage =>
  ({
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
    ...overrides,
  }) as Storage;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('web storage adapters', () => {
  it('reads and writes through the area', () => {
    const stored = new Map<string, string>();
    vi.stubGlobal(
      'localStorage',
      fakeStorage({
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => {
          stored.set(key, value);
        },
      }),
    );
    const adapter = createLocalStorageAdapter();

    adapter.write('seen', '["a"]');

    expect(adapter.read('seen')).toBe('["a"]');
    expect(adapter.read('absent')).toBeNull();
  });

  it('degrades where there is no storage binding at all', () => {
    vi.stubGlobal('localStorage', undefined);
    const adapter = createLocalStorageAdapter();

    expect(adapter.read('seen')).toBeNull();
    expect(() => adapter.write('seen', '["a"]')).not.toThrow();
    expect(adapter.subscribe?.('seen', () => undefined)).toBeTypeOf('function');
  });

  // Node carries a `localStorage` global that has none of the methods unless
  // web storage is switched on, so a server render finds a name and nothing
  // behind it. Present is not usable.
  it('degrades where the binding exists but carries no storage methods', () => {
    vi.stubGlobal('localStorage', {});
    const adapter = createLocalStorageAdapter();

    expect(adapter.read('seen')).toBeNull();
    expect(() => adapter.write('seen', '["a"]')).not.toThrow();
    expect(adapter.subscribe?.('seen', () => undefined)).toBeTypeOf('function');
  });

  it('degrades where reaching the area is refused', () => {
    const original = Object.getOwnPropertyDescriptor(
      globalThis,
      'sessionStorage',
    );
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    });

    try {
      const adapter = createSessionStorageAdapter();

      expect(adapter.read('seen')).toBeNull();
      expect(() => adapter.write('seen', '["a"]')).not.toThrow();
    } finally {
      if (original)
        Object.defineProperty(globalThis, 'sessionStorage', original);
      else delete (globalThis as Record<string, unknown>)['sessionStorage'];
    }
  });

  it('drops a write the area refuses, and tries again on the next one', () => {
    const stored = new Map<string, string>();
    let full = true;
    vi.stubGlobal(
      'localStorage',
      fakeStorage({
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (full) throw new DOMException('full', 'QuotaExceededError');
          stored.set(key, value);
        },
      }),
    );
    const adapter = createLocalStorageAdapter();

    expect(() => adapter.write('seen', '["a"]')).not.toThrow();
    expect(adapter.read('seen')).toBeNull();

    full = false;
    adapter.write('seen', '["b"]');

    expect(adapter.read('seen')).toBe('["b"]');
  });

  // Web storage defines no failure for a read: `getItem` answers with the value
  // or with `null`. Guarding it would be a branch nothing can enter, and would
  // imply a risk that really lives at the area access and at `setItem`. A
  // backing that breaks that contract is a broken backing, and says so.
  it('does not guard the one read operation that cannot fail', () => {
    vi.stubGlobal(
      'localStorage',
      fakeStorage({
        getItem: () => {
          throw new Error('a conforming storage never does this');
        },
      }),
    );
    const adapter = createLocalStorageAdapter();

    expect(() => adapter.read('seen')).toThrow(
      'a conforming storage never does this',
    );
  });
});

describe('createMemoryStorageAdapter', () => {
  it('keeps values for the life of the adapter and hears from nobody', () => {
    const adapter = createMemoryStorageAdapter();

    expect(adapter.read('seen')).toBeNull();
    adapter.write('seen', '["a"]');

    expect(adapter.read('seen')).toBe('["a"]');
    expect(adapter.subscribe).toBeUndefined();
    expect(createMemoryStorageAdapter().read('seen')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { createFakeUrlAdapter } from '../../testing';
import { createUrlStateController } from './urlState';
import {
  base64UrlCodec,
  createStableIdCodec,
  createStableIdLocator,
  urlStableIdKey,
  urlStableIdTwoAxisKey,
  type Identified,
} from './urlStableIdKey';
import type { UrlCodec } from './urlState';
import type { TwoAxisPosition } from './urlIndexKey';

interface Photo extends Identified {
  id: string;
}

// A consumer-supplied wire transform: reversibly uppercases with a marker
// prefix, so a hashCodec that is neither raw nor base64url still round-trips.
const upperCodec: UrlCodec<string> = {
  encode: (id) => `U:${id.toUpperCase()}`,
  decode: (raw) => (raw.startsWith('U:') ? raw.slice(2).toLowerCase() : null),
};

const photos = (...ids: string[]): Photo[] => ids.map((id) => ({ id }));

describe('urlStableIdKey codec', () => {
  it('writes the id verbatim by default', () => {
    const { codec } = urlStableIdKey<Photo>({ items: () => photos('a', 'b') });
    expect(codec.encode('post_42')).toBe('post_42');
    expect(codec.decode('post_42')).toBe('post_42');
  });

  it('names nothing for a blank parameter', () => {
    const { codec } = urlStableIdKey<Photo>({ items: () => [] });
    expect(codec.decode('')).toBeNull();
  });

  it('base64url round-trips the id under base64UrlCodec, no padding or unsafe chars', () => {
    const { codec } = urlStableIdKey<Photo>({
      items: () => [],
      hashCodec: base64UrlCodec,
    });
    const wire = codec.encode('post_42');
    expect(wire).not.toBe('post_42');
    expect(wire).not.toMatch(/[+/=]/);
    expect(codec.decode(wire)).toBe('post_42');
  });

  it('survives a non-ASCII id through the base64url round-trip', () => {
    const { codec } = urlStableIdKey<Photo>({
      items: () => [],
      hashCodec: base64UrlCodec,
    });
    expect(codec.decode(codec.encode('café_★'))).toBe('café_★');
  });

  it('self-heals a hashed parameter that is not valid base64url', () => {
    const { codec } = urlStableIdKey<Photo>({
      items: () => [],
      hashCodec: base64UrlCodec,
    });
    expect(codec.decode('!!! not base64 !!!')).toBeNull();
  });

  it('routes the id through a consumer hashCodec instead of raw or base64url', () => {
    const { codec } = urlStableIdKey<Photo>({
      items: () => [],
      hashCodec: upperCodec,
    });
    expect(codec.encode('post_42')).toBe('U:POST_42');
    expect(codec.decode('U:POST_42')).toBe('post_42');
    // A wire the custom codec rejects self-heals, blank still names nothing.
    expect(codec.decode('post_42')).toBeNull();
    expect(codec.decode('')).toBeNull();
  });
});

describe('createStableIdCodec (exported for composing)', () => {
  it('writes the id raw and reads it back when no hashCodec is given', () => {
    const codec = createStableIdCodec();
    expect(codec.encode('post_42')).toBe('post_42');
    expect(codec.decode('post_42')).toBe('post_42');
    expect(codec.decode('')).toBeNull();
  });

  it('base64url round-trips the id under base64UrlCodec, obscuring the wire', () => {
    const codec = createStableIdCodec(base64UrlCodec);
    const wire = codec.encode('post_42');
    expect(wire).not.toBe('post_42'); // obscured
    expect(wire).not.toMatch(/[.+/=]/); // url-safe alphabet, no padding
    expect(codec.decode(wire)).toBe('post_42');
  });

  it('base64UrlCodec is the exact mechanism a hashCodec plugs in', () => {
    const viaOption = createStableIdCodec(base64UrlCodec);
    expect(viaOption.encode('post_42')).toBe(base64UrlCodec.encode('post_42'));
    expect(base64UrlCodec.decode(base64UrlCodec.encode('post_42'))).toBe(
      'post_42',
    );
  });

  it('delegates to a consumer hashCodec, guarding blank before it', () => {
    const codec = createStableIdCodec(upperCodec);
    expect(codec.encode('post_42')).toBe('U:POST_42');
    expect(codec.decode('U:POST_42')).toBe('post_42');
    expect(codec.decode('')).toBeNull();
  });
});

describe('createStableIdLocator (exported for composing)', () => {
  it('pairs with the codec to build a stable-id key by hand', () => {
    // The two exported halves compose into a key just like urlStableIdKey.
    const key = {
      codec: createStableIdCodec(),
      locator: createStableIdLocator<Photo>(() => photos('a', 'b', 'c')),
    };
    expect(key.locator.locate('b')).toBe(1);
    expect(key.locator.identify(2)).toBe('c');
    expect(key.codec.encode('c')).toBe('c');
  });
});

describe('urlStableIdKey locator', () => {
  it('resolves an id to its current index', () => {
    const { locator } = urlStableIdKey<Photo>({
      items: () => photos('a', 'b', 'c'),
    });
    expect(locator.locate('b')).toBe(1);
    expect(locator.identify(2)).toBe('c');
  });

  it('drops an id that is not in the list', () => {
    const { locator } = urlStableIdKey<Photo>({
      items: () => photos('a', 'b'),
    });
    expect(locator.locate('gone')).toBeNull();
  });

  it('follows an item across a reorder — where an index bookmark would not', () => {
    let list = photos('a', 'b', 'c');
    const { locator } = urlStableIdKey<Photo>({ items: () => list });
    expect(locator.locate('c')).toBe(2);
    list = photos('c', 'a', 'b');
    expect(locator.locate('c')).toBe(0);
  });

  it('has no async pager unless one is passed', () => {
    const { locator } = urlStableIdKey<Photo>({ items: () => photos('a') });
    expect(locator.locateAsync).toBeUndefined();
  });

  it('pages an unloaded id in through locateAsync', async () => {
    const all = photos('a', 'b', 'c');
    let loaded = photos('a'); // only the first has arrived
    const { locator } = urlStableIdKey<Photo>({
      items: () => loaded,
      locateAsync: async (id) => {
        loaded = all; // fetch the rest
        const index = loaded.findIndex((item) => item.id === id);
        return index === -1 ? null : index;
      },
    });

    expect(locator.locate('c')).toBeNull(); // not loaded yet
    await expect(locator.locateAsync!('c')).resolves.toBe(2); // paged in
  });
});

describe('urlStableIdKey through the shared url-state controller', () => {
  it('opens at the id and self-heals a gone id out of the url', () => {
    let list = photos('a', 'b', 'c');
    const fake = createFakeUrlAdapter('?photo=b');
    const controller = createUrlStateController<string, number>({
      param: 'photo',
      adapter: fake.adapter,
      ...urlStableIdKey<Photo>({ items: () => list }),
    });
    controller.attach();
    expect(controller.position.value).toBe(1);

    // The list changes; a write re-encodes the id, not the index.
    controller.set(2);
    expect(fake.adapter.read()).toBe('?photo=c');

    // The named item disappears: the parameter drops rather than opening a
    // neighbour that slid into its slot.
    list = photos('a');
    const gone = createFakeUrlAdapter('?photo=c');
    const healed = createUrlStateController<string, number>({
      param: 'photo',
      adapter: gone.adapter,
      ...urlStableIdKey<Photo>({ items: () => list }),
    });
    healed.attach();
    expect(healed.position.value).toBeNull();
    expect(gone.adapter.read()).toBe('');
  });
});

interface Group extends Identified {
  id: string;
  stories: number;
}

const groups = (...defs: [string, number][]): Group[] =>
  defs.map(([id, stories]) => ({ id, stories }));

describe('urlStableIdTwoAxisKey', () => {
  const key = (list: () => Group[]) =>
    urlStableIdTwoAxisKey<Group>({
      outerItems: list,
      innerCounts: () => list().map((group) => group.stories),
    });

  it('addresses the outer by id and the inner by a dotted index', () => {
    const { codec } = key(() => groups(['alice', 2], ['bob', 3]));
    expect(codec.encode({ outer: 'bob', inner: 2 })).toBe('bob.2');
    expect(codec.decode('bob.2')).toEqual({ outer: 'bob', inner: 2 });
  });

  it('splits on the last dot so an id may contain dots', () => {
    const { codec } = key(() => groups(['user.42', 1]));
    expect(codec.decode('user.42.0')).toEqual({ outer: 'user.42', inner: 0 });
  });

  it('resolves outer id to index and bounds the inner against it', () => {
    const { locator } = key(() => groups(['alice', 2], ['bob', 3]));
    expect(locator.locate({ outer: 'bob', inner: 2 })).toEqual({
      outer: 1,
      inner: 2,
    });
    // bob has 3 stories (0..2); inner 3 is out of range → null.
    expect(locator.locate({ outer: 'bob', inner: 3 })).toBeNull();
    // a gone outer id → null.
    expect(locator.locate({ outer: 'gone', inner: 0 })).toBeNull();
  });

  it('drives the controller, opening at a dotted id', () => {
    const list = () => groups(['alice', 2], ['bob', 3]);
    const fake = createFakeUrlAdapter('?story=bob.1');
    const controller = createUrlStateController<
      { outer: string; inner: number },
      TwoAxisPosition
    >({
      param: 'story',
      adapter: fake.adapter,
      ...key(list),
    });
    controller.attach();
    expect(controller.position.value).toEqual({ outer: 1, inner: 1 });

    controller.set({ outer: 0, inner: 1 });
    expect(fake.adapter.read()).toBe('?story=alice.1');
  });

  it('obscures only the outer id when hash is on, inner stays a plain index', () => {
    const { codec } = urlStableIdTwoAxisKey<Group>({
      outerItems: () => groups(['alice', 2]),
      innerCounts: () => [2],
      hashCodec: base64UrlCodec,
    });
    const wire = codec.encode({ outer: 'alice', inner: 1 });
    expect(wire).toMatch(/\.1$/);
    expect(wire).not.toMatch(/^alice/);
    expect(codec.decode(wire)).toEqual({ outer: 'alice', inner: 1 });
  });
});

interface StoryGroup extends Identified {
  id: string;
  stories: Identified[];
}

const feed = (): StoryGroup[] => [
  { id: 'alice', stories: [{ id: 's_a1' }, { id: 's_a2' }] },
  { id: 'bob', stories: [{ id: 's_b1' }, { id: 's_b2' }, { id: 's_b3' }] },
];

describe('urlStableIdTwoAxisKey with an id-addressed inner axis', () => {
  const idInner = (list: () => StoryGroup[] = feed) =>
    urlStableIdTwoAxisKey<StoryGroup, Identified>({
      outerItems: list,
      innerItems: (group) => group.stories,
    });

  it('spells both halves as ids', () => {
    const { codec } = idInner();
    expect(codec.encode({ outer: 'bob', inner: 's_b2' })).toBe('bob.s_b2');
    expect(codec.decode('bob.s_b2')).toEqual({ outer: 'bob', inner: 's_b2' });
  });

  it('resolves both ids to indices and bounds the inner within its outer', () => {
    const { locator } = idInner();
    expect(locator.locate({ outer: 'bob', inner: 's_b2' })).toEqual({
      outer: 1,
      inner: 1,
    });
    // an inner id that belongs to a different group does not leak across
    expect(locator.locate({ outer: 'alice', inner: 's_b1' })).toBeNull();
    expect(locator.locate({ outer: 'bob', inner: 'gone' })).toBeNull();
  });

  it('writes an inner index back to its id', () => {
    const { locator } = idInner();
    expect(locator.identify({ outer: 1, inner: 2 })).toEqual({
      outer: 'bob',
      inner: 's_b3',
    });
  });

  it('follows an inner item across a reorder within its group', () => {
    let list: StoryGroup[] = [
      { id: 'alice', stories: [{ id: 's_a1' }, { id: 's_a2' }] },
    ];
    const { locator } = idInner(() => list);
    expect(locator.locate({ outer: 'alice', inner: 's_a2' })).toEqual({
      outer: 0,
      inner: 1,
    });
    list = [{ id: 'alice', stories: [{ id: 's_a2' }, { id: 's_a1' }] }];
    expect(locator.locate({ outer: 'alice', inner: 's_a2' })).toEqual({
      outer: 0,
      inner: 0,
    });
  });

  it('drives the controller, opening at a doubly-id parameter', () => {
    const fake = createFakeUrlAdapter('?story=bob.s_b1');
    const controller = createUrlStateController<
      { outer: string; inner: string },
      TwoAxisPosition
    >({
      param: 'story',
      adapter: fake.adapter,
      ...idInner(),
    });
    controller.attach();
    expect(controller.position.value).toEqual({ outer: 1, inner: 0 });

    controller.set({ outer: 0, inner: 1 });
    expect(fake.adapter.read()).toBe('?story=alice.s_a2');
  });

  it('base64url-encodes both halves when hash is on, one dot delimiter only', () => {
    const { codec } = urlStableIdTwoAxisKey<StoryGroup, Identified>({
      outerItems: feed,
      innerItems: (group) => group.stories,
      hashCodec: base64UrlCodec,
    });
    const wire = codec.encode({ outer: 'bob', inner: 's_b2' });
    expect(wire.split('.')).toHaveLength(2);
    expect(wire).not.toMatch(/bob|s_b2/);
    expect(codec.decode(wire)).toEqual({ outer: 'bob', inner: 's_b2' });
  });
});

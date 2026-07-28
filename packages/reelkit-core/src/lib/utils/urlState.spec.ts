import { createFakeUrlAdapter, type FakeUrlAdapter } from '../../testing';
import { describe, it, expect, vi } from 'vitest';
import {
  createUrlStateController,
  type UrlStateController,
  type UrlCodec,
  type UrlLocator,
} from './urlState';
import { indexCodec } from './urlIndexKey';
import { createDeferred } from './deferred';
import type { Dispose } from './signal';

const createFakeAdapter = (initial = '', notifyOnPush = false) =>
  createFakeUrlAdapter(initial, { notifyOnPush });

const attachController = (
  fake: FakeUrlAdapter,
  param = 'photo',
): [UrlStateController, Dispose] => {
  const ctrl = createUrlStateController({ param, adapter: fake.adapter });
  return [ctrl, ctrl.attach()];
};

describe('createUrlStateController', () => {
  it('seeds the value from the current url', () => {
    const fake = createFakeAdapter('?photo=3');
    const [photo] = attachController(fake);

    expect(photo.value.value).toBe('3');
  });

  it('seeds null when the parameter is absent', () => {
    const fake = createFakeAdapter('?other=1');
    const [photo] = attachController(fake);

    expect(photo.value.value).toBe(null);
  });

  it('adds one history entry on the first write and none afterwards', () => {
    const fake = createFakeAdapter('');
    const [photo] = attachController(fake);

    photo.set(3);
    expect(fake.depth).toBe(2);

    photo.set(4);
    photo.set(5);
    expect(fake.depth).toBe(2);
    expect(fake.adapter.read()).toBe('?photo=5');
  });

  it('preserves other query parameters', () => {
    const fake = createFakeAdapter('?tab=media&sort=new');
    const [photo] = attachController(fake);

    photo.set(2);

    const search = new URLSearchParams(fake.adapter.read());
    expect(search.get('tab')).toBe('media');
    expect(search.get('sort')).toBe('new');
    expect(search.get('photo')).toBe('2');
  });

  it('steps back when closing an entry it pushed itself', () => {
    const fake = createFakeAdapter('?tab=media');
    const [photo] = attachController(fake);

    photo.set(3);
    expect(fake.depth).toBe(2);

    photo.set(null);

    // The pushed entry is gone rather than stranded ahead of the cursor.
    expect(fake.cursor).toBe(0);
    expect(photo.value.value).toBe(null);
    expect(fake.adapter.read()).toBe('?tab=media');
  });

  it('removes the parameter in place when the link arrived with the page', () => {
    // A shared link: the parameter is already there and nothing of ours is
    // behind it, so stepping back would leave the site.
    const fake = createFakeAdapter('?photo=3');
    const [photo] = attachController(fake);

    photo.set(null);

    expect(fake.cursor).toBe(0);
    expect(fake.depth).toBe(1);
    expect(photo.value.value).toBe(null);
    expect(fake.adapter.read()).toBe('');
  });

  it('pops at most one entry when closed repeatedly', () => {
    const fake = createFakeAdapter('?a=1');
    const [photo] = attachController(fake);

    photo.set(3);
    const goBack = vi.spyOn(fake.adapter, 'goBack');

    photo.set(null);
    photo.set(null);
    photo.set(null);

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(fake.cursor).toBe(0);
  });

  it('clears an in-flight close latch on reattach', () => {
    const fake = createFakeAdapter('');
    const [photo, dispose] = attachController(fake);

    photo.set(3);

    // The back step is requested but its popstate never arrives before we
    // detach, so `sync` never runs to clear the close latch.
    const goBack = vi.spyOn(fake.adapter, 'goBack').mockImplementation(() => {
      /* step requested, not yet delivered */
    });

    photo.set(null);
    expect(goBack).toHaveBeenCalledTimes(1);

    dispose();
    photo.attach();

    // A close that was mid-flight at teardown must not wedge the latch shut
    // and block this one.
    photo.set(null);
    expect(goBack).toHaveBeenCalledTimes(2);
  });

  it('follows the url when the user navigates back', () => {
    const fake = createFakeAdapter('');
    const [photo] = attachController(fake);

    photo.set(3);
    expect(photo.value.value).toBe('3');

    fake.adapter.goBack();

    expect(photo.value.value).toBe(null);
  });

  it('stops following once disposed', () => {
    const fake = createFakeAdapter('?photo=1');
    const [photo, dispose] = attachController(fake);

    expect(photo.value.value).toBe('1');

    dispose();
    fake.adapter.push('?photo=9');
    fake.fireUrlChange();

    expect(photo.value.value).toBe('1');
  });

  it('steps back when closing an entry a link pushed while it was running', () => {
    const fake = createFakeAdapter('?tab=media');
    const [photo] = attachController(fake);

    // An ordinary link, not the controller: no ownership stamp of ours.
    fake.adapter.push('?tab=media&photo=3');
    fake.fireUrlChange();

    expect(photo.value.value).toBe('3');

    photo.set(null);

    // The entry was claimed on the way in, so closing pops it rather than
    // leaving a copy of the page behind.
    expect(fake.cursor).toBe(0);
    expect(fake.adapter.read()).toBe('?tab=media');
  });

  it('does not claim a link that arrived with the page', () => {
    // Nothing of ours is behind a cold deep link, so stepping back would leave
    // the site entirely.
    const fake = createFakeAdapter('?photo=3');
    const [photo] = attachController(fake);

    const goBack = vi.spyOn(fake.adapter, 'goBack');
    photo.set(null);

    expect(goBack).not.toHaveBeenCalled();
    expect(fake.depth).toBe(1);
    expect(fake.adapter.read()).toBe('');
  });

  it('claims without adding a history entry', () => {
    const fake = createFakeAdapter('');
    attachController(fake);

    fake.adapter.push('?photo=2');
    fake.fireUrlChange();

    // Claiming annotates the entry it landed on; it does not stack another.
    expect(fake.depth).toBe(2);
    expect(fake.adapter.read()).toBe('?photo=2');
  });

  describe('index derivation', () => {
    /** The raw text is the identity — keeps these tests about the locator. */
    const idCodec: UrlCodec<string> = {
      decode: (raw) => raw,
      encode: (id) => id,
    };

    /** An identity's position in a collection that fills in over time. */
    const pagedLocate = (loaded: string[]): UrlLocator<string> => ({
      locate: (id) => {
        const found = loaded.indexOf(id);
        return found >= 0 ? found : null;
      },
      identify: (index) => loaded[index],
    });

    /** Lets a locateAsync continuation and the controller's settle both run. */
    const flushMicrotasks = () => new Promise((done) => setTimeout(done, 0));

    const attachDeriving = <Id = number>(
      fake: FakeUrlAdapter,
      extra: { codec?: UrlCodec<Id>; locator?: UrlLocator<Id> },
    ): [UrlStateController, Dispose] => {
      const controller = createUrlStateController({
        param: 'photo',
        adapter: fake.adapter,
        ...extra,
      } as Parameters<typeof createUrlStateController<Id>>[0]);
      return [controller, controller.attach()];
    };

    it('leaves the index alone without a codec or locator', () => {
      const fake = createFakeAdapter('?photo=3');
      const [photo] = attachController(fake);

      expect(photo.value.value).toBe('3');
      expect(photo.position.value).toBe(null);
    });

    it('reads a plain integer index through the built-in codec', () => {
      const fake = createFakeAdapter('?photo=3');
      const [photo] = attachDeriving(fake, { codec: indexCodec });

      expect(photo.position.value).toBe(3);
    });

    it.each(['bogus', '-1', '1.5', ''])(
      'treats %o as naming no slide',
      (raw) => {
        const fake = createFakeAdapter(`?photo=${raw}`, true);
        const [photo] = attachDeriving(fake, { codec: indexCodec });

        expect(photo.position.value).toBe(null);
      },
    );

    // `Number` reads blank input as 0, which would otherwise pass the
    // non-negative-integer check and open slide 0. The Unicode cases matter
    // because `?photo=%20` and a decoded `&nbsp;` both arrive as whitespace,
    // and `.trim()` — not a plain `=== ''` — is what rejects them.
    it.each(['', ' ', '  ', '\t', ' ', '　'])(
      'the index codec reads blank input %o as no slide',
      (raw) => {
        expect(indexCodec.decode(raw)).toBe(null);
      },
    );

    it('reads the index by locating a decoded identity', () => {
      const fake = createFakeAdapter('?photo=b');
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: pagedLocate(['a', 'b', 'c']),
      });

      expect(photo.position.value).toBe(1);
    });

    it('serializes writes by identifying then encoding', () => {
      const fake = createFakeAdapter('');
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: pagedLocate(['a', 'b', 'c']),
      });

      photo.set(2);

      expect(fake.adapter.read()).toBe('?photo=c');
    });

    // An identity codec — base64 of an entity id here — resolves a bookmarked
    // value to *the entity*, wherever it now sits, rather than to a fixed slot.
    // A bare integer codec cannot: `?photo=2` would name whatever slid into
    // position 2 after a reorder. This is the whole reason to encode identity.
    it('follows the entity, not the slot, when the collection reorders', () => {
      const feed = [{ id: 'alpha' }, { id: 'bravo' }, { id: 'charlie' }];
      // Wire: base64 ↔ id, collection-blind. Lookup: id ↔ index, over `feed`.
      const codec: UrlCodec<string> = { decode: atob, encode: btoa };
      const locator: UrlLocator<string> = {
        locate: (id) => {
          const found = feed.findIndex((entity) => entity.id === id);
          return found >= 0 ? found : null;
        },
        identify: (index) => feed[index].id,
      };

      const fake = createFakeAdapter('');
      const [photo] = attachDeriving<string>(fake, { codec, locator });

      // Bookmark 'charlie' — index 2 today. The raw search string carries the
      // base64 percent-encoded (`=` padding → `%3D`); reading the param back
      // the way the controller does decodes it, so assert the round-trip value
      // rather than the on-the-wire form.
      photo.set(2);
      const bookmarked = fake.adapter.read();
      expect(new URLSearchParams(bookmarked).get('photo')).toBe(
        btoa('charlie'),
      );

      // The feed reshuffles: 'charlie' is now first. The same bookmarked value
      // must land on it at its new index, not on whatever took slot 2.
      feed.reverse();

      const revisit = createFakeAdapter(bookmarked, true);
      const [reopened] = attachDeriving<string>(revisit, { codec, locator });

      expect(reopened.position.value).toBe(0);
    });

    it('removes a parameter the codec cannot read and stays closed', () => {
      const fake = createFakeAdapter('?photo=bogus');
      const [photo] = attachDeriving(fake, {
        codec: { decode: () => null, encode: String },
      });

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('');
    });

    it('keeps the opened index when the url changes while open', () => {
      const fake = createFakeAdapter('?photo=1');
      const [photo] = attachDeriving(fake, {
        codec: { decode: Number, encode: String },
      });
      expect(photo.position.value).toBe(1);

      fake.adapter.push('?photo=2');
      fake.fireUrlChange();

      expect(photo.position.value).toBe(1);
    });

    it('closes when the parameter goes away', () => {
      const fake = createFakeAdapter('');
      const [photo] = attachDeriving(fake, {
        codec: { decode: Number, encode: String },
      });

      fake.adapter.push('?photo=2');
      fake.fireUrlChange();
      expect(photo.position.value).toBe(2);

      fake.adapter.goBack();

      expect(photo.position.value).toBe(null);
    });

    it('leaves the parameter in place while locateAsync is in flight', () => {
      const fake = createFakeAdapter('?photo=999');
      const pending = createDeferred();
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          ...pagedLocate([]),
          locateAsync: async () => {
            await pending.promise;
            return null;
          },
        },
      });

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('?photo=999');
    });

    it('calls locateAsync only when the sync locate misses', async () => {
      const fake = createFakeAdapter('?photo=b');
      const locateAsync = vi.fn(async () => 0);
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: { ...pagedLocate(['a', 'b', 'c']), locateAsync },
      });

      await flushMicrotasks();

      // 'b' is loaded at index 1 — the async fallback must not fire.
      expect(locateAsync).not.toHaveBeenCalled();
      expect(photo.position.value).toBe(1);
    });

    it('opens at the index locateAsync settles on when locate misses', async () => {
      const fake = createFakeAdapter('?photo=late');
      const pending = createDeferred();
      const loaded: string[] = [];
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          ...pagedLocate(loaded),
          locateAsync: async (id) => {
            await pending.promise;
            loaded.push('a', 'b', id);
            return loaded.indexOf(id);
          },
        },
      });

      expect(photo.position.value).toBe(null);

      pending.resolve();
      await flushMicrotasks();

      expect(photo.position.value).toBe(2);
    });

    it('removes the parameter when locateAsync settles on nothing', async () => {
      const fake = createFakeAdapter('?photo=gone');
      const pending = createDeferred();
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        // The pages arrive, and none of them holds this item.
        locator: {
          ...pagedLocate(['a', 'b']),
          locateAsync: async () => {
            await pending.promise;
            return null;
          },
        },
      });

      pending.resolve();
      await flushMicrotasks();

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('');
    });

    it('does not re-run locate after locateAsync settles', async () => {
      const fake = createFakeAdapter('?photo=late');
      // `locate` never finds the item, so a re-run would miss and self-heal.
      // The async answer has to stand on its own.
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          locate: () => null,
          identify: () => 'late',
          locateAsync: async () => 3,
        },
      });

      await flushMicrotasks();

      expect(photo.position.value).toBe(3);
      expect(fake.adapter.read()).toBe('?photo=late');
    });

    it('removes the parameter when locateAsync rejects', async () => {
      const fake = createFakeAdapter('?photo=boom');
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          ...pagedLocate([]),
          locateAsync: () => Promise.reject(new Error('network')),
        },
      });

      await flushMicrotasks();

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('');
    });

    it('discards a locateAsync that settles after the url moved on', async () => {
      const fake = createFakeAdapter('?photo=first');
      const first = createDeferred();
      const second = createDeferred();
      const gates = [first, second];
      const loaded: string[] = [];
      let call = 0;

      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          ...pagedLocate(loaded),
          locateAsync: async (id) => {
            await gates[call++].promise;
            loaded.push(id);
            return loaded.indexOf(id);
          },
        },
      });

      fake.adapter.push('?photo=second');
      fake.fireUrlChange();

      // The stale run finishes first and must not open anything, even though
      // its own item is now loaded.
      first.resolve();
      await flushMicrotasks();
      expect(photo.position.value).toBe(null);

      second.resolve();
      await flushMicrotasks();
      expect(photo.position.value).toBe(1);
    });

    it('does not restart the lookup when the url changes but the value does not', async () => {
      const fake = createFakeAdapter('?photo=late');
      const loaded: string[] = [];
      const locateAsync = vi.fn(async (id: string) => {
        loaded.push(id);
        return loaded.indexOf(id);
      });
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: { ...pagedLocate(loaded), locateAsync },
      });

      // A router re-emitting on its own key, or the ownership claim's own
      // replace: the parameter is untouched, so the fetch must not run again.
      fake.fireUrlChange();
      fake.fireUrlChange();
      await flushMicrotasks();

      expect(locateAsync).toHaveBeenCalledTimes(1);
      expect(photo.position.value).toBe(0);
    });

    it('discards a locateAsync that settles after the parameter is cleared', async () => {
      const fake = createFakeAdapter('');
      const pending = createDeferred();
      const loaded: string[] = [];
      const [photo] = attachDeriving<string>(fake, {
        codec: idCodec,
        locator: {
          ...pagedLocate(loaded),
          locateAsync: async (id) => {
            await pending.promise;
            loaded.push(id);
            return loaded.indexOf(id);
          },
        },
      });

      fake.adapter.push('?photo=late');
      fake.fireUrlChange();
      fake.adapter.goBack();

      pending.resolve();
      await flushMicrotasks();

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('');
    });

    it('discards a locateAsync that settles after dispose', async () => {
      const fake = createFakeAdapter('?photo=late');
      const pending = createDeferred();
      const [photo, dispose] = attachDeriving<string>(fake, {
        codec: idCodec,
        // Settling on nothing, because a settle that reached the disposed
        // controller would clear the url — which is the observable trace this
        // asserts against, since a discarded settle leaves the signal at null
        // either way.
        locator: {
          ...pagedLocate([]),
          locateAsync: async () => {
            await pending.promise;
            return null;
          },
        },
      });

      dispose();

      pending.resolve();
      await flushMicrotasks();

      expect(photo.position.value).toBe(null);
      expect(fake.adapter.read()).toBe('?photo=late');
    });
  });

  it('ignores a close when the parameter is not set', () => {
    const fake = createFakeAdapter('?a=1');
    const [photo] = attachController(fake);

    const goBack = vi.spyOn(fake.adapter, 'goBack');
    photo.set(null);

    expect(goBack).not.toHaveBeenCalled();
    expect(fake.adapter.read()).toBe('?a=1');
  });
});

describe('createUrlStateController with an object position', () => {
  // The same engine that drives a one-axis gallery drives a two-axis stories
  // player when the position is a { group, story } object. These assert the
  // shared history discipline still holds when Pos is not a number, so no
  // second implementation is needed downstream.
  type TwoAxis = { group: number; story: number };
  const _kStoriesPerGroup = [2, 3, 4];

  const build = (initial: string) => {
    const fake = createFakeUrlAdapter(initial);
    const codec: UrlCodec<TwoAxis> = {
      decode: (raw) => {
        const [group, story] = raw.split('.').map(Number);
        if (!Number.isInteger(group) || !Number.isInteger(story)) return null;
        return { group, story };
      },
      encode: ({ group, story }) => `${group}.${story}`,
    };
    const locator: UrlLocator<TwoAxis, TwoAxis> = {
      locate: ({ group, story }) =>
        group >= 0 &&
        group < _kStoriesPerGroup.length &&
        story >= 0 &&
        story < _kStoriesPerGroup[group]
          ? { group, story }
          : null,
      identify: (pos) => pos,
    };
    const ctrl = createUrlStateController<TwoAxis, TwoAxis>({
      param: 'story',
      adapter: fake.adapter,
      codec,
      locator,
    });
    return { fake, ctrl };
  };

  it('opens at a decoded object and writes objects back', () => {
    const { fake, ctrl } = build('?story=1.2');
    ctrl.attach();
    expect(ctrl.position.value).toEqual({ group: 1, story: 2 });

    ctrl.set({ group: 2, story: 0 });
    expect(fake.adapter.read()).toBe('?story=2.0');
  });

  it('runs the shared history discipline for an object: one entry, then replaces', () => {
    const { fake, ctrl } = build('');
    ctrl.attach();
    ctrl.set({ group: 1, story: 0 }); // open
    ctrl.set({ group: 1, story: 1 }); // inner nav
    ctrl.set({ group: 2, story: 0 }); // outer nav
    expect(fake.counts.push).toBe(1);
    expect(fake.counts.replace).toBe(2);
  });

  it('pops at most one entry on repeated close for an object', () => {
    const { fake, ctrl } = build('');
    ctrl.attach();
    ctrl.set({ group: 1, story: 0 });
    ctrl.set(null);
    ctrl.set(null);
    expect(fake.cursor).toBe(0);
    expect(fake.adapter.read()).toBe('');
  });

  it('claims a link-pushed object param so back closes', () => {
    const { fake, ctrl } = build('');
    ctrl.attach();
    fake.adapter.push('?story=1.0');
    fake.fireUrlChange();
    expect(ctrl.position.value).toEqual({ group: 1, story: 0 });
    // Appeared-claim re-stamps the entry in place — a replace, not a new push.
    expect(fake.counts.replace).toBe(1);
  });

  it('self-heals an out-of-range object', () => {
    const { fake, ctrl } = build('?story=9.9');
    ctrl.attach();
    expect(ctrl.position.value).toBeNull();
    expect(fake.adapter.read()).toBe('');
  });
});

import { describe, it, expect } from 'vitest';
import { createFakeUrlAdapter } from '../../testing';
import { createUrlStateController } from './urlState';
import type { UrlCodec, UrlLocator } from './urlState';
import {
  indexCodec,
  createIndexLocator,
  urlIndexKey,
  urlIndexTwoAxisKey,
  type TwoAxisPosition,
} from './urlIndexKey';
import { base64UrlCodec, urlStableIdTwoAxisKey } from './urlStableIdKey';

describe('indexCodec', () => {
  it('reads a bare non-negative integer index', () => {
    expect(indexCodec.decode('3')).toBe(3);
    expect(indexCodec.decode('0')).toBe(0);
    expect(indexCodec.encode(4)).toBe('4');
  });

  it('rejects blank, fractional, and negative wire values', () => {
    expect(indexCodec.decode('')).toBeNull();
    expect(indexCodec.decode('  ')).toBeNull();
    expect(indexCodec.decode('1.5')).toBeNull();
    expect(indexCodec.decode('-1')).toBeNull();
    expect(indexCodec.decode('bogus')).toBeNull();
  });
});

describe('createIndexLocator', () => {
  it('resolves an in-range index to itself', () => {
    const locator = createIndexLocator(() => 3);
    expect(locator.locate(0)).toBe(0);
    expect(locator.locate(2)).toBe(2);
    expect(locator.identify(1)).toBe(1);
  });

  it('rejects an out-of-range index to null rather than coercing it', () => {
    const locator = createIndexLocator(() => 3);
    // A clamp would land 99 on the last slide (2); the locator drops it so the
    // parameter self-heals instead of opening a slide the URL never named.
    expect(locator.locate(99)).toBeNull();
    expect(locator.locate(-1)).toBeNull();
    expect(locator.locate(1.5)).toBeNull();
  });

  it('reads the count at lookup time, so a grown collection widens the range', () => {
    let count = 1;
    const locator = createIndexLocator(() => count);
    expect(locator.locate(3)).toBeNull();
    count = 5;
    expect(locator.locate(3)).toBe(3);
  });
});

describe('urlIndexKey', () => {
  it('bundles indexCodec with a count-bound index locator', () => {
    const key = urlIndexKey(() => 3);
    expect(key.codec).toBe(indexCodec);
    expect(key.locator.locate(2)).toBe(2);
    expect(key.locator.locate(99)).toBeNull();
  });

  it('has no async pager unless one is passed', () => {
    expect(urlIndexKey(() => 3).locator.locateAsync).toBeUndefined();
  });

  it('windows a paged feed through locateAsync, re-bounding the result', async () => {
    // Only 3 slides loaded; the pager grows the feed on a miss.
    let loaded = 3;
    const key = urlIndexKey(
      () => loaded,
      async (index) => {
        loaded = index + 1; // page up to the wanted slide
        return index;
      },
    );

    expect(key.locator.locate(5)).toBeNull(); // past the loaded window
    await expect(key.locator.locateAsync!(5)).resolves.toBe(5); // paged in
  });

  it('drops an index the pager cannot resolve, even after paging', async () => {
    // Pager grows the feed but not far enough — the re-bound rejects it.
    let loaded = 3;
    const key = urlIndexKey(
      () => loaded,
      async () => {
        loaded = 4;
        return 99; // claims 99, but the feed only reached 4
      },
    );
    await expect(key.locator.locateAsync!(99)).resolves.toBeNull();
  });
});

// outer 0 → 2 inner, outer 1 → 3, outer 2 → 4.
const _kInnerCounts = [2, 3, 4];

const numericKey = () =>
  urlIndexTwoAxisKey({
    outerCount: () => _kInnerCounts.length,
    innerCounts: () => _kInnerCounts,
  });

describe('urlIndexTwoAxisKey codec', () => {
  it('always encodes a dotted wire, 3.0 included', () => {
    const { codec } = numericKey();
    expect(codec.encode({ outer: 2, inner: 3 })).toBe('2.3');
    // Strict wire: an inner of 0 is still spelled out, never a bare outer.
    expect(codec.encode({ outer: 3, inner: 0 })).toBe('3.0');
  });

  it('round-trips encode then decode as identity', () => {
    const { codec } = numericKey();
    for (const value of [
      { outer: 0, inner: 0 },
      { outer: 2, inner: 3 },
      { outer: 5, inner: 1 },
    ]) {
      expect(codec.decode(codec.encode(value))).toEqual(value);
    }
  });

  it.each([
    ['3', 'bare outer, no dot'],
    ['nope', 'no delimiter'],
    ['.3', 'missing outer'],
    ['2.', 'missing inner'],
    ['2.-1', 'negative inner'],
    ['2.1.', 'trailing dot'],
    ['2.1x', 'non-numeric inner'],
  ])('rejects a malformed wire value %j (%s)', (raw) => {
    expect(numericKey().codec.decode(raw)).toBeNull();
  });

  it('refuses to encode an inner id that carries the wire delimiter', () => {
    // A raw stable-id inner axis whose id contains a dot has no unambiguous
    // wire under the last-dot split — writing it would silently open the wrong
    // slot on the way back in, so encode throws where the misconfiguration is
    // obvious instead.
    const innerCodec: UrlCodec<string> = {
      decode: (raw) => (raw.length > 0 ? raw : null),
      encode: (id) => id,
    };
    const { codec } = urlIndexTwoAxisKey<number, string>({
      outerCount: () => 3,
      innerCounts: () => _kInnerCounts,
      innerCodec,
      innerLocate: () => 0,
      innerIdentify: () => 'photo.7',
    });
    expect(() => codec.encode({ outer: 1, inner: 'photo.7' })).toThrow(/"\."/);
  });

  it('encodes a dotted inner id safely once base64url hashing removes the dot', () => {
    // Same id, but base64url has no dot in its alphabet, so the wire stays
    // unambiguous and round-trips instead of throwing.
    const outer = { id: 'user_1' };
    const inner = { id: 'photo.7' };
    const { codec } = urlStableIdTwoAxisKey({
      hashCodec: base64UrlCodec,
      outerItems: () => [outer],
      innerItems: () => [inner],
    });
    const wire = codec.encode({ outer: 'user_1', inner: 'photo.7' });
    expect(wire.includes('.')).toBe(true); // the single outer/inner delimiter
    expect(wire.split('.')).toHaveLength(2);
    expect(codec.decode(wire)).toEqual({ outer: 'user_1', inner: 'photo.7' });
  });

  it('keeps dots inside a stable outer id, peeling only the trailing inner', () => {
    const outerCodec: UrlCodec<string> = {
      decode: (raw) => (raw.length > 0 ? raw : null),
      encode: (id) => id,
    };
    const outerLocator: UrlLocator<string, number> = {
      locate: () => 0,
      identify: () => 'a.b',
    };
    const { codec } = urlIndexTwoAxisKey<string>({
      outerCount: () => 1,
      innerCounts: () => _kInnerCounts,
      outerCodec,
      outerLocator,
    });
    expect(codec.decode('a.b.3')).toEqual({ outer: 'a.b', inner: 3 });
    expect(codec.encode({ outer: 'a.b', inner: 3 })).toBe('a.b.3');
  });
});

describe('urlIndexTwoAxisKey locator', () => {
  it('resolves an in-range identity to a position', () => {
    const { locator } = numericKey();
    expect(locator.locate({ outer: 1, inner: 2 })).toEqual({
      outer: 1,
      inner: 2,
    });
  });

  it('drops an outer out of range', () => {
    expect(numericKey().locator.locate({ outer: 9, inner: 0 })).toBeNull();
  });

  it('drops an inner past its outer end without clamping to a neighbor', () => {
    // outer 0 holds 2 inner; index 5 is past its end.
    expect(numericKey().locator.locate({ outer: 0, inner: 5 })).toBeNull();
  });

  it('maps a position back to its identity for writes', () => {
    expect(numericKey().locator.identify({ outer: 2, inner: 1 })).toEqual({
      outer: 2,
      inner: 1,
    });
  });

  describe('paged outer feed', () => {
    const build = () => {
      const loaded = [2, 3];
      const outerLocator: UrlLocator<number, number> = {
        locate: (index) => (index < loaded.length ? index : null),
        locateAsync: async (index) => {
          loaded.push(5, 4, 6); // outer 2..4 now loaded
          return index < loaded.length ? index : null;
        },
        identify: (index) => index,
      };
      return urlIndexTwoAxisKey<number>({
        outerCount: () => loaded.length,
        innerCounts: () => loaded,
        outerLocator,
      });
    };

    it('pages an unloaded outer and bounds its inner once loaded', async () => {
      const { locator } = build();
      expect(locator.locate({ outer: 4, inner: 1 })).toBeNull();
      await expect(
        locator.locateAsync!({ outer: 4, inner: 1 }),
      ).resolves.toEqual({ outer: 4, inner: 1 });
    });

    it('re-bounds the inner against the paged outer and drops out-of-range', async () => {
      const { locator } = build();
      // outer 4 loads with 6 inner; index 99 is still past its end.
      await expect(
        locator.locateAsync!({ outer: 4, inner: 99 }),
      ).resolves.toBeNull();
    });
  });
});

describe('urlIndexTwoAxisKey through the shared url-state controller', () => {
  const attach = (initial: string) => {
    const fake = createFakeUrlAdapter(initial);
    const ctrl = createUrlStateController<
      { outer: number; inner: number },
      TwoAxisPosition
    >({ param: 'p', adapter: fake.adapter, ...numericKey() });
    ctrl.attach();
    return { fake, ctrl };
  };

  it('opens at the decoded position in one atomic write', () => {
    const seen: (TwoAxisPosition | null)[] = [];
    const { ctrl } = (() => {
      const fake = createFakeUrlAdapter('?p=1.2');
      const c = createUrlStateController<
        { outer: number; inner: number },
        TwoAxisPosition
      >({ param: 'p', adapter: fake.adapter, ...numericKey() });
      c.position.observe(() => seen.push(c.position.value));
      c.attach();
      return { ctrl: c };
    })();

    expect(ctrl.position.value).toEqual({ outer: 1, inner: 2 });
    for (const value of seen) {
      if (value !== null) expect(value).toEqual({ outer: 1, inner: 2 });
    }
  });

  it('writes a position back into a strictly dotted ?p=o.i', () => {
    const { fake, ctrl } = attach('');
    ctrl.set({ outer: 2, inner: 0 });
    expect(fake.adapter.read()).toBe('?p=2.0');
  });

  it('self-heals a bare outer that is malformed in two-axis mode', () => {
    const { fake, ctrl } = attach('?p=2');
    expect(ctrl.position.value).toBeNull();
    expect(fake.adapter.read()).toBe('');
  });
});

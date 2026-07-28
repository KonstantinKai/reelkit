import { urlIndexTwoAxisKey } from './urlIndexKey';
import type { TwoAxisIdentity, TwoAxisPosition } from './urlIndexKey';
import type { UrlCodec, UrlLocator, UrlKey } from './urlState';

/**
 * Anything a stable-id key can address: it needs a stable `id` and nothing
 * else, so a gallery's own item type satisfies this as-is.
 */
export interface Identified {
  id: string;
}

/**
 * Restores base64url to canonical base64 — swaps the URL-safe alphabet back and
 * re-adds the padding that {@link encodeBase64Url} stripped, since `atob` rejects
 * an unpadded string in some engines.
 */
const toPaddedBase64 = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = base64.length % 4;
  return remainder === 0 ? base64 : base64 + '='.repeat(4 - remainder);
};

/**
 * Encodes a string as base64url — base64 with the URL-safe alphabet (`-`/`_`)
 * and no `=` padding, so it drops straight into a query parameter without being
 * percent-escaped. UTF-8 first, so a non-ASCII id survives the round trip.
 */
const encodeBase64Url = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Reverses {@link encodeBase64Url}, or returns `null` when the text is not valid
 * base64url — a hand-edited or truncated parameter reads back as no id, so it
 * self-heals out of the URL rather than throwing.
 */
const decodeBase64Url = (value: string): string | null => {
  try {
    const binary = atob(toPaddedBase64(value));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

/**
 * The ready-made hash mechanism for a stable-id key: reversible base64url
 * (`?photo=cG9zdF80Mg`) rather than a cryptographic hash — the controller
 * decodes it back to locate the item. URL-safe alphabet, no padding, UTF-8, so
 * a non-ASCII id survives the round trip and drops into the parameter without
 * being percent-escaped. Pass it as the `hashCodec` when you want the id
 * obscured; omit `hashCodec` to keep the id raw. Being a plain
 * {@link UrlCodec}, it is also the shape a consumer implements to substitute
 * their own encoding.
 */
export const base64UrlCodec: UrlCodec<string> = {
  decode: decodeBase64Url,
  encode: encodeBase64Url,
};

/**
 * The wire half of a stable-id key: the parameter's text is the item's `id`,
 * either verbatim (`?photo=post_42`) or run through `hashCodec`
 * (`?photo=cG9zdF80Mg` with {@link base64UrlCodec}). Blank text names nothing.
 * Exported alongside {@link createStableIdLocator} so you can pair a stable-id
 * wire with a locator of your own — the same way {@link indexCodec} pairs with
 * any locator — instead of taking the whole {@link urlStableIdKey}.
 *
 * @param hashCodec - Optional codec that transforms the id text on the wire.
 * Omit to write the id raw; pass {@link base64UrlCodec} for reversible base64url
 * obfuscation, or your own {@link UrlCodec} to plug in a different scheme. Its
 * `decode` returning `null` self-heals a malformed parameter.
 * @returns The `{ decode, encode }` codec for a stable-id parameter.
 */
export const createStableIdCodec = (
  hashCodec?: UrlCodec<string>,
): UrlCodec<string> => ({
  decode: (raw) => {
    if (raw === '') return null;
    return hashCodec ? hashCodec.decode(raw) : raw;
  },
  encode: (id) => (hashCodec ? hashCodec.encode(id) : id),
});

/**
 * The lookup half: find an id's current index by scanning `items` for a
 * matching `id`, and read an index back to its id for writes. A reordered or
 * shrunk list is handled for free — a bookmarked id that is gone scans to
 * `null` and self-heals, where an index bookmark would have opened whatever
 * slid into that slot.
 *
 * Pass `locateAsync` to window a paginated feed: `locate` scans only the loaded
 * items, and on a miss the controller falls to `locateAsync` — fetch until the
 * id is present, then return its index (or `null` when the feed has no such id).
 *
 * Exported alongside {@link createStableIdCodec} for the same reason
 * {@link createIndexLocator} is: build a stable-id key from the two halves by
 * hand when you need a wire or lookup {@link urlStableIdKey} does not cover.
 *
 * @typeParam T - The gallery's item type; needs only a stable `id`.
 * @param items - Reads the gallery's current items, scanned per lookup.
 * @param locateAsync - Optional pager for a windowed feed (see above).
 * @returns The `{ locate, identify, locateAsync? }` locator for a stable-id key.
 */
export const createStableIdLocator = <T extends Identified>(
  items: () => T[],
  locateAsync?: (id: string) => Promise<number | null>,
): UrlLocator<string, number> => ({
  locate: (id) => {
    const index = items().findIndex((item) => item.id === id);
    return index === -1 ? null : index;
  },
  // Only ever called for a slide already on screen, so the item is present.
  identify: (index) => items()[index].id,
  ...(locateAsync && { locateAsync }),
});

/**
 * Configuration for {@link urlStableIdKey}.
 *
 * @typeParam T - The gallery's item type; needs only a stable `id`.
 */
export interface UrlStableIdKeyOptions<T extends Identified> {
  /**
   * Transforms the id text on the wire. Omit to write the id raw
   * (`?photo=photo_7`); pass {@link base64UrlCodec} to base64url-obscure it
   * (`?photo=cGhvdG9fNw`), so the value is not human-readable at a glance. That
   * is reversible obfuscation — the controller decodes it back to locate the
   * item — NOT a cryptographic hash; do not rely on it to hide anything
   * sensitive. Supply your own {@link UrlCodec} to plug in a different scheme.
   *
   * @default undefined (id written raw)
   */
  hashCodec?: UrlCodec<string>;

  /**
   * Reads the gallery's current items. A getter, not a snapshot, so a list that
   * reorders or pages in after setup is scanned at lookup time — a framework
   * whose setup runs once (Vue) would otherwise capture a stale array.
   */
  items: () => T[];

  /**
   * Optional pager for a windowed feed, called only when the synchronous scan
   * of `items()` misses: fetch until the id is present, then return its index
   * (or `null` when the feed has no such id). Lets a paginated gallery keep the
   * stable-id key instead of hand-rolling a codec and locator.
   */
  locateAsync?: (id: string) => Promise<number | null>;
}

/**
 * A key that addresses a gallery by each item's stable `id` instead of its
 * position: `?photo=<id>`. Spread it into `useOverlayUrlState` exactly like
 * {@link urlIndexKey} — `useOverlayUrlState({ param, ...urlStableIdKey({ items }) })`.
 *
 * Prefer this over an index key whenever the list can change under a shared
 * link. A bookmarked `?photo=3` names a different slide the moment an item is
 * inserted; a bookmarked `?photo=post_42` still names post 42, or drops cleanly
 * when it is gone. The cost is a scan of the live list per lookup, which a
 * position key avoids — fine for a gallery, reconsider for tens of thousands of
 * items.
 *
 * Window a paginated gallery by passing `locateAsync`: the sync scan answers for
 * loaded items, and a miss pages the rest in — so the stable-id key survives an
 * infinite feed without hand-rolling a codec and locator.
 *
 * @typeParam T - The gallery's item type; needs only a stable `id`.
 * @param options - The live items getter, plus the optional `hashCodec` wire
 * transform and `locateAsync` pager.
 * @returns The `{ codec, locator }` pair for an id-addressed gallery.
 */
export const urlStableIdKey = <T extends Identified>(
  options: UrlStableIdKeyOptions<T>,
): UrlKey<string, number> => ({
  codec: createStableIdCodec(options.hashCodec),
  locator: createStableIdLocator(options.items, options.locateAsync),
});

/**
 * Configuration for {@link urlStableIdTwoAxisKey} with the default index inner
 * axis — the outer is addressed by id, the inner by a plain local index
 * (`?story=user_42.3`).
 *
 * @typeParam Outer - The outer item type; needs only a stable `id`.
 */
export interface UrlStableIdTwoAxisKeyOptions<Outer extends Identified> {
  /**
   * Transforms the OUTER id text on the wire — the inner half is a plain index
   * and stays raw. Omit to write the outer id raw; pass {@link base64UrlCodec}
   * or your own codec. See {@link UrlStableIdKeyOptions.hashCodec}: reversible
   * obfuscation, not a hash.
   *
   * @default undefined (outer id written raw)
   */
  hashCodec?: UrlCodec<string>;

  /**
   * Reads the current outer items. A getter, for the same reason as
   * {@link UrlStableIdKeyOptions.items} — measured at lookup time.
   */
  outerItems: () => Outer[];

  /**
   * Reads the live per-outer inner counts, for bounding a decoded inner index
   * against the outer slot it names.
   */
  innerCounts: () => number[];
}

/**
 * Configuration for {@link urlStableIdTwoAxisKey} with an id-addressed inner
 * axis — BOTH halves are stable ids (`?story=user_42.photo_7`). Supply
 * `innerItems` instead of `innerCounts` to opt in.
 *
 * @typeParam Outer - The outer item type; needs only a stable `id`.
 * @typeParam Inner - The inner item type; needs only a stable `id`.
 */
export interface UrlStableIdTwoAxisIdInnerOptions<
  Outer extends Identified,
  Inner extends Identified,
> {
  /**
   * Transforms BOTH id halves on the wire. With ids on the inner axis, pass
   * {@link base64UrlCodec} when an inner id might contain a `.`: base64url has
   * no dots, so the wire's last-dot split stays unambiguous. A custom codec
   * must likewise keep the inner wire dot-free. Omit to write both ids raw. See
   * {@link UrlStableIdKeyOptions.hashCodec}: reversible obfuscation, not a hash.
   *
   * @default undefined (both ids written raw)
   */
  hashCodec?: UrlCodec<string>;

  /**
   * Reads the current outer items. A getter — measured at lookup time.
   */
  outerItems: () => Outer[];

  /**
   * Reads a given outer item's current inner items. Scanned for a matching `id`
   * to resolve the inner half, so the inner axis survives a reorder within its
   * slot exactly as the outer does.
   */
  innerItems: (outer: Outer) => Inner[];
}

/**
 * The two-axis analog of {@link urlStableIdKey}. By default the outer axis is
 * addressed by each outer item's stable `id` and the inner by a plain local
 * index — `?story=user_42.3` — a thin composition over {@link urlIndexTwoAxisKey}.
 *
 * Opt the inner axis into ids too by supplying `innerItems` instead of
 * `innerCounts`: both halves then carry stable ids — `?story=user_42.photo_7` —
 * and each survives a reorder within its slot. The inner id must not contain the
 * `.` delimiter (the wire splits on the last dot); pass {@link base64UrlCodec}
 * as `hashCodec` to base64url-encode both halves when an id might.
 *
 * @typeParam Outer - The outer item type; needs only a stable `id`.
 * @typeParam Inner - The inner item type; needs only a stable `id`.
 * @param options - Outer items plus either `innerCounts` (index inner) or
 * `innerItems` (id inner), and optional `hashCodec`.
 * @returns The `{ codec, locator }` pair for an id-addressed two-axis parameter.
 */
export function urlStableIdTwoAxisKey<Outer extends Identified>(
  options: UrlStableIdTwoAxisKeyOptions<Outer>,
): UrlKey<TwoAxisIdentity<string, number>, TwoAxisPosition>;
export function urlStableIdTwoAxisKey<
  Outer extends Identified,
  Inner extends Identified,
>(
  options: UrlStableIdTwoAxisIdInnerOptions<Outer, Inner>,
): UrlKey<TwoAxisIdentity<string, string>, TwoAxisPosition>;
export function urlStableIdTwoAxisKey<
  Outer extends Identified,
  Inner extends Identified,
>(
  options:
    | UrlStableIdTwoAxisKeyOptions<Outer>
    | UrlStableIdTwoAxisIdInnerOptions<Outer, Inner>,
):
  | UrlKey<TwoAxisIdentity<string, number>, TwoAxisPosition>
  | UrlKey<TwoAxisIdentity<string, string>, TwoAxisPosition> {
  const hashCodec = options.hashCodec;
  const outerItems = options.outerItems;

  if ('innerItems' in options) {
    const innerItems = options.innerItems;
    return urlIndexTwoAxisKey<string, string>({
      outerCount: () => outerItems().length,
      innerCounts: () => outerItems().map((outer) => innerItems(outer).length),
      outerCodec: createStableIdCodec(hashCodec),
      outerLocator: createStableIdLocator(outerItems),
      innerCodec: createStableIdCodec(hashCodec),
      innerLocate: (outerIndex, id) => {
        const outer = outerItems()[outerIndex];
        if (!outer) return null;
        const index = innerItems(outer).findIndex((item) => item.id === id);
        return index === -1 ? null : index;
      },
      innerIdentify: (outerIndex, index) =>
        innerItems(outerItems()[outerIndex])[index].id,
    });
  }

  const innerCounts = options.innerCounts;
  return urlIndexTwoAxisKey<string>({
    outerCount: () => outerItems().length,
    innerCounts,
    outerCodec: createStableIdCodec(hashCodec),
    outerLocator: createStableIdLocator(outerItems),
  });
}

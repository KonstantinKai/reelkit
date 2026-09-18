import type { UrlCodec, UrlLocator, UrlKey } from './urlState';

/**
 * Reads a bare integer index, the shape `?photo=3` implies.
 *
 * Fractions and negatives decode to `null` rather than being rounded or
 * clamped: they are as much a broken link as `?photo=bogus`, and silently
 * repairing them would open a slide the URL never named.
 *
 * Pass it explicitly to opt a controller into index derivation without writing
 * a codec of your own. Prefer a codec over a stable identity whenever the list
 * can change — a bookmarked `?photo=3` names a different slide the moment an
 * item is inserted.
 */
export const indexCodec: UrlCodec<number> = {
  decode: (raw) => {
    // Reject blank input before parsing: `Number('')` and `Number(' ')` are
    // both `0`, so a bare or whitespace-only `?photo=` would otherwise open
    // slide 0 instead of naming no slide.
    if (raw.trim() === '') return null;

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  },
  encode: String,
};

/**
 * Narrows a parsed index to a slide the gallery can actually show, or `null`
 * when it cannot. A fraction, a negative, or a stale index past the end reads
 * back the same as no slide, so a dead bookmark self-heals out of the URL
 * instead of asserting a slide that cannot open.
 *
 * It rejects to `null` rather than repairing to the nearest valid slide: a
 * shared link naming a gone slide must drop, not silently land on a neighbour.
 */
const toSlideIndex = (value: number | null, count: number): number | null =>
  value !== null && Number.isInteger(value) && value >= 0 && value < count
    ? value
    : null;

/**
 * The default locator for a plain index gallery, paired with {@link indexCodec}:
 * the parameter is a slide position, so `locate` and `identify` are the identity
 * — bounded by the gallery's live size.
 *
 * Pass `countGetter` as a getter, not a number, so the bound reads the current
 * size at lookup time: a paginated gallery grows, and a framework whose setup
 * runs once (Vue) would otherwise capture a stale length. Hand the result to
 * `useOverlayUrlState` as its `locator`.
 *
 * A gallery keyed by a stable id instead of position wants its own locator, not
 * this one — this maps a position to itself and only bounds the range.
 *
 * Pass `locateAsync` to window a paginated feed without hand-rolling a locator:
 * `locate` answers synchronously for the slides already loaded, and on a miss
 * the controller falls to `locateAsync` — page up to the wanted index there,
 * then return it (or `null` when the feed has no such slide). The result is
 * re-bounded against the now-current count, so a link past the window opens once
 * its page arrives.
 *
 * @param countGetter - Reads the gallery's current item count.
 * @param locateAsync - Optional pager for a windowed feed: fetch up to `index`,
 * then return it (or `null` if the feed has no such slide).
 * @returns A locator that resolves an in-range index and drops the rest.
 */
export const createIndexLocator = (
  countGetter: () => number,
  locateAsync?: (index: number) => Promise<number | null>,
): UrlLocator<number, number> => ({
  locate: (id) => toSlideIndex(id, countGetter()),
  identify: (index) => index,
  ...(locateAsync && {
    locateAsync: async (id) =>
      toSlideIndex(await locateAsync(id), countGetter()),
  }),
});

/**
 * The default key for a plain index gallery: {@link indexCodec} paired with a
 * {@link createIndexLocator} bound to the gallery's live size. Spread it into
 * `useOverlayUrlState` — `useOverlayUrlState({ param, ...urlIndexKey(() => count) })`
 * — so the common case is one call and the codec cannot drift from the locator.
 *
 * Window a paginated feed by passing a second argument: a `locateAsync` pager,
 * called only when the synchronous `locate` misses. Page up to the wanted index
 * there and return it, so a shared link past the loaded window still opens —
 * without rebuilding the codec and locator by hand.
 *
 * @param countGetter - Reads the gallery's current item count.
 * @param locateAsync - Optional pager for a windowed feed: fetch up to `index`,
 * then return it (or `null` if the feed has no such slide).
 * @returns The `{ codec, locator }` pair for an index-addressed gallery.
 */
export const urlIndexKey = (
  countGetter: () => number,
  locateAsync?: (index: number) => Promise<number | null>,
): UrlKey<number, number> => ({
  codec: indexCodec,
  locator: createIndexLocator(countGetter, locateAsync),
});

/**
 * A position on two axes: an `outer` slot and an `inner` slot within it. The
 * object a {@link urlIndexTwoAxisKey} locator resolves to, and the value the shared
 * URL-state controller holds in one atomic signal — so a subscriber never sees
 * an outer index paired with a stale inner index.
 */
export interface TwoAxisPosition {
  outer: number;
  inner: number;
}

/**
 * The decoded identity a two-axis parameter carries: an outer identity plus an
 * inner one local to it. Each half's identity defaults to its index but can be a
 * stable id — supply an `innerCodec`/`innerLocate`/`innerIdentify` trio to
 * address the inner axis by id as well, otherwise it stays a plain local index.
 *
 * @typeParam OuterId - The outer half's identity. Defaults to the outer index.
 * @typeParam InnerId - The inner half's identity. Defaults to the inner index.
 */
export interface TwoAxisIdentity<OuterId = number, InnerId = number> {
  outer: OuterId;
  inner: InnerId;
}

/**
 * The default inner codec: a bare local index, same shape as {@link indexCodec}.
 * Rejects blanks, fractions, and negatives so a broken inner half self-heals
 * rather than opening slot 0.
 */
const numericInnerCodec: UrlCodec<number> = {
  decode: (raw) => {
    if (raw.trim() === '') return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  },
  encode: String,
};

/**
 * Configuration for {@link urlIndexTwoAxisKey}.
 *
 * @typeParam OuterId - The outer half's identity. Defaults to the outer index,
 * so a plain `?p=2.3` player needs neither `outerCodec` nor `outerLocator`.
 * @typeParam InnerId - The inner half's identity. Defaults to the inner index.
 */
export interface UrlIndexTwoAxisKeyOptions<OuterId = number, InnerId = number> {
  /**
   * Wire format for the outer half of the parameter. Supply one to address the
   * outer axis by a stable id (`?p=user_42.3`) so a bookmark survives the feed
   * being reordered; the inner half is its own concern (see `innerCodec`).
   *
   * @default indexCodec — the outer index, `?p=2.3`
   */
  outerCodec?: UrlCodec<OuterId>;

  /**
   * Where an outer identity sits in the live feed: `locate` (sync),
   * `locateAsync` (fetch a slot not loaded yet), `identify` (writes). Supply one
   * to window a paginated feed — `locate` answers only for loaded slots,
   * `locateAsync` pages the rest — independent of the codec.
   *
   * @default createIndexLocator(outerCount) — an eager, index-bounded feed
   */
  outerLocator?: UrlLocator<OuterId, number>;

  /**
   * Wire format for the inner half. Supply one — together with `innerLocate` and
   * `innerIdentify` — to address the inner axis by a stable id too
   * (`?p=user_42.photo_7`). The inner id must not contain the `.` delimiter (the
   * wire splits on the last dot); base64url-encode it if it might.
   *
   * @default a bare local index, `?p=2.3`
   */
  innerCodec?: UrlCodec<InnerId>;

  /** Reads the live outer count, for bounding a decoded outer index. */
  outerCount: () => number;

  /**
   * Reads the live per-outer inner counts, for bounding a decoded inner index
   * against the outer slot it names. A getter, so a paginated feed that grows
   * after a slot loads is measured at lookup time, not captured once. Consulted
   * only by the default (index) inner axis; a custom `innerLocate` owns its own
   * bound.
   */
  innerCounts: () => number[];

  /**
   * Resolves a decoded inner identity to its index within an already-resolved
   * outer slot, or `null` when it is absent. Pairs with `innerCodec` to address
   * the inner axis by id.
   *
   * @default an index bound — the id IS the index, kept when in range for the slot
   */
  innerLocate?: (outerIndex: number, id: InnerId) => number | null;

  /**
   * Reads an inner index back to its identity, for writes. Pairs with
   * `innerCodec`.
   *
   * @default the identity — the index is the id
   */
  innerIdentify?: (outerIndex: number, index: number) => InnerId;
}

/**
 * Builds the `{ codec, locator }` pair that teaches the shared URL-state
 * controller to drive a two-axis player through one query parameter. Spread it
 * into `useOverlayUrlState` (or the framework equivalent) exactly like
 * `urlIndexKey` for a one-axis gallery:
 * `useOverlayUrlState({ param: 'p', ...urlIndexTwoAxisKey({ outerCount, innerCounts }) })`.
 *
 * The wire format is strictly dotted — `<outer>.<inner>`, always, `3.0`
 * included. A bare `?p=3` decodes to nothing and self-heals out of the URL, so
 * a one-axis link and a two-axis link are deliberately distinct: pick one shape
 * per application, they do not cross-decode.
 *
 * It carries no history logic. Opening, closing, the back button, and stale-
 * async handling all stay in the one controller shared with every other overlay;
 * this only spells the `{ outer, inner }` object into `?p=<outer>.<inner>` and
 * finds where a decoded identity currently sits.
 *
 * The outer axis is addressable by index or a stable id; the inner defaults to a
 * dependent index, bounded against whichever outer slot it lands in and
 * re-bounded if a paged slot resolves later, and can be opted into ids too.
 *
 * @typeParam OuterId - The outer half's identity. Defaults to the outer index.
 * @typeParam InnerId - The inner half's identity. Defaults to the inner index.
 * @param options - Live counts, plus optional per-axis codec and lookup pieces.
 * @returns The matched `{ codec, locator }` pair for a two-axis parameter.
 */
export const urlIndexTwoAxisKey = <OuterId = number, InnerId = number>(
  options: UrlIndexTwoAxisKeyOptions<OuterId, InnerId> &
    (OuterId extends number
      ? object
      : {
          outerCodec: UrlCodec<OuterId>;
          outerLocator: UrlLocator<OuterId, number>;
        }) &
    (InnerId extends number
      ? object
      : {
          innerCodec: UrlCodec<InnerId>;
          innerLocate: (outerIndex: number, id: InnerId) => number | null;
          innerIdentify: (outerIndex: number, index: number) => InnerId;
        }),
): UrlKey<TwoAxisIdentity<OuterId, InnerId>, TwoAxisPosition> => {
  const { outerCount, innerCounts } = options;
  const outerCodec = (options.outerCodec ?? indexCodec) as UrlCodec<OuterId>;
  const outerLocator =
    options.outerLocator ??
    (createIndexLocator(outerCount) as unknown as UrlLocator<OuterId, number>);
  const innerCodec = (options.innerCodec ??
    numericInnerCodec) as UrlCodec<InnerId>;

  // Default inner axis: the id IS the index, kept only when it falls inside the
  // resolved slot's live count — a fraction, a negative, or an index past the
  // end reads back the same as no inner, so a dead bookmark self-heals. Reached
  // only when `InnerId` is left as `number`, so the cast is sound.
  const innerLocate =
    options.innerLocate ??
    ((outerIndex, id) => {
      const inner = id as unknown as number;
      return Number.isInteger(inner) &&
        inner >= 0 &&
        inner < (innerCounts()[outerIndex] ?? 0)
        ? inner
        : null;
    });
  const innerIdentify =
    options.innerIdentify ?? ((_, index) => index as unknown as InnerId);

  const codec: UrlCodec<TwoAxisIdentity<OuterId, InnerId>> = {
    // Split on the LAST dot: an inner id never contains one (a numeric index
    // cannot, and a stable inner id is required not to), so an outer id that
    // happens to — a slug, a path — keeps its dots and only the trailing inner
    // half is peeled off.
    decode: (raw) => {
      const dot = raw.lastIndexOf('.');
      // Reject a missing outer (`.3`), a missing inner (`2.`), and no delimiter
      // — a bare `3` is malformed here, keeping two-axis links distinct.
      if (dot <= 0 || dot === raw.length - 1) return null;

      const inner = innerCodec.decode(raw.slice(dot + 1));
      if (inner === null) return null;

      const outer = outerCodec.decode(raw.slice(0, dot));
      if (outer === null) return null;

      return { outer, inner };
    },
    encode: ({ outer, inner }) => {
      const innerWire = innerCodec.encode(inner);
      // The decode above splits on the last dot, so an inner half that itself
      // contains one has no unambiguous wire — it would read back as a
      // different inner (and a different outer) and silently open the wrong
      // slot. A numeric inner and a base64url one never contain a dot; only a
      // raw stable id can. Refuse to write the ambiguous parameter here, where
      // the misconfiguration surfaces at once, rather than mis-splitting it on
      // the way back in. Base64url-encode the inner id (pass base64UrlCodec as
      // hashCodec) or use an inner codec that escapes the delimiter.
      if (innerWire.includes('.')) {
        throw new Error(
          `reelkit: a two-axis inner id encoded to "${innerWire}", which contains the "." wire delimiter and cannot round-trip. Base64url-encode the inner id (for example, hashCodec: base64UrlCodec) or use an inner codec that escapes ".".`,
        );
      }
      return `${outerCodec.encode(outer)}.${innerWire}`;
    },
  };

  const resolve = (
    outerIndex: number | null,
    inner: InnerId,
  ): TwoAxisPosition | null => {
    if (outerIndex === null) return null;
    const innerIndex = innerLocate(outerIndex, inner);
    return innerIndex === null
      ? null
      : { outer: outerIndex, inner: innerIndex };
  };

  const locator: UrlLocator<
    TwoAxisIdentity<OuterId, InnerId>,
    TwoAxisPosition
  > = {
    locate: ({ outer, inner }) => resolve(outerLocator.locate(outer), inner),

    // Reached on any sync miss. Two cases collapse to one path: an outer slot
    // that is not loaded yet (page it in), and a loaded slot whose inner is
    // out of range (the outer re-locates sync-cheap, the inner re-bounds to
    // null and the parameter self-heals). The second spends one wasted
    // microtask to keep both bound checks in a single place; the controller's
    // generation guard discards an answer that arrives after the URL has moved
    // on.
    locateAsync: async ({ outer, inner }) =>
      resolve(
        outerLocator.locateAsync
          ? await outerLocator.locateAsync(outer)
          : outerLocator.locate(outer),
        inner,
      ),

    identify: ({ outer, inner }) => ({
      outer: outerLocator.identify(outer),
      inner: innerIdentify(outer, inner),
    }),
  };

  return { codec, locator };
};

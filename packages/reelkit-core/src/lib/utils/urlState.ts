import { createSignal, type Signal, type Dispose } from './signal';

/**
 * Key stamped into a history entry's state to mark the entry as one this
 * controller pushed. Read back on close to decide whether going back would
 * land on our own entry — instance memory cannot answer that after a remount.
 */
const _kOwnerKey = '__rk_url_owner';

/**
 * Everything the controller needs from the surrounding navigation system.
 *
 * Injected rather than assumed so a router-driven application keeps a single
 * source of navigation truth. Writing `history.pushState` behind a router's
 * back leaves its internal location stale, and its next navigation silently
 * drops whatever was written.
 */
export interface UrlAdapter {
  /** Current query string, including the leading `?` when non-empty. */
  read: () => string;

  /**
   * Registers a listener for any URL change, whichever side caused it.
   *
   * Listening to `popstate` alone is not enough under a router: a programmatic
   * navigation pushes a new entry without emitting `popstate`.
   *
   * @returns A dispose function that removes the listener.
   */
  subscribe: (listener: () => void) => Dispose;

  /**
   * Navigates to `to`, adding a history entry that starts from `state`.
   *
   * The entry is new, so `state` replaces rather than merges — there is
   * nothing on it yet to preserve.
   */
  push: (to: string, state?: unknown) => void;

  /**
   * Navigates to `to`, replacing the current history entry.
   *
   * Merge `state` into whatever the entry already holds, do not overwrite it.
   * The entry may belong to a router that keeps its own keys there, and
   * dropping them strands the router on its next navigation.
   */
  replace: (to: string, state?: unknown) => void;

  /**
   * Reads the state attached to the current history entry.
   *
   * Must return what `push` and `replace` were given: the controller stamps an
   * ownership key into that state and reads it back here to decide whether
   * closing should step back or clear the parameter in place.
   */
  getState: () => unknown;

  /**
   * Steps back one history entry.
   *
   * The step lands asynchronously. Nothing has changed by the time this
   * returns — the new URL arrives through `subscribe`.
   */
  goBack: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const merge = (prev: unknown, next: unknown): unknown =>
  isRecord(prev) || isRecord(next)
    ? {
        ...(isRecord(prev) ? prev : {}),
        ...(isRecord(next) ? next : {}),
      }
    : (next ?? prev ?? null);

/**
 * Creates the default {@link UrlAdapter}, backed by the History API.
 *
 * Suitable for applications without a router. A routed application should
 * inject an adapter built on its router instead.
 *
 * Globals are touched lazily inside each method, never at module scope, so
 * importing this module stays safe during server rendering and prerendering.
 *
 * @returns An adapter driving `window.history`.
 */
export const createHistoryAdapter = (): UrlAdapter => ({
  read: () => window.location.search,

  subscribe: (listener) => {
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  },

  // A pushed entry is new, so it starts from the given state.
  push: (to, state) => window.history.pushState(state ?? null, '', to),

  // A replaced entry is the current one: merge so a router's own keys survive.
  replace: (to, state) =>
    window.history.replaceState(merge(window.history.state, state), '', to),

  getState: () => window.history.state,

  goBack: () => window.history.back(),
});

/**
 * The wire format of a URL parameter: its text and a stable identity, nothing
 * more. It knows how to spell an identity into the address bar and read it
 * back; it knows nothing about any collection or where an identity sits in one.
 * That separation is the point — a base64 or slug codec is a standalone,
 * reusable value, testable without a list in sight.
 *
 * Where the identity actually lives is the {@link UrlLocator}'s job.
 *
 * @typeParam Id - The stable identity a value carries. Defaults to a slide
 * index, the shape `?photo=3` implies, so the common case needs no locator.
 */
export interface UrlCodec<Id = number> {
  /**
   * Reads the parameter's text into an identity. Return `null` when the text
   * is malformed — the controller then clears the parameter rather than
   * leaving the address bar asserting something nothing can read. A `null`
   * here is a *wire* verdict, distinct from an identity that simply is not
   * loaded yet.
   *
   * Runs synchronously on every URL change, back-button steps included, so it
   * must answer without awaiting; fetching belongs in
   * {@link UrlLocator.locateAsync}.
   */
  decode: (raw: string) => Id | null;

  /** Writes an identity back into the parameter's text. */
  encode: (id: Id) => string;
}

/**
 * Where an identity sits in the current collection — the half of URL state
 * that a codec deliberately leaves out. One responsibility, "find this
 * identity's index," offered at two speeds: {@link locate} synchronously, and
 * {@link locateAsync} as its fallback when the item is not loaded yet.
 *
 * Supplied to the controller as plain closures, so the core never sees the
 * collection's type and stays overlay-agnostic.
 *
 * @typeParam Id - The identity a {@link UrlCodec} produces.
 */
export interface UrlLocator<Id> {
  /**
   * The identity's index in the currently-loaded collection, or `null` when it
   * is absent or not yet loaded. Synchronous.
   */
  locate: (id: Id) => number | null;

  /**
   * Asynchronous fallback, called only when {@link locate} returns `null` — a
   * loaded identity never pays for a fetch. Load the pages you need, then
   * return the index the identity turned out to have.
   *
   * Whatever this returns is the answer; nothing re-runs `locate` or `decode`
   * afterwards, so an index computed from data this just fetched is race-free
   * against a collection that has not re-rendered. While it is in flight the
   * parameter survives untouched and the overlay stays closed; a `null` or a
   * rejection clears the parameter. Work that finishes after the URL has moved
   * on is discarded.
   */
  locateAsync?: (id: Id) => Promise<number | null>;

  /**
   * An index back into its identity, for writes. Synchronous — a write only
   * ever encodes a slide already on screen, so its identity is always loaded.
   */
  identify: (index: number) => Id;
}

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
 * A single query parameter, mirrored into a reactive signal and back into the
 * URL. The URL is the source of truth: `value` always reflects what the
 * address bar says.
 */
export interface UrlStateController {
  /** The parameter's current raw value, or `null` when it is absent. */
  value: Signal<string | null>;

  /**
   * The slide the parameter currently names, or `null` when nothing is open.
   *
   * Derived by the controller, so a binding subscribes rather than re-deriving:
   * the decode-then-locate dispatch, the open/close latch, self-healing of a
   * parameter that names no slide, and discarding a stale asynchronous answer
   * all happen here, once, for every framework binding.
   *
   * Stays `null` unless a `codec` or `locator` was supplied — without one the
   * controller has no basis for turning text into a slide, so it reports the
   * raw `value` only.
   *
   * While something is open this holds the index it opened at and stops
   * following the URL. The slider owns the index from that point and the URL
   * trails it; re-deriving would fight the user's swipe.
   */
  index: Signal<number | null>;

  /**
   * Writes the parameter. Passing `null` removes it.
   *
   * Whether the write adds a history entry is derived, not chosen: the first
   * write of an absent parameter pushes one entry, and every write after that
   * replaces it. So opening costs one entry and paging through a hundred
   * slides costs none — a single back step always leaves.
   */
  set: (next: string | number | null) => void;

  /**
   * Seeds `value` from the current URL and starts following changes.
   *
   * @returns A dispose function that stops following.
   */
  attach: () => Dispose;
}

/**
 * Configuration for {@link createUrlStateController}.
 *
 * Supplying a `codec` or a `locator` is what makes the controller derive
 * `index` at all; with neither it reports the raw `value` only. When the
 * codec's identity is not itself a slide index — a string id, a slug — a
 * `locator` is required to turn that identity into a position, and the type
 * of {@link createUrlStateController} enforces it.
 *
 * @typeParam Id - The identity the codec produces. Defaults to a slide index.
 */
export interface UrlStateOptions<Id = number> {
  /** Name of the query parameter to mirror. */
  param: string;

  /**
   * Navigation system to read and write through.
   *
   * @default createHistoryAdapter()
   */
  adapter?: UrlAdapter;

  /**
   * Wire format for the parameter — its text ↔ a stable identity. Knows
   * nothing about any collection.
   *
   * @default indexCodec
   */
  codec?: UrlCodec<Id>;

  /**
   * Where the codec's identity sits in the collection: `locate` (sync),
   * `locateAsync` (async fallback), and `identify` for writes. Omit it only
   * when the identity is already a slide index (the default `Id = number`).
   */
  locator?: UrlLocator<Id>;
}

/**
 * Mirrors one query parameter into a signal, and writes changes back to the
 * URL through the adapter.
 *
 * @param options - Parameter name and the adapter to drive.
 * @returns A new {@link UrlStateController}.
 *
 * @example
 * ```ts
 * const photo = createUrlStateController({ param: 'photo' });
 * const dispose = photo.attach();
 *
 * photo.set(3); // → ?photo=3, one history entry
 * photo.set(4); // → ?photo=4, same entry
 * photo.set(null); // → steps back, removing the entry it pushed
 * ```
 *
 * A parameter that arrived with the page — a shared link — was pushed by
 * nobody, so `set(null)` clears it in place instead of stepping back off the
 * site.
 */
export const createUrlStateController = <Id = number>(
  // A non-`number` identity cannot stand in for an index, so a codec that
  // produces one demands a `locator` — the intersection makes it a type error
  // to omit. The default `Id = number` leaves the integer case unconstrained.
  options: UrlStateOptions<Id> &
    (Id extends number ? object : { locator: UrlLocator<Id> }),
): UrlStateController => {
  const { param, locator } = options;
  const adapter = options.adapter ?? createHistoryAdapter();
  // With neither, the controller has no basis for turning text into a slide,
  // so it leaves `index` alone and reports the raw `value` only.
  const derives = options.codec !== undefined || locator !== undefined;
  const codec = (options.codec ?? indexCodec) as UrlCodec<Id>;

  const value = createSignal<string | null>(null);
  const index = createSignal<number | null>(null);

  // Guards against a second close while the first is still awaiting its
  // history step, which would pop an extra entry and leave the site.
  let closing = false;

  // Bumped on every derivation. An asynchronous lookup captures the value
  // current when it started and compares on settle, so a slow answer for a
  // parameter the user has already navigated away from is dropped instead of
  // opening a slide nobody asked for.
  let generation = 0;
  let disposed = false;

  // The value the current derivation is for. A URL change that leaves the
  // parameter untouched — a router re-emitting on its own key, the ownership
  // claim's own `replace` — must not restart the work: `locateAsync` is a
  // fetch, and re-running it would discard the one in flight and start another
  // for an answer that has not changed.
  let deriving: string | null = null;

  const readParam = (): string | null =>
    new URLSearchParams(adapter.read()).get(param);

  // Rebuilds the query string around the new value, leaving every other
  // parameter — and the path — exactly as it was.
  const buildSearch = (next: string | null): string => {
    const search = new URLSearchParams(adapter.read());

    if (next === null) search.delete(param);
    else search.set(param, next);

    const query = search.toString();
    return query === '' ? '' : `?${query}`;
  };

  const ownsCurrentEntry = (): boolean => {
    const state = adapter.getState();
    return isRecord(state) && state[_kOwnerKey] === param;
  };

  const remove = (): void => {
    if (closing || readParam() === null) return;
    closing = true;

    if (ownsCurrentEntry()) {
      // Our own entry is on top: stepping back removes it and leaves no
      // stranded forward entry. The parameter clears when the step lands.
      adapter.goBack();
      return;
    }

    // Nobody pushed this parameter — it arrived with the page, as a shared
    // link would. There is nothing of ours behind us, so going back would
    // leave the site entirely. Drop the parameter where it stands.
    adapter.replace(buildSearch(null));
    value.value = null;
    index.value = null;
    closing = false;
  };

  // Commits a derived slide, but only if the world still matches the one the
  // derivation started in.
  const settle = (next: number | null, token: number): void => {
    if (disposed || token !== generation) return;

    if (next === null) {
      // The parameter names no slide — a stale bookmark, or a hand-edited
      // value. Clear it rather than leaving the address bar asserting a state
      // nothing can hold.
      remove();
      return;
    }

    index.value = next;
  };

  const derive = (): void => {
    if (!derives) return;

    const raw = value.value;

    if (raw === null) {
      generation += 1;
      deriving = null;
      index.value = null;
      return;
    }

    // Already open. From here the slider owns the index and the URL only
    // trails it — reading the index back in would fight the user's swipe.
    if (index.value !== null) return;

    // Same value, already being worked on.
    if (raw === deriving) return;

    deriving = raw;
    const token = ++generation;

    const id = codec.decode(raw);

    // A malformed wire value names nothing readable — clear it now, and never
    // reach for a locator: there is no identity to look up.
    if (id === null) {
      settle(null, token);
      return;
    }

    // No locator means the identity is already the index (its type is pinned
    // to `number`). With one, ask it where the identity currently sits.
    const found = locator ? locator.locate(id) : (id as number);
    if (found !== null) {
      settle(found, token);
      return;
    }

    const locateAsync = locator?.locateAsync;
    if (locateAsync) {
      // A sync miss is not a settled miss: write nothing and stay closed until
      // this resolves, so a link into an unloaded page survives the fetch.
      // Whatever it returns is the answer — nothing re-locates afterwards.
      locateAsync(id).then(
        (next) => settle(next, token),
        () => settle(null, token),
      );
      return;
    }

    // Not loaded, and no way to load it — self-heal.
    settle(null, token);
  };

  const set = (next: string | number | null): void => {
    if (next === null) {
      remove();
      return;
    }

    // A number is a slide index: turn it back into an identity (through the
    // locator, or straight across when the identity is the index) and encode
    // that. A string is a raw override, written verbatim.
    const serialized =
      typeof next === 'number'
        ? codec.encode(locator ? locator.identify(next) : (next as Id))
        : String(next);
    const present = readParam() !== null;
    const to = buildSearch(serialized);

    if (present) {
      // Same entry, so the ownership stamp on it is preserved by the merge.
      adapter.replace(to);
    } else {
      adapter.push(to, { [_kOwnerKey]: param });
    }

    value.value = serialized;
  };

  const sync = (): void => {
    const next = readParam();
    const appeared = value.value === null && next !== null;

    closing = false;
    value.value = next;

    // The parameter appeared without us writing it, so something else — an
    // ordinary link, a router navigation — pushed this entry. That can only
    // happen while the page is already running, which means there is an entry
    // behind us and stepping back is safe. Claim it, so closing pops the entry
    // instead of stranding a copy of the page in the history.
    //
    // A link that arrives with the page is not claimed: the parameter is
    // already set when tracking starts, so no appearance is ever observed and
    // there is nothing behind us to step back to.
    if (appeared && !ownsCurrentEntry()) {
      adapter.replace(buildSearch(next), { [_kOwnerKey]: param });
    }

    derive();
  };

  const attach = (): Dispose => {
    disposed = false;
    // A close awaiting its history step when we last detached can never land
    // now — its listener is gone — so its latch must not carry into this life.
    closing = false;
    value.value = readParam();
    derive();

    const stop = adapter.subscribe(sync);

    return () => {
      // Marks any async lookup still in flight as stale, so an answer arriving
      // after teardown neither opens anything nor writes to the URL.
      disposed = true;
      stop();
    };
  };

  return { value, index, set, attach };
};

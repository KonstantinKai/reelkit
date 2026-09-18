import { observeDomEvent } from '../dom/observeDomEvent';
import { createSignal, type Signal, type Dispose } from '../signal/signal';
import { indexCodec } from './urlIndexKey';

/**
 * Key stamped into a history entry's state to mark the entry as one this
 * controller pushed. Read back on close to decide whether going back would
 * land on our own entry — instance memory cannot answer that after a remount.
 */
const _kOwnerKey = '__rk_url_owner';

/**
 * What an adapter knows about the navigation that just landed.
 *
 * Passed to a `subscribe` listener. Every field is optional: an adapter that
 * cannot tell how the current entry came to be current passes nothing, and
 * the controller then takes the conservative path — it never claims an entry
 * it cannot prove is safe to step back from.
 */
export interface UrlChange {
  /**
   * How the entry the URL now sits on came to be current.
   *
   * - `push`: a new entry was added on top of the page that was already
   *   running, without leaving that page. Stepping back from it lands on the
   *   page as it was before, so the controller may claim the entry and let a
   *   close pop it.
   * - `replace`: the current entry was rewritten in place. Nothing is known
   *   about what lies behind it.
   * - `pop`: the user moved through history. The entry already existed.
   *
   * Report `push` only for a navigation the adapter's own router made on the
   * same page. A cross-page navigation, a cold load, and a hash change all
   * leave it out.
   */
  kind?: 'push' | 'replace' | 'pop';
}

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
   * The listener accepts an optional {@link UrlChange}. Pass one when the
   * adapter can tell how the entry came to be current; calling the listener
   * with no argument is always valid and means "unknown". An adapter written
   * against the earlier zero-argument listener keeps compiling and working.
   *
   * @returns A dispose function that removes the listener.
   */
  subscribe: (listener: (change?: UrlChange) => void) => Dispose;

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
export const createHistoryAdapter = (): UrlAdapter => {
  // A bare `?photo=2` handed to the History API resolves like a relative
  // link: the fragment is dropped, and an empty string resolves to the
  // current URL, query included, so a removal would never land. Spell out the
  // whole same-document URL instead.
  const sameDocument = (search: string): string => {
    const { pathname, hash } = window.location;
    return `${pathname}${search}${hash}`;
  };

  return {
    read: () => window.location.search,

    // The History API tells us about the user's own steps and nothing else;
    // a push made by other code on the page emits no event at all.
    subscribe: (listener) =>
      observeDomEvent(window, 'popstate', () => listener({ kind: 'pop' })),

    push: (to, state) =>
      window.history.pushState(state ?? null, '', sameDocument(to)),

    replace: (to, state) =>
      window.history.replaceState(
        merge(window.history.state, state),
        '',
        sameDocument(to),
      ),

    getState: () => window.history.state,

    goBack: () => window.history.back(),
  };
};

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
 * @typeParam Pos - The position an identity resolves to. Defaults to a slide
 * index (`number`) — a one-axis gallery. A stories player resolves to a
 * two-axis `{ outer, inner }` position (`TwoAxisPosition`) instead, so one
 * controller drives both.
 */
export interface UrlLocator<Id, Pos = number> {
  /**
   * The identity's position in the currently-loaded collection, or `null` when
   * it is absent or not yet loaded. Synchronous.
   */
  locate: (id: Id) => Pos | null;

  /**
   * Asynchronous fallback, called only when {@link locate} returns `null` — a
   * loaded identity never pays for a fetch. Load the pages you need, then
   * return the position the identity turned out to have.
   *
   * Whatever this returns is the answer; nothing re-runs `locate` or `decode`
   * afterwards, so a position computed from data this just fetched is race-free
   * against a collection that has not re-rendered. While it is in flight the
   * parameter survives untouched and the overlay stays closed; a `null` or a
   * rejection clears the parameter. Work that finishes after the URL has moved
   * on, after a close, or after a detach is discarded.
   */
  locateAsync?: (id: Id) => Promise<Pos | null>;

  /**
   * A position back into its identity, for writes. Synchronous — a write only
   * ever encodes a slide already on screen, so its identity is always loaded.
   */
  identify: (position: Pos) => Id;
}

/**
 * The matched `codec` + `locator` pair for one parameter. They share the same
 * `Id` and always travel together — the codec spells the identity into the URL,
 * the locator finds where that identity sits — so building them as a pair is the
 * one way to keep them from disagreeing.
 *
 * @typeParam Id - The identity the codec produces.
 * @typeParam Pos - The position the locator resolves an identity to. Defaults
 * to a slide index; a stories player pairs an object `Pos` here.
 */
export interface UrlKey<Id = number, Pos = number> {
  codec: UrlCodec<Id>;
  locator: UrlLocator<Id, Pos>;
}

/**
 * A single query parameter, mirrored into a reactive signal and back into the
 * URL. The URL is the source of truth: `value` always reflects what the
 * address bar says.
 */
export interface UrlStateController<Pos = number> {
  /** The parameter's current raw value, or `null` when it is absent. */
  value: Signal<string | null>;

  /**
   * The position the parameter currently names, or `null` when nothing is open.
   *
   * Derived by the controller, so a binding subscribes rather than re-deriving:
   * the decode-then-locate dispatch, the open/close latch, self-healing of a
   * parameter that names no slide, and discarding a stale asynchronous answer
   * all happen here, once, for every framework binding.
   *
   * Stays `null` unless a `codec` or `locator` was supplied — without one the
   * controller has no basis for turning text into a position, so it reports the
   * raw `value` only.
   *
   * While something is open this holds the position it opened at and stops
   * following the URL. The slider owns the position from that point and the URL
   * trails it; re-deriving would fight the user's swipe.
   *
   * @typeParam Pos - A slide index for a one-axis gallery; a two-axis
   * `{ outer, inner }` position (`TwoAxisPosition`) for a stories player. The
   * whole object lands in one atomic write, so a
   * subscriber never reads a half-updated position.
   */
  position: Signal<Pos | null>;

  /**
   * Writes the parameter. Passing `null` removes it.
   *
   * A `Pos` is encoded through the key's `identify` + `encode`; a `string` is
   * written verbatim, the raw-wire escape hatch. (`Pos = string` is therefore
   * not supported — a string always means the raw override.)
   *
   * Writing a position while nothing is open opens at that position at once.
   * The controller does not wait for the adapter to report the write back:
   * the History API reports nothing for a push of our own, and a router
   * reports it only once its navigation has settled.
   *
   * Whether the write adds a history entry is derived, not chosen: the first
   * write of an absent parameter pushes one entry, and every write after that
   * replaces it. So opening costs one entry and paging through a hundred
   * slides costs none — a single back step always leaves.
   */
  set: (next: Pos | string | null) => void;

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
 * `position` at all; with neither it reports the raw `value` only. When the
 * codec's identity is not itself a slide index — a string id, a slug — a
 * `locator` is required to turn that identity into a position, and the type
 * of {@link createUrlStateController} enforces it.
 *
 * @typeParam Id - The identity the codec produces. Defaults to a slide index.
 * @typeParam Pos - The position an identity resolves to. Defaults to a slide
 * index.
 */
export interface UrlStateOptions<Id = number, Pos = number> {
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
  locator?: UrlLocator<Id, Pos>;
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
 * Closing steps back only when the entry on top is provably one the
 * controller pushed, or one its adapter reported as a same-page push. A
 * parameter that arrived any other way — with the page, as a shared link
 * would, or through a navigation the adapter could not vouch for — is cleared
 * in place, because stepping back might leave the site. In that case the
 * entry that carried the parameter is rewritten in place and stays in history
 * as a copy of the page, so one back step appears to do nothing.
 */
export const createUrlStateController = <Id = number, Pos = number>(
  // A non-`number` identity cannot stand in for an index, so a codec that
  // produces one demands a `locator` — the intersection makes it a type error
  // to omit. The default `Id = number` leaves the integer case unconstrained.
  options: UrlStateOptions<Id, Pos> &
    (Id extends number ? object : { locator: UrlLocator<Id, Pos> }),
): UrlStateController<Pos> => {
  const { param, locator } = options;
  const adapter = options.adapter ?? createHistoryAdapter();
  // With neither, the controller has no basis for turning text into a slide,
  // so it leaves `position` alone and reports the raw `value` only.
  const derives = options.codec !== undefined || locator !== undefined;
  const codec = (options.codec ?? indexCodec) as UrlCodec<Id>;
  const stamp = { [_kOwnerKey]: param };

  const value = createSignal<string | null>(null);
  const position = createSignal<Pos | null>(null);

  // Guards against a second close while the first is still awaiting its
  // history step, which would pop an extra entry and leave the site. Set only
  // when a step was actually requested; a close that clears in place never
  // latches it.
  let closing = false;

  // Bumped whenever the answer to "what does the parameter name" can no longer
  // be trusted: a new derivation, a close, a detach. An asynchronous lookup
  // captures the value current when it started and compares on settle, so a
  // slow answer for a parameter the user has already navigated away from is
  // dropped instead of opening a slide nobody asked for.
  let generation = 0;
  let attached = false;

  // The value the current derivation is for. A URL change that leaves the
  // parameter untouched — a router re-emitting on its own key, the ownership
  // claim's own `replace` — must not restart the work: `locateAsync` is a
  // fetch, and re-running it would discard the one in flight and start another
  // for an answer that has not changed.
  let deriving: string | null = null;

  const readParam = (): string | null =>
    new URLSearchParams(adapter.read()).get(param);

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

  // Forgets whatever the parameter named, and drops any lookup still working
  // it out. Local only: the URL is dealt with by the caller.
  const forget = (): void => {
    generation += 1;
    deriving = null;
    position.value = null;
  };

  const remove = (): void => {
    if (closing) return;

    // Nothing is open and the URL carries nothing: there is nothing to close.
    if (value.value === null && readParam() === null) return;

    // A lookup still in flight must not open anything after the user has
    // closed, so it is cancelled here, before any navigation lands.
    forget();

    if (readParam() === null) {
      // Open locally, but the URL never carried the parameter — the router
      // refused or has not yet landed the navigation that opened us. There is
      // nothing in the URL to remove and no entry of ours to pop; just close.
      value.value = null;
      return;
    }

    if (ownsCurrentEntry()) {
      // Our own entry is on top: stepping back removes it and leaves no
      // stranded forward entry. The parameter clears when the step lands.
      closing = true;
      adapter.goBack();
      return;
    }

    // Nobody proved this entry is ours to pop — the parameter arrived with the
    // page, as a shared link would, or through a navigation the adapter could
    // not vouch for. Stepping back might leave the site, so drop the
    // parameter where it stands.
    adapter.replace(buildSearch(null));
    value.value = null;
  };

  const settle = (next: Pos | null, token: number): void => {
    if (token !== generation) return;

    if (next === null) {
      // The parameter names no slide — a stale bookmark, or a hand-edited
      // value. Clear it rather than leaving the address bar asserting a state
      // nothing can hold.
      remove();
      return;
    }

    position.value = next;
  };

  const derive = (): void => {
    if (!derives) return;

    const raw = value.value;

    if (raw === null) {
      forget();
      return;
    }

    // Already open. From here the slider owns the position and the URL only
    // trails it — reading the position back in would fight the user's swipe.
    if (position.value !== null) return;

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

    // No locator means the identity is already the position — a slide index
    // (its type is pinned to `number`). With one, ask it where the identity
    // currently sits.
    const found = locator ? locator.locate(id) : (id as unknown as Pos);
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

    settle(null, token);
  };

  const set = (next: Pos | string | null): void => {
    if (next === null) {
      remove();
      return;
    }

    const serialized =
      typeof next === 'string'
        ? next
        : codec.encode(
            locator ? locator.identify(next) : (next as unknown as Id),
          );
    const to = buildSearch(serialized);

    // Push or replace is decided from what this controller already knows, not
    // from the adapter's current URL: under a router that URL lags until the
    // navigation settles, and two quick writes would otherwise push twice.
    const wasPresent = value.value !== null;

    // Nothing is open yet, so this write is the open. Reconcile locally rather
    // than wait for the adapter to report the write back — the History API
    // never reports a push of our own. While open, the slider owns the
    // position and a write only trails it.
    const opening = derives && position.value === null;

    // Local state settles before the write goes out, so an adapter that
    // reports the write back synchronously finds nothing new to derive.
    value.value = serialized;

    if (wasPresent) {
      adapter.replace(to);
    } else {
      adapter.push(to, stamp);
    }

    // The written value derives like any other wire value, position or raw
    // string alike — a position is not taken at its word, because it may name
    // a slide past the loaded window that only the locator's pager can bring
    // in. A loaded slide still opens on this same tick. It runs after the
    // write, because a value that names nothing clears itself from the URL,
    // and there has to be a URL to clear it from.
    if (opening) derive();
  };

  const sync = (change?: UrlChange): void => {
    const next = readParam();
    const appeared = value.value === null && next !== null;

    closing = false;
    value.value = next;

    // The parameter appeared through a navigation the adapter vouches for: a
    // push made on this same page, by a link or by the router, with the page
    // as it was before sitting right behind it. Claim the entry, so closing
    // pops it instead of stranding a copy of the page in the history.
    //
    // Nothing else is claimed. A parameter that arrived with the page has
    // nothing of ours behind it; one that arrived by replace, or by a
    // navigation the adapter cannot classify, might have anything behind it.
    // Both close in place.
    if (appeared && change?.kind === 'push' && !ownsCurrentEntry()) {
      adapter.replace(buildSearch(next), stamp);
    }

    derive();
  };

  const attach = (): Dispose => {
    attached = true;
    // A close awaiting its history step when we last detached can never land
    // now — its listener is gone — so its latch must not carry into this life.
    closing = false;

    // Anything left from a previous life is stale: a lookup that settled
    // while nobody was listening, or one still in flight. Start the
    // derivation over, keeping an open position only if the URL still names
    // the same value it opened at.
    const next = readParam();
    if (next !== value.value) position.value = null;
    generation += 1;
    deriving = null;
    value.value = next;
    derive();

    const stop = adapter.subscribe(sync);

    return () => {
      if (!attached) return;
      attached = false;
      // Marks any async lookup still in flight as stale, so an answer arriving
      // after teardown neither opens anything nor writes to the URL.
      generation += 1;
      stop();
    };
  };

  return { value, position, set, attach };
};

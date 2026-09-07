import { createLruCache } from './lruCache';
import { noop } from './noop';
import { observeDomEvent } from './observeDomEvent';
import { createSignal, type Dispose, type Signal } from './signal';
import type { TwoAxisIdentity, TwoAxisPosition } from './urlIndexKey';
import type { UrlKey } from './urlState';

// Distinct wires remembered per controller. Comfortably above any payload a
// viewer accrues, so eviction is a safety valve rather than a working mode.
const _kDecodeMemoSize = 512;

/**
 * Everything a persisted store needs from the surrounding storage system.
 *
 * Injected rather than assumed so the same store can sit on `localStorage`, on
 * `sessionStorage`, on an in-memory map during a test or a server render, or on
 * a host application's own synchronous key-value layer.
 *
 * An implementation absorbs whatever its backing can actually fail at — a
 * viewer losing their place is never worth taking the page down with it. For
 * web storage that is reaching the area at all, which a privacy mode denies,
 * and writing, which throws once the quota is spent; reading defines no failure
 * of its own.
 *
 * @example Back a store with something other than web storage
 * ```ts
 * const controller = createViewedStateController({
 *   storageKey: 'gallery-seen',
 *   storage: {
 *     read: (key) => host.cache.get(key) ?? null,
 *     write: (key, value) => host.cache.set(key, value),
 *   },
 *   ...urlIndexKey(() => photos.length),
 * });
 * ```
 */
export interface StorageAdapter {
  /** Current text stored under `key`, or `null` when nothing is stored. */
  read(key: string): string | null;

  /** Stores `value` under `key`. A failed write is silently dropped. */
  write(key: string, value: string): void;

  /**
   * Registers a listener for changes made to `key` by another document — a
   * second tab on the same origin. The listener receives the new text, or
   * `null` when the key was removed.
   *
   * That value is advisory: the controller re-reads storage rather than trust
   * it, because an event can arrive after a newer local write and would
   * otherwise roll a viewer back past a position they had already passed.
   *
   * Optional: a storage backing with no notion of other documents simply omits
   * it, and the controller then runs without cross-tab synchronisation.
   *
   * @returns A dispose function that removes the listener.
   */
  subscribe?(key: string, listener: (raw: string | null) => void): Dispose;
}

/**
 * Whether a value can actually be used as a storage area.
 *
 * Present is not the same as usable: Node defines a `localStorage` global that
 * carries none of the methods unless web storage is switched on, so a server
 * render finds an object that answers to the name and nothing else. Checking
 * for the two methods this adapter calls turns that into "no storage here",
 * which is what it is.
 */
const isStorage = (value: unknown): value is Storage =>
  typeof (value as Storage | null | undefined)?.getItem === 'function' &&
  typeof (value as Storage).setItem === 'function';

/**
 * Reads a usable web storage area, or `null` when there is none.
 *
 * Two ways there is none. Touching `localStorage` is not merely a property
 * read — with cookies blocked it throws a `SecurityError` on access. And where
 * it is absent, or present in name only as it is while server rendering, there
 * is nothing to call.
 */
const getStorageSafe = (getter: () => Storage): Storage | null => {
  try {
    const area = getter();
    return isStorage(area) ? area : null;
  } catch {
    return null;
  }
};

/**
 * Builds an adapter over one web storage area, resolved lazily on every
 * operation so importing this module touches no globals and stays safe to
 * prerender.
 *
 * @param getter - Returns the storage area to use.
 * @returns An adapter that degrades to doing nothing when the area is absent.
 */
const createWebStorageAdapter = (getter: () => Storage): StorageAdapter => ({
  read: (key) => getStorageSafe(getter)?.getItem(key) ?? null,

  write: (key, value) => {
    try {
      getStorageSafe(getter)?.setItem(key, value);
    } catch {
      // Quota exhausted, or the area turned read-only mid-session. This one
      // write is lost and the next one tries again, so a transient failure
      // never disables persistence for the rest of the session.
    }
  },

  subscribe: (key, listener) => {
    const area = getStorageSafe(getter);
    if (typeof window === 'undefined' || !area) return noop;

    return observeDomEvent(window, 'storage', (event) => {
      if (event.storageArea !== area) return;
      // A `null` key means the whole area was cleared, which affects this key
      // as much as a direct write to it does.
      if (event.key !== null && event.key !== key) return;
      listener(event.key === null ? null : event.newValue);
    });
  },
});

/**
 * The default storage backing: `localStorage`, so what a viewer has
 * already seen survives a reload and a new tab.
 *
 * Globals are touched lazily inside each method, never at module scope, so
 * importing this module stays safe during server rendering and prerendering.
 *
 * @returns An adapter over `localStorage`, inert where it is unavailable.
 */
export const createLocalStorageAdapter = (): StorageAdapter =>
  createWebStorageAdapter(() => localStorage);

/**
 * A `sessionStorage` backing, for state that should not outlive the tab —
 * a viewer who wants every gallery to look fresh tomorrow.
 *
 * @returns An adapter over `sessionStorage`, inert where it is unavailable.
 */
export const createSessionStorageAdapter = (): StorageAdapter =>
  createWebStorageAdapter(() => sessionStorage);

/**
 * A map-backed adapter that persists nothing, for tests and for server
 * rendering where no real storage exists. It has no other documents to hear
 * from, so it offers no `subscribe`.
 *
 * @returns A fresh in-memory adapter.
 */
export const createMemoryStorageAdapter = (): StorageAdapter => {
  const entries = new Map<string, string>();

  return {
    read: (key) => entries.get(key) ?? null,
    write: (key, value) => {
      entries.set(key, value);
    },
  };
};

/**
 * How far through its track a position sits. The controller keeps the greatest
 * value it has seen per track, so re-watching from the start never rewinds
 * what was already seen.
 *
 * Required for any position that is not a plain slide index, since there is no
 * other way to compare two of them. A two-axis player spreads
 * {@link twoAxisViewedTracking} rather than writing it out.
 *
 * @typeParam Pos - The position being measured.
 */
export interface ViewedProgressOption<Pos> {
  progressOf: (position: Pos) => number;
}

/**
 * The part of {@link ViewedStateOptions} that does not depend on the position
 * type. Split out so the progress function can be required or optional
 * according to that type without restating everything else.
 *
 * @typeParam Id - The identity the `codec` reads out of a stored entry.
 */
export interface ViewedStateBaseOptions<Id = number> {
  /** Storage key the entries are written under, for example `stories-seen`. */
  storageKey: string;

  /**
   * Storage backing to read and write through.
   *
   * @default createLocalStorageAdapter()
   */
  storage?: StorageAdapter;

  /**
   * How long a track stays remembered after it was last recorded, in
   * milliseconds. Each track expires on its own clock, and recording it again
   * restarts that clock, so somewhere still being watched never goes stale
   * beside somewhere abandoned months ago.
   *
   * Setting this changes what is written: each entry becomes a
   * `[wire, timestamp]` pair rather than a bare string. Reading copes with
   * either shape whatever this is set to, so turning it on, off, or on again
   * never orphans what is already stored — and an entry stored before it was
   * turned on counts as fresh rather than being thrown away.
   *
   * Age is judged whenever storage is read: at `attach()`, on every write, and
   * when another tab changes the key. No timer runs, so a page left open for
   * longer than the lifetime keeps showing what it loaded until something
   * touches storage again.
   *
   * @default undefined — remembered until forgotten explicitly
   */
  ttlMs?: number;

  /**
   * How many tracks to keep. Past it, the least recently recorded track is
   * dropped on the next write, so an account that has seen thousands of
   * authors keeps a payload the size of the ones it still visits. Recording a
   * track, even a position already behind, moves it to the back of the line.
   *
   * Trimming also applies when a payload is read, so lowering the cap shrinks
   * an existing file the next time it is written. Independent of `ttlMs`: age
   * removes first, then count.
   *
   * @default undefined — every track kept
   */
  maxTracks?: number;

  /**
   * Groups entries so the controller keeps one furthest position per track. A
   * stories feed tracks per group — `id => String(id.outer)`, which
   * {@link twoAxisViewedTracking} supplies — so every author keeps their own
   * place; a single gallery leaves it alone and keeps one entry overall.
   *
   * Derived from the decoded identity rather than the resolved position, so an
   * entry whose items are not loaded still knows which track it belongs to.
   *
   * @default () => '' — one track for the whole collection
   */
  trackOf?: (id: Id) => string;
}

/**
 * Configuration for {@link createViewedStateController}.
 *
 * The `codec`/`locator` pair is the same {@link UrlKey} the address bar uses,
 * so spread one key into both surfaces and a bookmark and a stored entry are
 * the same string.
 *
 * `progressOf` is optional only for a plain slide index, where the position is
 * its own measure of progress. Any other position — a two-axis
 * `{ outer, inner }`, say — must say which number to compare, because
 * "further than" has no meaning otherwise and every recording would overwrite
 * the last.
 *
 * @example One key, two surfaces
 * ```ts
 * const key = urlStableIdTwoAxisKey({ outerItems, innerItems });
 * const url = createUrlStateController({ param: 'story', ...key });
 * const seen = createViewedStateController({
 *   storageKey: 'stories-seen',
 *   ...key,
 *   ...twoAxisViewedTracking,
 * });
 * ```
 *
 * @typeParam Id - The identity the `codec` reads out of a stored entry.
 * @typeParam Pos - The position an identity resolves to.
 */
export type ViewedStateOptions<Id = number, Pos = number> = UrlKey<Id, Pos> &
  ViewedStateBaseOptions<Id> &
  ([Pos] extends [number]
    ? Partial<ViewedProgressOption<Pos>>
    : ViewedProgressOption<Pos>);

/**
 * A record of how far a viewer got, persisted as the very text the URL would
 * carry for the same position.
 *
 * @typeParam Pos - The position an entry resolves to.
 */
export interface ViewedStateController<Pos = number> {
  /**
   * Track to stored text, holding every entry that could be read back —
   * including entries whose items are not loaded yet, which {@link resolve}
   * answers `null` for until they are.
   *
   * A signal, so a ring or badge rendered from it updates when a position is
   * recorded and when another tab records one.
   */
  readonly entries: Signal<ReadonlyMap<string, string>>;

  /**
   * Where a track's stored entry sits in the collection right now, or `null`
   * when there is no entry or its item is absent. Runs the full key cycle on
   * every call, so a reordered collection answers with the new position.
   */
  resolve(track: string): Pos | null;

  /**
   * Stores `position` as the furthest point reached in its track. A position
   * behind the one already held does not move it, but it does refresh what
   * this controller knows from storage, and under `ttlMs` it restarts that
   * track's clock.
   */
  record(position: Pos): void;

  /** Clears one track, or every track when called with no argument. */
  forget(track?: string): void;

  /**
   * Loads the stored entries and starts following changes made by other tabs.
   *
   * Nothing is read before this is called, so the first render matches what a
   * server rendered and hydration stays quiet. Calling it again while attached
   * changes nothing.
   *
   * @returns A dispose function that stops following changes.
   */
  attach(): Dispose;
}

/**
 * A stored entry as the controller holds it: the wire text plus, when a
 * lifetime is in play, when that track was last recorded. The timestamp is
 * absent for anything written before a lifetime was configured.
 */
interface TrackedEntry {
  wire: string;
  recordedAt?: number;
}

/**
 * The `trackOf`/`progressOf` pair for a two-axis player: one track per outer
 * slot — a stories group, an album — with the inner index measuring progress
 * through it. Spread it beside a two-axis key.
 *
 * @example One entry per stories group
 * ```ts
 * createViewedStateController({
 *   storageKey: 'stories-seen',
 *   ...urlStableIdTwoAxisKey({ outerItems, innerItems }),
 *   ...twoAxisViewedTracking,
 * });
 * ```
 */
export const twoAxisViewedTracking: {
  trackOf: (id: TwoAxisIdentity<unknown, unknown>) => string;
  progressOf: (position: TwoAxisPosition) => number;
} = {
  trackOf: (id) => String(id.outer),
  progressOf: (position) => position.inner,
};

/**
 * Creates a controller holding how far a viewer got through a collection, persisted
 * through a {@link StorageAdapter} as raw URL parameter text.
 *
 * Entries are stored as the exact text the address bar would carry for the same
 * position, and are read back through the same `codec.decode` then
 * `locator.locate` cycle. Nothing trusts a stored index: a collection that
 * reordered under an identity-addressed key answers with the item's new
 * position, and an item that is gone answers `null` rather than opening
 * whatever slid into its slot.
 *
 * Durability therefore follows the key, not the controller — an identity-addressed
 * key survives the collection being reordered, a position-addressed one does
 * not.
 *
 * Reading is synchronous only: a `locator.locateAsync` is never called from
 * here, because remembering a place must not fetch pages of a feed nobody is
 * looking at. An entry whose items are not loaded reads as absent and is left
 * untouched in storage until they are.
 *
 * @typeParam Id - The identity the `codec` reads out of a stored entry.
 * @typeParam Pos - The position an identity resolves to.
 * @param options - The storage key and `codec`/`locator` pair, plus the
 * optional storage backing and track/progress functions.
 * @returns The controller, inert until {@link ViewedStateController.attach} is called.
 *
 * @example Remember which stories a viewer has already seen
 * ```ts
 * const seen = createViewedStateController({
 *   storageKey: 'stories-seen',
 *   ...urlStableIdTwoAxisKey({ outerItems, innerItems }),
 *   ...twoAxisViewedTracking,
 * });
 *
 * const stopFollowing = seen.attach(); // read storage, follow other tabs
 *
 * seen.record({ outer: 2, inner: 1 }); // furthest point wins; a rewatch never rewinds
 * seen.resolve('user_42'); // → { outer: 2, inner: 1 }, or null once that story is gone
 *
 * stopFollowing();
 * ```
 *
 * @example A single gallery, one entry overall
 * ```ts
 * const seen = createViewedStateController({
 *   storageKey: 'gallery-seen',
 *   ...urlIndexKey(() => photos.length),
 * });
 * seen.attach();
 *
 * seen.record(7);
 * seen.resolve(''); // → 7 — the default track, since `trackOf` was left alone
 * ```
 */
export const createViewedStateController = <Id = number, Pos = number>(
  options: ViewedStateOptions<Id, Pos>,
): ViewedStateController<Pos> => {
  const { storageKey, codec, locator, ttlMs, maxTracks } = options;

  // Writes go through a bounded view of the same Map when a cap is set. The
  // Map stays the thing serialized, projected and copied, so nothing else
  // changes shape; uncapped writes never reorder, which keeps the stored text
  // byte-identical to what it was before caps existed.
  const sink = (map: Map<string, TrackedEntry>) =>
    maxTracks === undefined ? map : createLruCache(maxTracks, undefined, map);
  const storage = options.storage ?? createLocalStorageAdapter();
  const trackOf = options.trackOf ?? (() => '');
  const progressOf =
    options.progressOf ?? ((position: Pos) => position as unknown as number);

  const entries = createSignal<ReadonlyMap<string, string>>(new Map());
  let detach: Dispose | null = null;

  // Every read decodes every stored wire, and the same wires come back read
  // after read. A wire is an immutable string, so what it decodes to never
  // changes for this codec; remembering the answer is safe, and bounding the
  // memory means a payload larger than the cap merely re-decodes on a miss.
  const decoded = createLruCache<Id | null>(_kDecodeMemoSize);

  const decode = (wire: string): Id | null => {
    if (decoded.has(wire)) return decoded.get(wire) as Id | null;
    const identity = codec.decode(wire);
    decoded.set(wire, identity);
    return identity;
  };

  const positionOf = (wire: string): Pos | null => {
    const identity = decode(wire);
    return identity === null ? null : locator.locate(identity);
  };

  const progressOfWire = (wire: string): number | null => {
    const position = positionOf(wire);
    return position === null ? null : progressOf(position);
  };

  /**
   * Picks the entry that reached further. An entry nobody can place right now
   * has no measurable progress, so a placeable rival wins; when neither can be
   * placed the one already held stays, since there is nothing to compare.
   */
  const furthest = (held: TrackedEntry, rival: TrackedEntry): TrackedEntry => {
    const heldProgress = progressOfWire(held.wire);
    const rivalProgress = progressOfWire(rival.wire);
    // Whichever wire wins, the track is as fresh as the freshest of the two —
    // both were recorded, so the later one is the truth about activity.
    const recordedAt = [held.recordedAt, rival.recordedAt].includes(undefined)
      ? undefined
      : Math.max(held.recordedAt ?? 0, rival.recordedAt ?? 0);

    if (rivalProgress === null) return { ...held, recordedAt };
    if (heldProgress === null) return { ...rival, recordedAt };
    return rivalProgress > heldProgress
      ? { ...rival, recordedAt }
      : { ...held, recordedAt };
  };

  /**
   * Reads one payload element into an entry. Two shapes are accepted for good:
   * a bare wire string, and a `[wire, timestamp]` pair. Which one gets written
   * depends on whether a lifetime is configured, but reading never depends on
   * it — otherwise turning a lifetime on or off would orphan everything stored
   * under the other setting.
   */
  const toEntry = (element: unknown): TrackedEntry | null => {
    if (typeof element === 'string') return { wire: element };
    if (
      Array.isArray(element) &&
      typeof element[0] === 'string' &&
      typeof element[1] === 'number'
    )
      return { wire: element[0], recordedAt: element[1] };
    return null;
  };

  /**
   * Whether an entry has outlived its welcome. An entry with no timestamp
   * predates the lifetime being configured: it counts as fresh, because
   * switching the option on is a retention policy taking effect, not a licence
   * to delete what a viewer already did.
   */
  const isExpired = (entry: TrackedEntry): boolean =>
    ttlMs !== undefined &&
    entry.recordedAt !== undefined &&
    Date.now() - entry.recordedAt > ttlMs;

  /**
   * Reads stored text back into tracked entries.
   *
   * Two kinds of damage get two different answers. Text that cannot be read at
   * all — broken JSON, the wrong shape, an entry the codec rejects — names
   * nothing under any state of the collection and is dropped. An entry that
   * reads fine but cannot be placed is kept: it is a group that has not paged
   * in yet, not garbage, and dropping it would make a windowed feed eat its own
   * history.
   */
  const parse = (raw: string | null): Map<string, TrackedEntry> => {
    const parsed = new Map<string, TrackedEntry>();
    const into = sink(parsed);
    if (raw === null) return parsed;

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return parsed;
    }
    if (!Array.isArray(payload)) return parsed;

    for (const element of payload) {
      const entry = toEntry(element);
      if (entry === null || isExpired(entry)) continue;

      const identity = decode(entry.wire);
      if (identity === null) continue;

      const track = trackOf(identity);
      const held = parsed.get(track);
      into.set(track, held === undefined ? entry : furthest(held, entry));
    }

    return parsed;
  };

  /**
   * Writes entries back out. Without a lifetime the payload is the flat array
   * of wire strings it has always been, byte for byte; with one, each entry
   * carries the moment it was recorded.
   */
  const serialize = (map: Map<string, TrackedEntry>): string =>
    JSON.stringify(
      [...map.values()].map((entry) =>
        ttlMs === undefined
          ? entry.wire
          : [entry.wire, entry.recordedAt ?? Date.now()],
      ),
    );

  const project = (map: Map<string, TrackedEntry>): Map<string, string> =>
    new Map([...map].map(([track, entry]) => [track, entry.wire]));

  // The built-in adapters absorb their own failures, but a consumer's own
  // storage layer may not, and a viewer losing their place is never worth
  // taking the page down with it. A failed read answers `null` — which is not
  // the same as an empty area, and is why it is not merely parsed as nothing:
  // writing a payload built on that guess would erase every track this
  // controller cannot see. A failed write keeps the position in memory for the
  // session and the next write tries storage again.
  const readStored = (): Map<string, TrackedEntry> | null => {
    try {
      return parse(storage.read(storageKey));
    } catch {
      return null;
    }
  };

  /** What this controller currently holds, in the shape storage is read into. */
  let memory = new Map<string, TrackedEntry>();

  /** Takes a snapshot as the truth without writing it anywhere. */
  /**
   * Whether `next` would project to what observers already see. The signal
   * dedupes by identity alone and every snapshot is a fresh Map, so without
   * this check a record that changed nothing on disk — a rewatch, a swipe back
   * — would still repaint every ring subscribed to it.
   */
  const sameProjection = (next: Map<string, TrackedEntry>): boolean => {
    const current = entries.value;
    if (current.size !== next.size) return false;
    for (const [track, entry] of next) {
      if (current.get(track) !== entry.wire) return false;
    }
    return true;
  };

  const adopt = (next: Map<string, TrackedEntry>) => {
    // Memory always takes the snapshot: a refreshed lifetime stamp is real
    // even when no wire moved. Only the visible projection is guarded.
    memory = next;
    if (!sameProjection(next)) entries.value = project(next);
  };

  const publish = (next: Map<string, TrackedEntry>) => {
    try {
      storage.write(storageKey, serialize(next));
    } catch {
      // Kept in memory below regardless.
    }
    adopt(next);
  };

  /**
   * Takes a snapshot, writing it out only when storage answered. A read that
   * threw says nothing about what is stored, so the position is kept for this
   * session rather than written over tracks this controller cannot see.
   */
  const commit = (next: Map<string, TrackedEntry>, persist: boolean) =>
    persist ? publish(next) : adopt(next);

  /** The further of two entries where either may be missing. */
  const furthestOf = (
    a: TrackedEntry | undefined,
    b: TrackedEntry | undefined,
  ): TrackedEntry | undefined => {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return furthest(a, b);
  };

  return {
    entries,

    resolve: (track) => {
      const wire = entries.value.get(track);
      return wire === undefined ? null : positionOf(wire);
    },

    record: (position) => {
      let wire: string;
      let track: string;
      try {
        const identity = locator.identify(position);
        wire = codec.encode(identity);
        track = trackOf(identity);
      } catch {
        // Reading a position back into an identity is only ever asked of a
        // position on screen, and encoding refuses text it could not read back.
        // A caller recording something stale trips either one, and losing that
        // single write is a far better outcome than throwing inside whatever
        // playback callback asked for it.
        return;
      }

      // Merge into what is on disk right now rather than serialising what this
      // controller happens to hold. One whose `attach` has not run yet holds
      // nothing, and a second tab may have recorded since the last read; either
      // way, writing from memory alone would wipe tracks this controller never
      // touched.
      const disk = readStored();
      const next = disk ?? new Map(memory);
      const recordedAt = ttlMs === undefined ? undefined : Date.now();

      // For the track being recorded, what this controller holds counts as much
      // as what is on disk. A position that survived a failed write lives only
      // in memory, and a later, shorter one must not quietly undo it.
      const held = furthestOf(next.get(track), memory.get(track));
      const heldProgress =
        held === undefined ? null : progressOfWire(held.wire);

      if (held !== undefined && heldProgress !== null) {
        if (heldProgress >= progressOf(position)) {
          // Behind what is known, so the position itself is not news. Under a
          // lifetime the activity still is: someone is watching this track, and
          // re-watching must keep it alive rather than let it age out.
          // The furthest entry rides along whichever side it came from, since
          // it may be the one a failed write left in memory and nowhere else.
          const storedWire = disk?.get(track)?.wire;
          sink(next).set(
            track,
            ttlMs === undefined ? held : { ...held, recordedAt },
          );

          // Nothing new to say about the position, so storage is touched only
          // when it is actually behind — which it is exactly when the furthest
          // entry never reached it. Under a lifetime it is always touched: the
          // clock restarts because someone is still watching.
          commit(
            next,
            disk !== null &&
              (ttlMs !== undefined ||
                maxTracks !== undefined ||
                held.wire !== storedWire),
          );
          return;
        }
      }

      sink(next).set(track, { wire, recordedAt });
      commit(next, disk !== null);
    },

    forget: (track) => {
      if (track === undefined) {
        publish(new Map());
        return;
      }

      const disk = readStored();
      const next = disk ?? new Map(memory);
      next.delete(track);
      commit(next, disk !== null);
    },

    attach: () => {
      if (detach) return detach;

      const stored = readStored();
      if (stored !== null) adopt(stored);

      const unsubscribe = storage.subscribe?.(storageKey, () => {
        // What the event carries is what another document wrote at the moment
        // it wrote it. Delivery is asynchronous, and this tab may have recorded
        // since, so taking the payload at face value would roll a viewer back
        // to a position they had already moved past. Current storage is the
        // truth; a read that fails leaves this tab on what it already had.
        const current = readStored();
        if (current !== null) adopt(current);
      });

      detach = () => {
        detach = null;
        unsubscribe?.();
      };

      return detach;
    },
  };
};

// Test support, deliberately unpublished.
//
// This lives under a published package's src/ but is kept out of
// packages/reelkit-core/src/index.ts on purpose: adding it there would put a
// test helper in the public API, the docs coverage gate, and every consumer's
// bundle. `exports` lists only "." and "./package.json", so an outside import
// of @reelkit/core/testing fails with ERR_PACKAGE_PATH_NOT_EXPORTED, and
// files: ["dist"] keeps it out of the tarball.
//
// Repo specs reach it through the "@reelkit/core/testing" path mapping —
// tsconfig.base.json for vitest, plus a moduleNameMapper entry and a local
// paths override for each jest project, which do not inherit the base paths.

import type { StorageAdapter } from '../lib/utils/viewedState';
import type { UrlAdapter } from '../lib/utils/urlState';

/** Options for {@link createFakeUrlAdapter}. */
export interface FakeUrlAdapterOptions {
  /**
   * Whether `push` notifies subscribers, as a real navigation would.
   *
   * A binding test drives the URL and expects the overlay to react, so it wants
   * `true`. A core test usually wants to separate "the URL was written" from
   * "the listener was told" — it passes `false` and calls `fireUrlChange`
   * itself, which is the only way to assert that a write did *not* notify.
   *
   * @default true
   */
  notifyOnPush?: boolean;
}

/** What {@link createFakeUrlAdapter} hands back. */
export interface FakeUrlAdapter {
  /** The adapter to pass to `createUrlStateController`. */
  adapter: UrlAdapter;

  /**
   * How many times each write method ran. Makes the entry cost of an open
   * assertable: opening should push exactly once and every write after it
   * should replace, so paging never buries the back button.
   */
  counts: { push: number; replace: number };

  /** The history stack itself, for asserting what landed where. */
  entries: Array<{ search: string; state: unknown }>;

  /** Index of the current entry. */
  readonly cursor: number;

  /** Number of entries on the stack. */
  readonly depth: number;

  /**
   * How many subscribers are attached. A controller's `attach` returns its
   * disposer, so this is how a test proves the two are symmetric and nothing
   * keeps listening after teardown.
   */
  readonly listenerCount: number;

  /** Simulates the user pressing Back or Forward. */
  fireUrlChange: () => void;
}

/**
 * In-memory stand-in for the browser history stack.
 *
 * The real thing cannot be asserted against: `history.length` is capped and
 * shared with the test runner's own navigations, and `pushState` is throttled.
 * This keeps its own stack so a test can read the entry count directly.
 *
 * @param initialSearch - Query string the page starts on, including the `?`.
 * @param options - See {@link FakeUrlAdapterOptions}.
 * @returns The adapter plus the counters and stack to assert against.
 */
export const createFakeUrlAdapter = (
  initialSearch = '',
  options: FakeUrlAdapterOptions = {},
): FakeUrlAdapter => {
  const { notifyOnPush = true } = options;

  const entries: Array<{ search: string; state: unknown }> = [
    { search: initialSearch, state: null },
  ];
  const listeners = new Set<() => void>();
  let cursor = 0;
  const counts = { push: 0, replace: 0 };

  const notify = () => listeners.forEach((listener) => listener());

  // A brand-new entry starts from the given state, so there is nothing to
  // preserve — but `null` and `undefined` are not the same answer here. The
  // controller reads state back to decide whether it owns an entry, and
  // spreading `undefined` over `null` would turn "no state" into `{}`, which
  // reads as an entry someone stamped.
  const merge = (previous: unknown, next: unknown) =>
    previous === null && next === undefined
      ? null
      : { ...(previous as object), ...(next as object) };

  const adapter: UrlAdapter = {
    read: () => entries[cursor].search,
    getState: () => entries[cursor].state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    push: (to, state) => {
      counts.push += 1;
      entries.splice(cursor + 1);
      entries.push({ search: to, state: state ?? null });
      cursor += 1;
      if (notifyOnPush) notify();
    },
    replace: (to, state) => {
      counts.replace += 1;
      entries[cursor] = {
        search: to,
        state: merge(entries[cursor].state, state),
      };
    },
    goBack: () => {
      if (cursor > 0) cursor -= 1;
      notify();
    },
  };

  return {
    adapter,
    counts,
    entries,
    get cursor() {
      return cursor;
    },
    get depth() {
      return entries.length;
    },
    get listenerCount() {
      return listeners.size;
    },
    fireUrlChange: notify,
  };
};

/** Options for {@link createFakeStorageAdapter}. */
export interface FakeStorageAdapterOptions {
  /** Text already stored under the key when the test starts. */
  initial?: string | null;

  /**
   * Whether every write throws, standing in for an exhausted quota or an area
   * that privacy settings made read-only.
   *
   * @default false
   */
  failWrites?: boolean;

  /**
   * Whether every read throws, standing in for a consumer's own storage layer
   * failing. Web storage defines no failure for a read, so this is only
   * reachable through an adapter someone wrote themselves.
   *
   * @default false
   */
  failReads?: boolean;
}

/** What {@link createFakeStorageAdapter} hands back. */
export interface FakeStorageAdapter {
  /** The adapter to pass to `createViewedStateController`. */
  adapter: StorageAdapter;

  /** How many times each method ran, for asserting a write was skipped. */
  counts: { read: number; write: number };

  /** Text currently stored, as another tab would find it. */
  readonly stored: string | null;

  /** How many subscribers are attached, so teardown can be proven symmetric. */
  readonly listenerCount: number;

  /** Makes every subsequent write throw, or stops it throwing again. */
  setFailWrites: (failing: boolean) => void;

  /** Makes every subsequent read throw, or stops it throwing again. */
  setFailReads: (failing: boolean) => void;

  /** Simulates another tab writing the key, notifying subscribers. */
  fireExternalChange: (raw: string | null) => void;

  /**
   * Delivers a notification carrying `raw` without changing what is stored —
   * an event that was queued before a later write and arrives after it, which
   * is the ordering a real `storage` event makes possible.
   */
  notify: (raw: string | null) => void;
}

/**
 * In-memory stand-in for a web storage area plus its cross-tab notifications.
 *
 * Core specs run without a DOM, so there is no real `localStorage` and no
 * `storage` event to fire. This supplies both, and unlike the real thing it can
 * be made to fail on demand — the quota path is otherwise untestable.
 *
 * @param options - See {@link FakeStorageAdapterOptions}.
 * @returns The adapter plus the stored text, counters, and the external-change
 * trigger to assert against.
 */
export const createFakeStorageAdapter = (
  options: FakeStorageAdapterOptions = {},
): FakeStorageAdapter => {
  const { initial = null, failWrites = false, failReads = false } = options;

  const listeners = new Set<(raw: string | null) => void>();
  const counts = { read: 0, write: 0 };
  let stored = initial;
  let failing = failWrites;
  let failingReads = failReads;

  const adapter: StorageAdapter = {
    read: () => {
      counts.read += 1;
      if (failingReads) throw new Error('storage unavailable');
      return stored;
    },
    write: (_key, value) => {
      counts.write += 1;
      if (failing) throw new Error('QuotaExceededError');
      stored = value;
    },
    subscribe: (_key, listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return {
    adapter,
    counts,
    get stored() {
      return stored;
    },
    get listenerCount() {
      return listeners.size;
    },
    setFailWrites: (next) => {
      failing = next;
    },
    setFailReads: (next) => {
      failingReads = next;
    },
    fireExternalChange: (raw) => {
      stored = raw;
      listeners.forEach((listener) => listener(raw));
    },
    notify: (raw) => listeners.forEach((listener) => listener(raw)),
  };
};

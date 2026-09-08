import { onScopeDispose } from 'vue';
import {
  useRouter,
  useRoute,
  type HistoryState,
  type LocationQueryRaw,
} from 'vue-router';
import type { UrlAdapter, UrlChange } from '@reelkit/core';

// Drives reelkit's URL state through Vue Router instead of the History API, so
// the router stays the single source of navigation truth: writing
// `history.pushState` behind the router leaves its location stale and its next
// navigation drops the parameter.
//
// Ships behind the `@reelkit/vue/vue-router-url-adapter` subpath, so the main
// entry never imports `vue-router` — an application without a router pays
// nothing for it.
//
// The ownership stamp the controller round-trips rides in the router's own
// `state` navigation option (Vue Router 4.1 and later), so it lands in the
// real `history.state` alongside the router's keys and lives and dies with
// the entry it marks. On a router too old to honour `state` the stamp never
// lands, the controller sees no proof of ownership, and closing falls back
// to clearing the parameter in place — safe, if one entry heavier.

/** The state Vue Router keeps on every history entry. */
interface RouterHistoryState {
  position?: number;
}

const readPosition = (): number =>
  (window.history.state as RouterHistoryState | null)?.position ?? 0;

/**
 * The query part of a full path, up to but excluding any fragment. A `?`
 * inside the fragment is not a query.
 */
const searchOf = (fullPath: string): string => {
  const hashAt = fullPath.indexOf('#');
  const end = hashAt === -1 ? fullPath.length : hashAt;
  const queryAt = fullPath.indexOf('?');
  return queryAt === -1 || queryAt > end ? '' : fullPath.slice(queryAt, end);
};

/**
 * The query as the router wants it: repeated keys become arrays, so
 * `?tag=a&tag=b` round-trips instead of collapsing to its last value.
 */
const toQuery = (search: string): LocationQueryRaw => {
  const query: LocationQueryRaw = {};
  new URLSearchParams(search).forEach((value, key) => {
    const previous = query[key];
    query[key] =
      previous === undefined
        ? value
        : Array.isArray(previous)
          ? [...previous, value]
          : [previous as string, value];
  });
  return query;
};

export function useVueRouterUrlAdapter(): UrlAdapter {
  const router = useRouter();
  const route = useRoute();
  const listeners = new Set<(change?: UrlChange) => void>();

  // Whether the navigation in flight was started by the browser's own back or
  // forward step. The router tells its history layer, and nothing else, about
  // those; the completed navigation then reads it here.
  let popping = false;
  const stopHistory = router.options.history.listen(() => {
    popping = true;
  });

  let previousPosition = readPosition();

  // The router does not emit `popstate` for its own navigations, so a
  // completed navigation is the change signal. One that failed or was
  // cancelled changed nothing and is not reported.
  const stopAfterEach = router.afterEach((to, from, failure) => {
    if (failure) {
      popping = false;
      return;
    }

    const position = readPosition();
    const change = describeChange(
      popping,
      position - previousPosition,
      from.path === to.path,
    );
    popping = false;
    previousPosition = position;

    listeners.forEach((listener) => listener(change));
  });

  onScopeDispose(() => {
    stopHistory();
    stopAfterEach();
  });

  // Writes touch the query only: the path and the hash of the current route
  // ride along untouched.
  const toLocation = (search: string, state?: unknown) => ({
    path: route.path,
    query: toQuery(search),
    hash: route.hash,
    ...(state !== undefined && { state: state as HistoryState }),
  });

  return {
    read: () => searchOf(route.fullPath),

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    push: (to, state) => {
      void router.push(toLocation(to, state));
    },

    // Replacing keeps the current entry. The router itself merges the given
    // state over what the entry already holds, so the stamp goes through
    // alone: merging `history.state` in here would hand the router's own
    // keys back to it, stale. Forced, because a replace that changes only
    // the state — the ownership claim — targets the location the router is
    // already on, and it would otherwise drop that as a duplicate.
    replace: (to, state) => {
      void router.replace({ ...toLocation(to, state), force: true });
    },

    getState: () => window.history.state,

    goBack: () => router.back(),
  };
}

const describeChange = (
  popping: boolean,
  delta: number,
  samePath: boolean,
): UrlChange | undefined => {
  if (popping) return { kind: 'pop' };
  if (delta === 0) return { kind: 'replace' };
  // The router numbers entries as it pushes them, so a push moves exactly one
  // position forward. Only a push made on the same page is safe to step back
  // from.
  if (delta === 1) return samePath ? { kind: 'push' } : undefined;
  return undefined;
};

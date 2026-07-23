import { onScopeDispose, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { UrlAdapter } from '@reelkit/core';

// Drives reelkit's URL state through Vue Router instead of the History API, so
// the router stays the single source of navigation truth: writing
// `history.pushState` behind the router leaves its location stale and its next
// navigation drops the parameter.
//
// Ships behind the `@reelkit/vue/vue-router-url-adapter` subpath, so the main
// entry never imports `vue-router` — an application without a router pays
// nothing for it.
//
// One wrinkle the React adapter does not have: Vue Router 4 owns
// `history.state` and exposes no way to write custom fields through
// `push`/`replace`, so the ownership stamp the controller round-trips (to tell
// whether closing should step back or remove the parameter in place) cannot
// ride along. We persist it in sessionStorage keyed by Vue Router's own history
// `position` — the same integer index it stores in `history.state` — so the
// stamp survives navigation and back/forward exactly as real `history.state`
// would.

const _kStoreKey = 'rk-url-state';

const positionKey = (): string => {
  const position = (window.history.state?.position as number | undefined) ?? 0;
  return `${_kStoreKey}:${position}`;
};

const readStamp = (): unknown => {
  try {
    const raw = sessionStorage.getItem(positionKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStamp = (state: unknown): void => {
  try {
    const merged = {
      ...((readStamp() as object | null) ?? {}),
      ...((state as object | null) ?? {}),
    };
    sessionStorage.setItem(positionKey(), JSON.stringify(merged));
  } catch {
    // sessionStorage unavailable (private mode, prerender) — degrade to no
    // stamp, which the controller reads as "arrived with the page".
  }
};

export function useVueRouterUrlAdapter(): UrlAdapter {
  const router = useRouter();
  const route = useRoute();
  const listeners = new Set<() => void>();

  // The router does not emit `popstate` for its own navigations, so the
  // resolved location is the change signal.
  const stop = watch(
    () => route.fullPath,
    () => listeners.forEach((listener) => listener()),
  );
  onScopeDispose(stop);

  const search = (): string => {
    const index = route.fullPath.indexOf('?');
    return index >= 0 ? route.fullPath.slice(index) : '';
  };

  const toLocation = (query: string) => {
    const params: Record<string, string> = {};
    new URLSearchParams(query).forEach((value, key) => {
      params[key] = value;
    });
    return { path: route.path, query: params };
  };

  return {
    read: search,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Stamp the entry the navigation lands on, once its position is settled.
    push: (to, state) => {
      void router.push(toLocation(to)).then(() => writeStamp(state));
    },

    replace: (to, state) => {
      void router.replace(toLocation(to)).then(() => writeStamp(state));
    },

    getState: () => readStamp(),

    goBack: () => router.back(),
  };
}

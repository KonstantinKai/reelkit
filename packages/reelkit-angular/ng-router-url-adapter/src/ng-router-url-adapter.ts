import { Location } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';
import {
  Router,
  NavigationEnd,
  NavigationStart,
  type Navigation,
  type Params,
} from '@angular/router';
import type { UrlAdapter, UrlChange } from '@reelkit/core';

/**
 * Drives reelkit's URL state through the Angular Router instead of the
 * History API.
 *
 * A routed application must not have its history written behind its back:
 * `history.pushState` leaves the Router's own location stale, and its next
 * navigation silently drops whatever was written. Routing every read and
 * write through the Router keeps one source of navigation truth.
 *
 * Writes touch the query only. The path and the fragment of the current URL
 * ride along untouched, so a gallery on `/gallery#details` opens as
 * `/gallery?photo=2#details`.
 *
 * Every change reports how the entry came to be current — a push made on the
 * same page, a replace, or a step through history — so the controller can pop
 * a link-opened overlay with one back step and never claims an entry it
 * cannot vouch for. A cross-page navigation, a hash change, and the initial
 * navigation report nothing, which the controller treats as "unknown".
 *
 * Ships behind the `@reelkit/angular/ng-router-url-adapter` subpath, so the
 * main entry never imports `@angular/router` — an application without routing
 * pays nothing for it.
 *
 * Call in an injection context. The router subscription is released through
 * {@link DestroyRef}.
 *
 * @returns An adapter to pass to `createOverlayUrlState`.
 */
export function createRouterUrlAdapter(): UrlAdapter {
  const router = inject(Router);
  const location = inject(Location);
  const destroyRef = inject(DestroyRef);
  const listeners = new Set<(change?: UrlChange) => void>();

  // What the navigation in flight is, captured when it starts: the Router
  // says how it was triggered and whether it replaces, but only at the start.
  let starting: {
    trigger: NavigationStart['navigationTrigger'];
    replaces: boolean;
  } | null = null;

  // The path the previous completed navigation landed on, for telling a
  // same-page push apart from one that arrived from another page. Starts
  // unset, so the initial navigation never reads as a push.
  let previousPath: string | null = null;

  // The Router does not emit popstate for its own navigations, so completed
  // navigation is the change signal — it covers both a link and a back step.
  // The navigation in flight. Angular 20.2 exposes it as a signal and
  // deprecates the method; the peer range still admits 19, where only the
  // method exists.
  const currentNavigation = (): Navigation | null =>
    'currentNavigation' in router
      ? router.currentNavigation()
      : (router as Router).getCurrentNavigation();

  const subscription = router.events.subscribe((event) => {
    if (event instanceof NavigationStart) {
      starting = {
        trigger: event.navigationTrigger,
        replaces: currentNavigation()?.extras.replaceUrl === true,
      };
      return;
    }
    if (!(event instanceof NavigationEnd)) return;

    const path = pathOf(event.urlAfterRedirects);
    const change = describeChange(starting, previousPath, path);
    starting = null;
    previousPath = path;

    listeners.forEach((listener) => listener(change));
  });

  destroyRef.onDestroy(() => subscription.unsubscribe());

  return {
    read: () => searchOf(router.url),

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    push: (to, state) =>
      void router.navigate([], {
        queryParams: queryParamsOf(to),
        preserveFragment: true,
        state: (state ?? undefined) as Record<string, unknown> | undefined,
      }),

    // Replacing keeps the current entry, so merge to preserve any state the
    // application already put there. A replace that changes only the state —
    // the ownership claim — targets the URL the Router is already on, which
    // it ignores by default; ask for the navigation anyway so the state lands.
    replace: (to, state) =>
      void router.navigate([], {
        queryParams: queryParamsOf(to),
        preserveFragment: true,
        replaceUrl: true,
        onSameUrlNavigation: 'reload',
        state: {
          ...((location.getState() as object | null) ?? {}),
          ...((state as object | null) ?? {}),
        },
      }),

    getState: () => location.getState(),

    goBack: () => location.back(),
  };
}

/**
 * The query part of a URL, up to but excluding any fragment. A `?` inside the
 * fragment is not a query.
 */
const searchOf = (url: string): string => {
  const fragmentAt = url.indexOf('#');
  const end = fragmentAt === -1 ? url.length : fragmentAt;
  const queryAt = url.indexOf('?');
  return queryAt === -1 || queryAt > end ? '' : url.slice(queryAt, end);
};

/** The path part of a URL: everything before the query and the fragment. */
const pathOf = (url: string): string => {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
};

/**
 * The query as the Router wants it: repeated keys become arrays, so
 * `?tag=a&tag=b` round-trips instead of collapsing to its last value.
 */
const queryParamsOf = (search: string): Params => {
  const params: Params = {};
  new URLSearchParams(search).forEach((value, key) => {
    const previous = params[key];
    params[key] =
      previous === undefined
        ? value
        : Array.isArray(previous)
          ? [...previous, value]
          : [previous, value];
  });
  return params;
};

const describeChange = (
  starting: {
    trigger: NavigationStart['navigationTrigger'];
    replaces: boolean;
  } | null,
  previousPath: string | null,
  path: string,
): UrlChange | undefined => {
  if (starting === null) return undefined;
  if (starting.trigger === 'popstate') return { kind: 'pop' };
  if (starting.trigger !== 'imperative') return undefined;
  if (starting.replaces) return { kind: 'replace' };
  // Only a push made on the same page is safe to step back from, and the
  // initial navigation has no page before it.
  return previousPath === path ? { kind: 'push' } : undefined;
};

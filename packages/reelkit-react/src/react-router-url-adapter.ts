import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import type { UrlAdapter, UrlChange } from '@reelkit/core';

/**
 * Drives reelkit's URL state through React Router instead of the History API.
 *
 * A routed application must not have its history written behind its back:
 * `history.pushState` leaves the router's own location stale, and its next
 * navigation silently drops whatever was written. Routing every read and write
 * through the router keeps one source of navigation truth.
 *
 * Writes touch the query only. The pathname and the hash of the current
 * location ride along untouched, so a gallery on `/gallery#details` opens as
 * `/gallery?photo=2#details`.
 *
 * Every change reports how the entry came to be current — a push made on the
 * same page, a replace, or a step through history — so the controller can pop
 * a link-opened overlay with one back step and never claims an entry it
 * cannot vouch for. A cross-page navigation and the first render report
 * nothing, which the controller treats as "unknown".
 *
 * Ships behind the `@reelkit/react/react-router-url-adapter` subpath, so the
 * main entry never imports `react-router-dom` — an application without a router
 * pays nothing for it.
 *
 * @returns An adapter to pass as `urlAdapter`.
 */
export const useReactRouterUrlAdapter = (): UrlAdapter => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  const latest = useRef({ navigate, location, navigationType });
  latest.current = { navigate, location, navigationType };

  const listeners = useRef(new Set<(change?: UrlChange) => void>());

  // The pathname the previous location had, for telling a same-page push
  // apart from one that arrived from another page. Starts unset, so the
  // location the component mounted on never reads as a push.
  const previousPathname = useRef<string | null>(null);

  // The router does not emit `popstate` for its own navigations, so the
  // location itself is the change signal.
  useEffect(() => {
    const { pathname } = latest.current.location;
    const before = previousPathname.current;
    previousPathname.current = pathname;

    const change = describeChange(
      latest.current.navigationType,
      before,
      pathname,
    );
    listeners.current.forEach((listener) => listener(change));
  }, [location.key, location.search]);

  return useMemo<UrlAdapter>(
    () => ({
      read: () => latest.current.location.search,

      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },

      push: (to, state) => latest.current.navigate(sameDocument(to), { state }),

      // Replacing keeps the current entry, so merge to preserve any state the
      // application already put there.
      replace: (to, state) =>
        latest.current.navigate(sameDocument(to), {
          replace: true,
          state: {
            ...((latest.current.location.state as object) ?? {}),
            ...((state as object) ?? {}),
          },
        }),

      getState: () => latest.current.location.state,

      goBack: () => latest.current.navigate(-1),
    }),
    [],
  );

  // A bare `?photo=2` handed to `navigate` resolves like a relative link and
  // drops the hash. Spell out the whole same-document target instead.
  function sameDocument(search: string) {
    const { pathname, hash } = latest.current.location;
    return { pathname, search, hash };
  }
};

const describeChange = (
  navigationType: ReturnType<typeof useNavigationType>,
  previousPathname: string | null,
  pathname: string,
): UrlChange | undefined => {
  switch (navigationType) {
    case 'POP':
      // The first render reports `POP` too, and nothing was stepped through
      // to get there.
      return previousPathname === null ? undefined : { kind: 'pop' };
    case 'REPLACE':
      return { kind: 'replace' };
    case 'PUSH':
      return previousPathname === pathname ? { kind: 'push' } : undefined;
    default:
      return undefined;
  }
};

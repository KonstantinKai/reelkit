import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { UrlAdapter } from '@reelkit/react';

/**
 * Drives reelkit's URL state through React Router instead of the History API.
 *
 * A routed application must not have its history written behind its back:
 * `history.pushState` leaves the router's own location stale, and its next
 * navigation silently drops whatever was written. Routing every read and write
 * through the router keeps one source of navigation truth.
 *
 * @returns An adapter to pass as `urlAdapter`.
 */
export const useReactRouterUrlAdapter = (): UrlAdapter => {
  const navigate = useNavigate();
  const location = useLocation();

  const latest = useRef({ navigate, location });
  latest.current = { navigate, location };

  const listeners = useRef(new Set<() => void>());

  // The router does not emit `popstate` for its own navigations, so the
  // location itself is the change signal.
  useEffect(() => {
    listeners.current.forEach((listener) => listener());
  }, [location.key, location.search]);

  return useMemo<UrlAdapter>(
    () => ({
      read: () => latest.current.location.search,

      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },

      push: (to, state) => latest.current.navigate(to, { state }),

      // Replacing keeps the current entry, so merge to preserve any state the
      // application already put there.
      replace: (to, state) =>
        latest.current.navigate(to, {
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
};

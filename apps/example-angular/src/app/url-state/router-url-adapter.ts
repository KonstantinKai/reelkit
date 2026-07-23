import { DestroyRef, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import type { UrlAdapter } from '@reelkit/angular';

/**
 * Drives reelkit's URL state through the Angular Router instead of the
 * History API.
 *
 * A routed application must not have its history written behind its back:
 * `history.pushState` leaves the Router's own location stale, and its next
 * navigation silently drops whatever was written. Routing every read and
 * write through the Router keeps one source of navigation truth.
 *
 * Call in an injection context. The `NavigationEnd` subscription is released
 * through {@link DestroyRef}.
 *
 * @returns An adapter to pass to `createOverlayUrlState`.
 */
export function createRouterUrlAdapter(): UrlAdapter {
  const router = inject(Router);
  const destroyRef = inject(DestroyRef);
  const listeners = new Set<() => void>();

  // The Router does not emit popstate for its own navigations, so completed
  // navigation is the change signal — it covers both a link and a back step.
  const subscription = router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => listeners.forEach((listener) => listener()));

  destroyRef.onDestroy(() => subscription.unsubscribe());

  const searchOf = (url: string): string => {
    const queryAt = url.indexOf('?');
    return queryAt === -1 ? '' : url.slice(queryAt);
  };

  const queryParamsOf = (to: string): Record<string, string> => {
    const params: Record<string, string> = {};
    new URLSearchParams(searchOf(to)).forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  return {
    read: () => searchOf(router.url),

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    push: (to, state) =>
      void router.navigate([], {
        queryParams: queryParamsOf(to),
        state: (state ?? undefined) as Record<string, unknown> | undefined,
      }),

    // Replacing keeps the current entry, so merge to preserve any state the
    // application already put there.
    replace: (to, state) =>
      void router.navigate([], {
        queryParams: queryParamsOf(to),
        replaceUrl: true,
        state: {
          ...((history.state as object) ?? {}),
          ...((state as object) ?? {}),
        },
      }),

    getState: () => history.state,

    goBack: () => history.back(),
  };
}

import { useState, useEffect } from 'react';
import {
  createUrlStateController,
  type UrlStateController,
  type UrlStateOptions,
} from '@reelkit/core';

/**
 * Distributes over the union so the synchronous and asynchronous shapes stay
 * separate. A plain `Omit` would collapse them and let a caller pass both a
 * codec and a locator.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** Everything {@link createUrlStateController} takes, minus the parameter name. */
export type UseUrlStateOptions<Id = number> = DistributiveOmit<
  UrlStateOptions<Id>,
  'param'
>;

/**
 * Mirrors a single query parameter into a signal, and writes changes back to
 * the URL. Use it on the trigger side — a thumbnail click writes the
 * parameter, and any overlay bound to the same parameter opens itself.
 *
 * The controller is created once and starts following the URL after mount, so
 * nothing touches `window` during render and the hook is safe to prerender.
 *
 * @param param - Name of the query parameter to mirror.
 * @param options - Adapter, codec, and locator. Pass a router-backed adapter
 * in a routed application, otherwise the router's own location goes stale.
 * Supply a `codec` or `locator` to have `index` derived; without one the hook
 * reports the raw `value` only.
 * @returns The {@link UrlStateController} for this parameter.
 *
 * @example
 * ```tsx
 * const photo = useUrlState('photo');
 *
 * <img onClick={() => photo.set(index)} />
 * <LightboxOverlay urlParam="photo" images={images} />
 * ```
 */
export const useUrlState = <Id = number>(
  param: string,
  options?: UseUrlStateOptions<Id>,
): UrlStateController => {
  const [ctrl] = useState(() =>
    createUrlStateController({
      param,
      ...options,
    } as Parameters<typeof createUrlStateController<Id>>[0]),
  );

  useEffect(() => ctrl.attach(), [ctrl]);

  return ctrl;
};

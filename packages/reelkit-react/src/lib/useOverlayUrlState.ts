import { useState, useEffect, useRef } from 'react';
import {
  createUrlStateController,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/core';

/**
 * Options for {@link useOverlayUrlState}.
 *
 * Two kinds of option live here, with different lifecycles. `param` and
 * `adapter` are routing configuration: read on the first render and fixed for
 * the life of the component, so changing either needs a remount (give the
 * component a `key`). `codec` and `locator` are lookup callbacks: the latest
 * render's values are used for every decode, locate, and write, so a closure
 * over a growing list or a reordered feed is always current.
 *
 * @typeParam Id - The identity `codec` reads out of the parameter. Defaults to a
 * slide index, the shape a plain `?photo=3` gallery uses.
 * @typeParam Pos - The position an identity resolves to. Defaults to a slide
 * index; a stories player resolves to a two-axis `{ outer, inner }` position
 * (`TwoAxisPosition`).
 */
export interface OverlayUrlStateOptions<Id = number, Pos = number> {
  /**
   * Query parameter that carries the active slide, for example `photo`.
   *
   * Fixed on the first render; remount to change it.
   */
  param: string;

  /**
   * Navigation system to read and write through. Defaults to the History API.
   * Pass a router-backed adapter in a routed application, otherwise the router's
   * own location goes stale.
   *
   * Fixed on the first render; remount to change it.
   */
  adapter?: UrlAdapter;

  /**
   * Wire format for the parameter — its text ↔ a stable identity. Pairs with
   * `locator` on a shared `Id`, so build the two together: `urlIndexKey()` for the
   * default `?photo=3` gallery, or a matched codec/locator for a base64 id or a
   * slug so a bookmark survives the gallery being reordered.
   *
   * Read live: each render's codec is the one the next decode or encode uses.
   */
  codec: UrlCodec<Id>;

  /**
   * Where the identity sits in the collection: `locate` (sync), `locateAsync`
   * (async fallback for a paginated feed), and `identify` for writes. Owns its
   * own validity — it is used as-is.
   *
   * Comes paired with `codec`. For a plain index gallery, spread
   * `...urlIndexKey(() => count)`; a paginated or identity-keyed gallery supplies
   * its own matched pair; a two-axis player (a stories feed) spreads
   * `...urlIndexTwoAxisKey(…)`.
   *
   * Read live: each render's locator answers the next lookup, and adding or
   * removing `locateAsync` between renders takes effect on the next miss.
   */
  locator: UrlLocator<Id, Pos>;
}

/**
 * Builds a URL-state controller for an overlay and returns it whole, so the
 * consumer keeps `set`/`position`/`value` for programmatic control and can drive
 * one controller from several places. Hand the returned controller to a
 * `*UrlOverlay` as its `controller` prop.
 *
 * The URL owns the open state: a bound overlay opens itself when the parameter
 * names a slide. Prefer a link as the open action — the href does it with no
 * handler, and the open is then shareable, opens in a new tab, and the back
 * button closes it for free. Writing the parameter with `set` opens it too;
 * `set` is also the low-level write the overlay uses for slide changes, plus
 * `set(null)` to close.
 *
 * Pass the matched `codec` + `locator` pair: spread `...urlIndexKey(() => count)`
 * for a plain index gallery, or a paginated/identity-keyed pair of your own.
 * Overlay-agnostic: a lightbox, a reel player, or a stories player all consume
 * it the same way.
 *
 * The controller is created once and keeps its identity across renders; it
 * starts following the URL after mount, so nothing touches `window` during
 * render and the hook is safe to prerender. The codec and locator it consults
 * are always the ones from the latest render, so a lookup after the list grew
 * or reordered sees the current list rather than the one the first render
 * closed over.
 *
 * @typeParam Id - The identity `codec` reads out of the parameter.
 * @typeParam Pos - The position an identity resolves to.
 * @param options - Parameter and the `codec`/`locator` pair, plus an optional adapter.
 * @returns The {@link UrlStateController} for this parameter.
 */
export const useOverlayUrlState = <Id = number, Pos = number>(
  options: OverlayUrlStateOptions<Id, Pos>,
): UrlStateController<Pos> => {
  // The latest render's callbacks. The controller is built once, so it cannot
  // hold the callbacks themselves — a closure from the first render would
  // keep answering from the list as it was then. It holds forwarders that
  // read through this ref instead.
  const latest = useRef(options);
  latest.current = options;

  const ctrl = useState(() => {
    const codec: UrlCodec<Id> = {
      decode: (raw) => latest.current.codec.decode(raw),
      encode: (id) => latest.current.codec.encode(id),
    };
    const locator: UrlLocator<Id, Pos> = {
      locate: (id) => latest.current.locator.locate(id),
      identify: (position) => latest.current.locator.identify(position),
      // A getter, so the controller sees whether the latest render supplies an
      // asynchronous fallback at all — a fixed property would freeze that
      // choice at the first render.
      get locateAsync() {
        const locateAsync = latest.current.locator.locateAsync;
        return locateAsync && ((id: Id) => locateAsync(id));
      },
    };

    return createUrlStateController<Id, Pos>({
      param: options.param,
      adapter: options.adapter,
      codec,
      locator,
    } as Parameters<typeof createUrlStateController<Id, Pos>>[0]);
  })[0];

  useEffect(() => ctrl.attach(), [ctrl]);

  return ctrl;
};

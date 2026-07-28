import { onMounted, onUnmounted } from 'vue';
import {
  createUrlStateController,
  type Dispose,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/core';

/**
 * Options for {@link useOverlayUrlState}.
 *
 * @typeParam Id - The identity `codec` reads out of the parameter. Defaults to a
 * slide index, the shape a plain `?photo=3` gallery uses.
 */
export interface OverlayUrlStateOptions<Id = number, Pos = number> {
  /** Query parameter that carries the active slide, for example `photo`. */
  param: string;

  /**
   * Navigation system to read and write through. Defaults to the History API.
   * Pass a router-backed adapter in a routed application, otherwise the router's
   * own location goes stale.
   */
  adapter?: UrlAdapter;

  /**
   * Wire format for the parameter — its text ↔ a stable identity. Pairs with
   * `locator` on a shared `Id`, so build the two together: `urlIndexKey()` for the
   * default `?photo=3` gallery, or a matched codec/locator for a base64 id or a
   * slug so a bookmark survives the gallery being reordered.
   */
  codec: UrlCodec<Id>;

  /**
   * Where the identity sits in the collection: `locate` (sync), `locateAsync`
   * (async fallback for a paginated feed), and `identify` for writes. Owns its
   * own validity — it is used as-is.
   *
   * Comes paired with `codec`. For a plain index gallery, spread
   * `...urlIndexKey(() => count)`; a paginated or identity-keyed gallery supplies
   * its own matched pair.
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
 * The returned controller carries the raw core signals; bridge `controller.position`
 * through `toVueRef` before a template reads it. The controller is created once
 * and starts following the URL on mount, so nothing touches `window` during
 * setup and the composable is safe to prerender.
 *
 * @typeParam Id - The identity `codec` reads out of the parameter.
 * @param options - Parameter and the `codec`/`locator` pair, plus an optional adapter.
 * @returns The {@link UrlStateController} for this parameter.
 */
export function useOverlayUrlState<Id = number, Pos = number>(
  options: OverlayUrlStateOptions<Id, Pos>,
): UrlStateController<Pos> {
  const controller = createUrlStateController<Id, Pos>({
    param: options.param,
    adapter: options.adapter,
    codec: options.codec,
    locator: options.locator,
  } as Parameters<typeof createUrlStateController<Id, Pos>>[0]);

  let stop: Dispose | null = null;

  onMounted(() => {
    stop = controller.attach();
  });
  onUnmounted(() => {
    stop?.();
  });

  return controller;
}

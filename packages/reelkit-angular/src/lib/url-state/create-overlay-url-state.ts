import { DestroyRef, inject } from '@angular/core';
import {
  createUrlStateController,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/core';

/**
 * Options for {@link createOverlayUrlState}.
 *
 * @typeParam Id - The identity `codec` reads out of the parameter. Defaults to a
 * slide index, the shape a plain `?photo=3` gallery uses.
 */
export interface OverlayUrlStateOptions<Id = number> {
  /** Query parameter that carries the active slide, for example `photo`. */
  param: string;

  /**
   * Navigation system to read and write through. Defaults to the History API.
   * Pass a Router-backed adapter in a routed application, otherwise the
   * Router's own location goes stale and its next navigation drops the
   * parameter.
   */
  adapter?: UrlAdapter;

  /**
   * Wire format for the parameter — its text ↔ a stable identity. Pairs with
   * `locator` on a shared `Id`, so build the two together: `indexKey()` for the
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
   * `...indexKey(() => count)`; a paginated or identity-keyed gallery supplies
   * its own matched pair.
   */
  locator: UrlLocator<Id>;
}

/**
 * Builds a URL-state controller for an overlay and starts it tracking the
 * address bar. Hand the returned controller to `<rk-lightbox-url-overlay>` as
 * its `controller` input.
 *
 * Returned whole rather than narrowed, so the caller keeps `set`, `index` and
 * `value` for programmatic control and can drive one controller from several
 * places.
 *
 * Call it in an injection context — a field initialiser or a constructor. It
 * attaches immediately and releases through {@link DestroyRef}, so a component
 * destroyed while the overlay is open leaves no listener behind and writes
 * nothing further to the URL.
 *
 * @param options - Parameter name, adapter, and the matched codec/locator pair.
 * @returns The controller, already attached.
 *
 * @example
 * ```ts
 * @Component({ … })
 * export class GalleryComponent {
 *   protected readonly images = signal(photos);
 *
 *   protected readonly photo = createOverlayUrlState({
 *     param: 'photo',
 *     ...indexKey(() => this.images().length),
 *   });
 * }
 * ```
 */
export function createOverlayUrlState<Id = number>(
  options: OverlayUrlStateOptions<Id>,
): UrlStateController {
  const controller = createUrlStateController<Id>({
    param: options.param,
    adapter: options.adapter,
    codec: options.codec,
    locator: options.locator,
  } as Parameters<typeof createUrlStateController<Id>>[0]);

  inject(DestroyRef).onDestroy(controller.attach());

  return controller;
}

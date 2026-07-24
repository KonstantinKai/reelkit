import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  RkLightboxUrlOverlayComponent,
  type LightboxItem,
  type UrlLocator,
} from '@reelkit/angular-lightbox';
import { createOverlayUrlState, indexCodec } from '@reelkit/angular';
import { cdnUrl } from '@reelkit/example-data';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

const _kParam = 'photo';

/** How many images this page pretends to have loaded so far. */
const _kPageSize = 3;

/** Stand-in for the round trip that fetches the next page. */
const _kFetchDelayMs = 900;

const sampleImages: LightboxItem[] = [
  { src: cdnUrl('samples/images/image-01.jpg'), title: 'Mountain River' },
  { src: cdnUrl('samples/images/image-02.jpg'), title: 'Snowy Peaks' },
  { src: cdnUrl('samples/images/image-03.jpg'), title: 'Foggy Forest' },
  { src: cdnUrl('samples/images/image-04.jpg'), title: 'Ocean Waves' },
  { src: cdnUrl('samples/images/image-05.jpg'), title: 'Autumn Path' },
];

/**
 * The lightbox with its open state in the URL: the address bar names the
 * visible slide, the link can be shared, and the back button closes.
 *
 * This application is routed, so the Router drives every read and write — the
 * default History adapter would leave the Router's own location stale.
 */
@Component({
  selector: 'app-image-preview-url-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: `
    <div class="image-gallery-page">
      <div class="gallery-header">
        <h1>URL Gallery</h1>
        <p>
          Every thumbnail is an ordinary link to
          <code>?photo=&lt;index&gt;</code> — open one in a new tab, copy its
          address, or press back to close. Paging through the gallery never
          piles up history entries.
        </p>
        <p>
          Back closes the gallery when you opened it from here — the link pushed
          an entry, so back pops to the grid. A shared link opened directly in a
          fresh tab has no history behind it, so back leaves the site; close
          with the ✕ button or Escape to stay on the grid.
        </p>
        <p>
          Only the first {{ pageSize }} images have loaded. The buttons below
          point past them, the way a shared link into a long feed does — the
          lightbox waits for the image to arrive instead of discarding the
          address.
        </p>
        <div class="transition-selector">
          <!-- A link, so the browser's own behaviour comes free: new tab, copy
               address, hover target, keyboard reach. -->
          <a
            class="transition-btn"
            [routerLink]="[]"
            [queryParams]="{ photo: total - 1 }"
          >
            Open image {{ total }} (link)
          </a>
          <!-- Navigating through the Router. No href, so the browser
               affordances are gone, but the URL still changes and back still
               closes. -->
          <button
            type="button"
            class="transition-btn"
            (click)="openViaRouter()"
          >
            Open image {{ total }} (router)
          </button>
          <!-- Straight through the controller. The adapter routes the write, so
               this lands in the same place — the difference is that the open
               started in code rather than from something the user could copy. -->
          <button
            type="button"
            class="transition-btn"
            (click)="photo.set(total - 1)"
          >
            Open image {{ total }} (controller.set)
          </button>
          @if (fetching()) {
            <span>Loading photo…</span>
          }
        </div>
      </div>

      <div class="gallery-grid">
        @for (image of loaded(); track image.src; let i = $index) {
          <a
            class="gallery-item"
            [routerLink]="[]"
            [queryParams]="{ photo: i }"
          >
            <img [src]="image.src" [alt]="image.title ?? ''" loading="lazy" />
            @if (image.title) {
              <div class="gallery-item-overlay">
                <span class="gallery-item-title">{{ image.title }}</span>
              </div>
            }
          </a>
        }
      </div>
    </div>

    <rk-lightbox-url-overlay [controller]="photo" [items]="loaded()" />
  `,
  // The gallery family shares one stylesheet — image-preview-video already
  // points here. A bespoke copy would drift the moment the family restyles.
  styleUrls: ['../image-preview/image-preview-page.css'],
})
export class ImagePreviewUrlPageComponent {
  private readonly _router = inject(Router);

  protected readonly pageSize = _kPageSize;
  protected readonly total = sampleImages.length;

  // Only part of the gallery has "arrived" — the rest stands in for pages this
  // feed has not fetched yet.
  protected readonly loaded = signal(sampleImages.slice(0, _kPageSize));
  protected readonly fetching = signal(false);

  // The parameter is a plain index, so the identity is the index. The locator
  // windows it: `locate` answers only for what has loaded, `locateAsync`
  // fetches the rest. A supplied locator owns its own validity, so `locate`
  // rejects anything outside the loaded window itself.
  private readonly _locator: UrlLocator<number> = {
    locate: (index) =>
      index >= 0 && index < this.loaded().length ? index : null,
    identify: (index) => index,
    locateAsync: async (index) => {
      // Nothing left to fetch: this link names an image the feed does not have.
      if (index < 0 || index >= sampleImages.length) return null;

      this.fetching.set(true);
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      this.loaded.set(sampleImages.slice(0, index + 1));
      this.fetching.set(false);

      // The index the fetch just established — the lightbox takes it as-is,
      // never re-reading `loaded`, which has not re-rendered yet.
      return index;
    },
  };

  protected openViaRouter(): void {
    void this._router.navigate([], {
      queryParams: { [_kParam]: this.total - 1 },
    });
  }

  // Built here rather than inside the overlay, so `photo.set` stays on hand
  // for programmatic control.
  protected readonly photo = createOverlayUrlState({
    param: _kParam,
    adapter: createRouterUrlAdapter(),
    codec: indexCodec,
    locator: this._locator,
  });
}

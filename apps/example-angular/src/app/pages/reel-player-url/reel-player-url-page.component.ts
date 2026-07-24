import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
  type UrlLocator,
} from '@reelkit/angular-reel-player';
import { createOverlayUrlState, indexCodec } from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import { generateContent, getThumbnail } from '../../data/mock-content';

const _kParam = 'reel';

/** How many posts this page pretends to have loaded so far. */
const _kPageSize = 6;

/** Stand-in for the round trip that fetches the next page. */
const _kFetchDelayMs = 900;

/** The full feed, generated once so the windowed locator has a stable target. */
const feed: ContentItem[] = generateContent(24);

/**
 * The reel player with its open state in the URL: the address bar names the
 * playing slide, the link can be shared, and the back button closes.
 *
 * This application is routed, so the Router drives every read and write — the
 * default History adapter would leave the Router's own location stale.
 */
@Component({
  selector: 'app-reel-player-url-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkReelPlayerUrlOverlayComponent, RouterLink],
  template: `
    <div
      style="
        min-height: 100dvh;
        background-color: #111;
        padding: 56px 16px 16px;
      "
    >
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1
          style="
            color: #fff;
            font-size: 1.5rem;
            margin-bottom: 16px;
            font-weight: 500;
          "
        >
          URL Reel Player
        </h1>
        <p
          style="
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-bottom: 12px;
          "
        >
          Every thumbnail is an ordinary link to
          <code>?reel=&lt;index&gt;</code> — open one in a new tab, copy its
          address, or press back to close. Paging the feed never piles up
          history entries, so one back step always leaves the player.
        </p>
        <p
          style="
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-bottom: 12px;
          "
        >
          Only the first {{ pageSize }} posts have loaded. The buttons below
          point past them, the way a shared link into a long feed does — the
          player waits for the post to arrive instead of discarding the address.
        </p>

        <div
          style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            margin: 24px 0 32px;
          "
        >
          <a
            [routerLink]="[]"
            [queryParams]="{ reel: total - 1 }"
            style="
              padding: 8px 16px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 8px;
              background: rgba(255,255,255,0.05);
              color: #fff;
              font-size: 0.85rem;
              text-decoration: none;
            "
          >
            Open post {{ total }} (link)
          </a>
          <button
            type="button"
            (click)="openViaRouter()"
            style="
              padding: 8px 16px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 8px;
              background: rgba(255,255,255,0.05);
              color: #fff;
              font-size: 0.85rem;
              cursor: pointer;
            "
          >
            Open post {{ total }} (router)
          </button>
          <button
            type="button"
            (click)="reel.set(total - 1)"
            style="
              padding: 8px 16px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 8px;
              background: rgba(255,255,255,0.05);
              color: #fff;
              font-size: 0.85rem;
              cursor: pointer;
            "
          >
            Open post {{ total }} (controller.set)
          </button>
          @if (fetching()) {
            <span style="color: rgba(255,255,255,0.6);">Loading post…</span>
          }
        </div>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
          "
        >
          @for (item of loaded(); track item.id; let index = $index) {
            <a
              [routerLink]="[]"
              [queryParams]="{ reel: index }"
              style="
                position: relative;
                display: block;
                aspect-ratio: 9 / 16;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                background-color: #222;
              "
            >
              <img
                [src]="getThumbnail(item)"
                alt=""
                style="width: 100%; height: 100%; object-fit: cover;"
                loading="lazy"
              />

              @if (hasVideo(item)) {
                <div
                  style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background-color: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              }

              @if (isMulti(item)) {
                <div
                  style="
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background-color: rgba(0,0,0,0.6);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 500;
                  "
                >
                  {{ item.media.length }}
                </div>
              }

              <div
                style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  padding: 32px 8px 8px;
                  background: linear-gradient(transparent, rgba(0,0,0,0.8));
                "
              >
                <div style="display: flex; align-items: center; gap: 6px;">
                  <img
                    [src]="item.author.avatar"
                    alt=""
                    style="
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      object-fit: cover;
                    "
                  />
                  <span
                    style="
                      color: #fff;
                      font-size: 0.7rem;
                      font-weight: 500;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ item.author.name }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      </div>

      <rk-reel-player-url-overlay [controller]="reel" [content]="loaded()" />
    </div>
  `,
})
export class ReelPlayerUrlPageComponent {
  private readonly _router = inject(Router);

  protected readonly pageSize = _kPageSize;
  protected readonly total = feed.length;

  protected readonly getThumbnail = getThumbnail;

  // Only part of the feed has "arrived"; the rest stands in for pages not yet
  // fetched.
  protected readonly loaded = signal(feed.slice(0, _kPageSize));
  protected readonly fetching = signal(false);

  // A plain index feed, so the identity is the index. The locator windows it:
  // `locate` answers only for the loaded window, `locateAsync` fetches the rest
  // so a deep link into an unloaded post still opens.
  private readonly _locator: UrlLocator<number> = {
    locate: (index) =>
      index >= 0 && index < this.loaded().length ? index : null,
    identify: (index) => index,
    locateAsync: async (index) => {
      if (index < 0 || index >= feed.length) return null;

      this.fetching.set(true);
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      this.loaded.set(feed.slice(0, index + 1));
      this.fetching.set(false);

      return index;
    },
  };

  protected hasVideo(item: ContentItem): boolean {
    return item.media.some((m) => m.type === 'video');
  }

  protected isMulti(item: ContentItem): boolean {
    return item.media.length > 1;
  }

  protected openViaRouter(): void {
    void this._router.navigate([], {
      queryParams: { [_kParam]: this.total - 1 },
    });
  }

  protected readonly reel = createOverlayUrlState({
    param: _kParam,
    adapter: createRouterUrlAdapter(),
    codec: indexCodec,
    locator: this._locator,
  });
}

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  inject,
  input,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import {
  createOverlayUrlState,
  indexCodec,
  urlStableIdKey,
  base64UrlCodec,
  urlIndexTwoAxisKey,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type TwoAxisPosition,
} from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import { getThumbnail } from '../../data/mock-content';

type Addressing = 'index' | 'stableId';
type Axis = 'one' | 'two';
type InnerKey = 'index' | 'stableId';

const _kParam = 'reel';
const _kPageSize = 6;
const _kFetchDelayMs = 900;

/** The wide key shape the four built-ins collapse to for this demo. */
type ReelKey = UrlKey<number | string, number | TwoAxisPosition>;

/**
 * One key shape of the reel URL demo. The parent remounts this component when a
 * switch changes the key shape (a fresh `createOverlayUrlState` is needed per
 * key), so every field here is built once for a fixed set of inputs.
 */
@Component({
  selector: 'app-reel-url-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkReelPlayerUrlOverlayComponent, RouterLink],
  template: `
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin: 0 0 24px;
      "
    >
      <a
        [routerLink]="[]"
        [queryParams]="{ reel: wireFor(last, 0) }"
        style="
          padding: 8px 14px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 0.85rem;
          text-decoration: none;
        "
      >
        Open post {{ total }} (link, past the window)
      </a>
      <button
        type="button"
        (click)="openLast()"
        style="
          padding: 8px 14px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
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
        <div>
          <a
            [routerLink]="[]"
            [queryParams]="{ reel: wireFor(index, 0) }"
            [attr.aria-label]="'Open post ' + (index + 1)"
            style="
              position: relative;
              display: block;
              aspect-ratio: 9 / 16;
              border-radius: 12px;
              overflow: hidden;
              cursor: pointer;
              background-color: #000;
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
          </a>

          @if (axis() === 'two' && item.media.length > 1) {
            <div
              style="
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 6px;
              "
            >
              @for (m of item.media; track m.id; let inner = $index) {
                <a
                  [routerLink]="[]"
                  [queryParams]="{ reel: wireFor(index, inner) }"
                  style="
                    padding: 2px 8px;
                    border-radius: 999px;
                    border: 1px solid rgba(255,255,255,0.25);
                    background: rgba(0,0,0,0.55);
                    color: #fff;
                    font-size: 0.7rem;
                    text-decoration: none;
                  "
                >
                  {{ index }}.{{ inner }}
                </a>
              }
            </div>
          }
        </div>
      }
    </div>

    <rk-reel-player-url-overlay [controller]="reel" [content]="loaded()" />
  `,
})
export class ReelUrlDemoComponent implements OnInit {
  readonly feed = input.required<ContentItem[]>();
  readonly addressing = input.required<Addressing>();
  readonly axis = input.required<Axis>();
  readonly innerKey = input.required<InnerKey>();
  readonly hash = input.required<boolean>();

  private readonly _injector = inject(Injector);

  protected readonly getThumbnail = getThumbnail;
  protected readonly loaded = signal<ContentItem[]>([]);
  protected readonly fetching = signal(false);

  protected total = 0;
  protected last = 0;

  protected reel!:
    | UrlStateController<number>
    | UrlStateController<TwoAxisPosition>;

  private _encodeOuter!: (index: number) => string;
  private _encodeInner!: (index: number, inner: number) => string;

  ngOnInit(): void {
    const feed = this.feed();
    const addressing = this.addressing();
    const axis = this.axis();
    const innerIsId = axis === 'two' && this.innerKey() === 'stableId';

    this.total = feed.length;
    this.last = feed.length - 1;
    this.loaded.set(feed.slice(0, _kPageSize));

    // One id codec for whichever axes are id-addressed — items-independent, so
    // pairing it with a paging (or inner) locator is fair game. A base64url
    // `hashCodec` obscures the id on the wire; omit it to keep the id raw.
    const idCodec = urlStableIdKey({
      items: () => [],
      hashCodec: this.hash() ? base64UrlCodec : undefined,
    }).codec as UrlCodec<number | string>;
    const outerCodec = (
      addressing === 'index' ? indexCodec : idCodec
    ) as UrlCodec<number | string>;

    const pageTo = async (index: number) => {
      this.fetching.set(true);
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      this.loaded.set(feed.slice(0, index + 1));
      this.fetching.set(false);
      return index;
    };

    // Both outer locators window `loaded` and page the rest in on a miss. The
    // index locator names a position; the id locator scans the full feed for
    // the shared id — a link can only name an id the feed will eventually hold.
    const indexLocator: UrlLocator<number> = {
      locate: (i) => (i >= 0 && i < this.loaded().length ? i : null),
      identify: (i) => i,
      locateAsync: (i) =>
        i < 0 || i >= feed.length ? Promise.resolve(null) : pageTo(i),
    };
    const idLocator: UrlLocator<string> = {
      locate: (id) => {
        const i = this.loaded().findIndex((x) => x.id === id);
        return i === -1 ? null : i;
      },
      identify: (i) => this.loaded()[i].id,
      locateAsync: (id) => {
        const i = feed.findIndex((x) => x.id === id);
        return i === -1 ? Promise.resolve(null) : pageTo(i);
      },
    };
    const outerLocator = (
      addressing === 'index' ? indexLocator : idLocator
    ) as UrlLocator<number | string>;

    // The inner axis is index by default; opt into ids by scanning the outer
    // slot's media for a matching id. `innerLocate` receives the resolved outer
    // index, so it scans the right post's media.
    const innerOptions = innerIsId
      ? {
          innerCodec: idCodec,
          innerLocate: (outerIndex: number, id: number | string) => {
            const post = this.loaded()[outerIndex];
            if (!post) return null;
            const i = post.media.findIndex((m) => m.id === id);
            return i === -1 ? null : i;
          },
          innerIdentify: (outerIndex: number, i: number): number | string =>
            this.loaded()[outerIndex].media[i].id,
        }
      : {};

    // The conditional-type guard wants concrete axis identities; this demo picks
    // them at runtime, so build the key through a widened call.
    const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
      options: unknown,
    ) => ReelKey;
    const key: ReelKey =
      axis === 'one'
        ? ({ codec: outerCodec, locator: outerLocator } as ReelKey)
        : buildTwoAxis({
            outerCodec,
            outerLocator,
            outerCount: () => this.loaded().length,
            innerCounts: () => this.loaded().map((item) => item.media.length),
            ...innerOptions,
          });

    // Exact wire value for each axis, straight from the active codec. `feed`
    // holds every id, so a deep link past the window can still be spelled.
    this._encodeOuter = (index) =>
      outerCodec.encode(addressing === 'index' ? index : feed[index].id);
    this._encodeInner = (index, inner) =>
      innerIsId ? idCodec.encode(feed[index].media[inner].id) : String(inner);

    // createOverlayUrlState and the router adapter both need an injection
    // context; ngOnInit does not run in one, so borrow the component's.
    this.reel = runInInjectionContext(this._injector, () =>
      createOverlayUrlState<number | string, number | TwoAxisPosition>({
        param: _kParam,
        adapter: createRouterUrlAdapter(),
        ...key,
      }),
    ) as UrlStateController<number> | UrlStateController<TwoAxisPosition>;
  }

  protected wireFor(index: number, inner: number): string {
    return this.axis() === 'two'
      ? `${this._encodeOuter(index)}.${this._encodeInner(index, inner)}`
      : this._encodeOuter(index);
  }

  protected hasVideo(item: ContentItem): boolean {
    return item.media.some((m) => m.type === 'video');
  }

  protected openLast(): void {
    // Pass the raw wire string: `set` writes it verbatim, so it works even for a
    // post past the window whose id `identify` could not yet read.
    (this.reel as UrlStateController<number>).set(this.wireFor(this.last, 0));
  }
}

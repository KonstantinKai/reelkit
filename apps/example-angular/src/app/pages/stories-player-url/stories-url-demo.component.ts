import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  type OnInit,
  inject,
  input,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  RkStoriesRingListComponent,
  RkStoriesUrlOverlayComponent,
  createStoriesViewedStateController,
  type DesktopLayout,
  type StoriesGroup,
  type StoriesViewedStateController,
  type StoryItem,
} from '@reelkit/angular-stories-player';
import {
  base64UrlCodec,
  createOverlayUrlState,
  indexCodec,
  urlIndexTwoAxisKey,
  urlStableIdKey,
  type TwoAxisIdentity,
  type TwoAxisPosition,
  type UrlCodec,
  type UrlKey,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

/** How the URL addresses the group axis. */
export type Addressing = 'index' | 'stableId';

/** How the URL addresses the inner (story) axis. */
export type InnerKey = 'index' | 'stableId';

const _kParam = 'story';
const _kFetchDelayMs = 600;

const _kButtonStyle =
  'padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: #fff; font-size: 0.85rem; text-decoration: none; cursor: pointer;';

/**
 * One key shape of the stories URL demo. The page remounts this component when
 * a switch changes the key, because `createOverlayUrlState` builds its
 * controller once — so every field here is built for a fixed set of inputs.
 */
@Component({
  selector: 'app-stories-url-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RkStoriesRingListComponent,
    RkStoriesUrlOverlayComponent,
  ],
  template: `
    <div
      style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 28px;"
    >
      <a
        [routerLink]="[]"
        [queryParams]="{ story: wireFor(last, 0) }"
        [style]="buttonStyle"
      >
        Open group {{ total }} (link, past the window)
      </a>
      <button type="button" [style]="buttonStyle" (click)="openLastByRouter()">
        Open group {{ total }} (router)
      </button>
      <button type="button" [style]="buttonStyle" (click)="openLastBySet()">
        Open group {{ total }} (controller.set)
      </button>
      <!-- Seen state outlives the page, so without this the rings fill up once
           and the demo can never be watched a second time. It clears the store
           for the switch combination on screen, which is the one key the
           controller below holds. -->
      <button
        type="button"
        [style]="buttonStyle + ' margin-left: auto;'"
        (click)="viewed.forget()"
      >
        clear seen
      </button>
      @if (fetching()) {
        <span style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">
          Loading group…
        </span>
      }
    </div>

    <rk-stories-ring-list
      [groups]="loaded()"
      [viewed]="rememberSeen() ? viewed : undefined"
      (selected)="openGroup($event)"
    />

    <rk-stories-url-overlay
      [controller]="stories"
      [groups]="loaded()"
      [desktopLayout]="desktopLayout()"
      [viewed]="rememberSeen() ? viewed : undefined"
    />
  `,
})
export class StoriesUrlDemoComponent implements OnInit {
  readonly feed = input.required<StoriesGroup<StoryItem>[]>();
  readonly pageSize = input.required<number>();
  readonly addressing = input.required<Addressing>();
  readonly innerKey = input.required<InnerKey>();
  readonly hash = input.required<boolean>();
  readonly rememberSeen = input.required<boolean>();
  readonly desktopLayout = input.required<DesktopLayout>();

  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);

  protected readonly buttonStyle = _kButtonStyle;
  protected readonly loaded = signal<StoriesGroup<StoryItem>[]>([]);
  protected readonly fetching = signal(false);

  protected total = 0;
  protected last = 0;

  protected stories!: UrlStateController<TwoAxisPosition>;
  protected viewed!: StoriesViewedStateController;

  private _encodeGroup!: (groupIndex: number) => string;
  private _encodeStory!: (groupIndex: number, storyIndex: number) => string;

  ngOnInit(): void {
    const feed = this.feed();
    const addressing = this.addressing();
    const innerIsId = this.innerKey() === 'stableId';

    this.total = feed.length;
    this.last = feed.length - 1;
    this.loaded.set(feed.slice(0, this.pageSize()));

    // One id codec for whichever axes are id-addressed — group by author id,
    // story by story id. Items-independent, so it pairs with a paging locator.
    const idCodec = urlStableIdKey({
      items: () => [],
      hashCodec: this.hash() ? base64UrlCodec : undefined,
    }).codec as UrlCodec<number | string>;
    const outerCodec = (
      addressing === 'index' ? indexCodec : idCodec
    ) as UrlCodec<number | string>;

    const pageTo = async (index: number): Promise<number> => {
      this.fetching.set(true);
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      this.loaded.set(feed.slice(0, index + 1));
      this.fetching.set(false);
      return index;
    };

    // Both outer locators window `loaded` and page the rest in on a miss: a
    // link past the window resolves before the player opens on it.
    const indexLocator: UrlLocator<number> = {
      locate: (i) => (i >= 0 && i < this.loaded().length ? i : null),
      identify: (i) => i,
      locateAsync: (i) =>
        i < 0 || i >= feed.length ? Promise.resolve(null) : pageTo(i),
    };
    const idLocator: UrlLocator<string> = {
      locate: (id) => {
        const i = this.loaded().findIndex((g) => g.author.id === id);
        return i === -1 ? null : i;
      },
      identify: (i) => this.loaded()[i].author.id,
      locateAsync: (id) => {
        const i = feed.findIndex((g) => g.author.id === id);
        return i === -1 ? Promise.resolve(null) : pageTo(i);
      },
    };
    const outerLocator = (
      addressing === 'index' ? indexLocator : idLocator
    ) as UrlLocator<number | string>;

    // The story axis is an index by default; opt into ids by scanning the
    // resolved group's stories for a matching id.
    const innerOptions = innerIsId
      ? {
          innerCodec: idCodec,
          innerLocate: (outerIndex: number, id: number | string) => {
            const group = this.loaded()[outerIndex];
            if (!group) return null;
            const i = group.stories.findIndex((story) => story.id === id);
            return i === -1 ? null : i;
          },
          innerIdentify: (outerIndex: number, i: number): number | string =>
            this.loaded()[outerIndex].stories[i].id,
        }
      : {};

    // The conditional-type guard wants concrete axis identities; this demo
    // picks them at runtime, so build the key through a widened call.
    const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
      options: unknown,
    ) => UrlKey<TwoAxisIdentity<unknown, unknown>, TwoAxisPosition>;
    const key = buildTwoAxis({
      outerCodec,
      outerLocator,
      outerCount: () => this.loaded().length,
      innerCounts: () => this.loaded().map((group) => group.stories.length),
      ...innerOptions,
    });

    // Exact wire per axis, from the active codec. The full feed holds every id,
    // so a deep link past the loaded window can still be spelled.
    this._encodeGroup = (groupIndex) =>
      outerCodec.encode(
        addressing === 'index' ? groupIndex : feed[groupIndex].author.id,
      );
    this._encodeStory = (groupIndex, storyIndex) =>
      innerIsId
        ? idCodec.encode(feed[groupIndex].stories[storyIndex].id)
        : String(storyIndex);

    // The same key drives the address bar and what is remembered, so a stored
    // entry reads exactly like the parameter of a shared link. The wire shape
    // changes with the switches, so the storage key carries it too — index
    // entries read back under id addressing would name nothing.
    this.viewed = createStoriesViewedStateController({
      storageKey: `reelkit-stories-url-seen-${addressing}.${this.innerKey()}${
        this.hash() ? '.hash' : ''
      }`,
      key,
      groups: () => this.loaded(),
    });

    // Both the controller and the router adapter need an injection context,
    // and ngOnInit does not run in one, so borrow the component's.
    this.stories = runInInjectionContext(this._injector, () =>
      createOverlayUrlState({
        param: _kParam,
        adapter: createRouterUrlAdapter(),
        ...key,
      }),
    ) as UrlStateController<TwoAxisPosition>;
  }

  /** The parameter value for a group, at the story it would open on. */
  protected wireFor(groupIndex: number, storyIndex: number): string {
    return `${this._encodeGroup(groupIndex)}.${this._encodeStory(
      groupIndex,
      storyIndex,
    )}`;
  }

  protected openGroup(groupIndex: number): void {
    const storyIndex = this.rememberSeen()
      ? this.viewed.resumeStoryIndex(groupIndex)
      : 0;
    void this._router.navigate([], {
      queryParams: { [_kParam]: this.wireFor(groupIndex, storyIndex) },
    });
  }

  protected openLastByRouter(): void {
    void this._router.navigate([], {
      queryParams: { [_kParam]: this.wireFor(this.last, 0) },
    });
  }

  protected openLastBySet(): void {
    // The raw wire string: `set` writes it verbatim, so it works even for a
    // group past the window whose id `identify` could not yet read.
    this.stories.set(this.wireFor(this.last, 0));
  }
}

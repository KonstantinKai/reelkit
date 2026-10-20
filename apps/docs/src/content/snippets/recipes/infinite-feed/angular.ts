import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  ReelComponent,
  RkReelItemDirective,
  type ReelApi,
} from '@reelkit/angular';
import { fetchPosts, type Post } from './api';

// Start fetching this many slides before the end, so the next page is usually
// in place before the viewer gets there.
const kLoadAhead = 3;

@Component({
  selector: 'app-infinite-feed',
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <!--
      One slide past the posts shows the loading or error state. Arrow keys
      are heard window-wide and the wheel would hold the page's scroll. This
      feed sits inside a page, so both stay off and the buttons step through
      it; turn them on when the feed fills the screen.
    -->
    <rk-reel
      [count]="posts().length + 1"
      style="width: 100%; height: 100%"
      direction="vertical"
      [enableNavKeys]="false"
      [keyExtractor]="keyOf"
      (apiReady)="reel = $event"
      (afterChange)="loadNearEnd($event.index)"
    >
      <ng-template rkReelItem let-i let-size="size">
        @if (posts()[i]; as post) {
          <div
            [style.width.px]="size[0]"
            [style.height.px]="size[1]"
            style="position: relative"
          >
            <img
              [src]="post.image"
              alt=""
              style="width: 100%; height: 100%; object-fit: cover"
            />
            <h2 class="title">{{ post.title }}</h2>
          </div>
        } @else {
          <div
            [style.width.px]="size[0]"
            [style.height.px]="size[1]"
            style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #fff"
          >
            @if (status() === 'error') {
              <p style="margin: 0">The feed could not be loaded.</p>
              <button type="button" class="retry" (click)="load()">Retry</button>
            } @else {
              <p style="margin: 0">Loading…</p>
            }
          </div>
        }
      </ng-template>

      <div class="nav">
        <button type="button" class="nav-button" aria-label="Previous post" (click)="reel?.prev()">↑</button>
        <button type="button" class="nav-button" aria-label="Next post" (click)="reel?.next()">↓</button>
      </div>
    </rk-reel>
  `,
  styles: `
    /* Text laid over a photo needs its own backdrop to stay readable on a light one. */
    .title {
      position: absolute;
      left: 16px;
      bottom: 16px;
      margin: 0;
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 18px;
    }

    .nav {
      position: absolute;
      right: 16px;
      bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1;
    }

    .retry {
      padding: 6px 14px;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }

    .nav-button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
  `,
})
export class InfiniteFeedComponent implements OnInit, OnDestroy {
  protected readonly posts = signal<Post[]>([]);
  protected readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  protected reel: ReelApi | null = null;
  private _nextPage = 0;
  private _request: AbortController | null = null;

  protected readonly keyOf = (index: number) =>
    this.posts()[index]?.id ?? 'status';

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this._request?.abort();
  }

  protected load() {
    if (this.status() === 'loading') return;
    const current = new AbortController();
    this._request = current;
    this.status.set('loading');

    fetchPosts(this._nextPage, current.signal).then(
      (page) => {
        this._nextPage += 1;
        // Only three slides are ever mounted, so an image further down is
        // fetched now and comes from the cache when its slide mounts.
        for (const post of page) new Image().src = post.image;
        this.posts.update((posts) => [...posts, ...page]);
        this.status.set('idle');
      },
      () => {
        if (!current.signal.aborted) this.status.set('error');
      },
    );
  }

  protected loadNearEnd(index: number) {
    // A failed page waits for Retry, so swiping back and forth does not fire
    // a request each time.
    if (this.status() === 'idle' && index >= this.posts().length - kLoadAhead) {
      this.load();
    }
  }
}

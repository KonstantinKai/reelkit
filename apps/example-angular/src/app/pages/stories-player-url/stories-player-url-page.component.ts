import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import type {
  ChromePlacement,
  DesktopLayout,
  StoriesGroup,
  StoryItem,
} from '@reelkit/angular-stories-player';
import { cdnUrl } from '@reelkit/example-data';
import { persistedSignal } from '../../util/persisted-signal';
import {
  StoriesUrlDemoComponent,
  type Addressing,
  type InnerKey,
} from './stories-url-demo.component';

/** How many groups the demo pretends to have loaded so far. */
const _kPageSize = 3;

const _kNames = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
];

/** The full feed, generated once so a switch never regenerates it. */
const feed: StoriesGroup<StoryItem>[] = _kNames.map((name, i) => ({
  author: {
    id: `user-${i}`,
    name,
    avatar: cdnUrl(
      `samples/avatars/avatar-${String(6 + i).padStart(2, '0')}.jpg`,
    ),
    verified: i % 3 === 0,
  },
  stories: Array.from({ length: 2 + (i % 3) }, (_, j) => ({
    id: `story-${i}-${j}`,
    mediaType: 'image' as const,
    src: cdnUrl(
      `samples/images/stories/story-${String(((i * 10 + j) % 100) + 1).padStart(3, '0')}.jpg`,
    ),
    createdAt: new Date(Date.now() - (i * 3 + j) * 3600_000).toISOString(),
  })),
}));

/**
 * The stories player with its open state in the URL, switchable across every
 * key shape so one page shows them all: each axis by index or by stable id,
 * with or without base64url hashing. The switches rebuild the URL key, so the
 * address bar changes shape while the player stays the same.
 */
@Component({
  selector: 'app-stories-player-url-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StoriesUrlDemoComponent],
  template: `
    <div
      style="min-height: 100dvh; background-color: #111; padding: 56px 16px 16px;"
    >
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1
          style="color: #fff; font-size: 1.5rem; margin-bottom: 16px; font-weight: 500;"
        >
          URL Stories Player
        </h1>
        <p
          style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 20px;"
        >
          The open group and story live in one
          <code>?story=&lt;group&gt;.&lt;story&gt;</code> parameter. Tapping a
          ring opens that user; swiping only replaces the entry, so one back
          step always closes. The switches rebuild the group half of the URL
          key. Only the first {{ pageSize }} groups have loaded — a link past
          them pages the rest in first.
        </p>

        <div
          style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;"
        >
          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Group addressing
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(addressing() === 'index')"
                (click)="addressing.set('index')"
              >
                Index — 2.…
              </button>
              <button
                type="button"
                [style]="segStyle(addressing() === 'stableId')"
                (click)="addressing.set('stableId')"
              >
                Stable id — user-2.…
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Story addressing
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(innerKey() === 'index')"
                (click)="innerKey.set('index')"
              >
                Index — .0
              </button>
              <button
                type="button"
                [style]="segStyle(innerKey() === 'stableId')"
                (click)="innerKey.set('stableId')"
              >
                Stable id — .story-2-0
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Hash (stable id)
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [disabled]="!hashable()"
                [style]="segStyle(hashable() && !hash(), !hashable())"
                (click)="hash.set(false)"
              >
                Raw
              </button>
              <button
                type="button"
                [disabled]="!hashable()"
                [style]="segStyle(hashable() && hash(), !hashable())"
                (click)="hash.set(true)"
              >
                base64url
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Remember seen
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(rememberSeen())"
                (click)="rememberSeen.set(true)"
              >
                On
              </button>
              <button
                type="button"
                [style]="segStyle(!rememberSeen())"
                (click)="rememberSeen.set(false)"
              >
                Off
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Desktop layout
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(desktopLayout() === 'single')"
                (click)="desktopLayout.set('single')"
              >
                Single
              </button>
              <button
                type="button"
                [style]="segStyle(desktopLayout() === 'carousel')"
                (click)="desktopLayout.set('carousel')"
              >
                Carousel
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Progress &amp; header
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(chromePlacement() === 'overlay')"
                (click)="chromePlacement.set('overlay')"
              >
                Overlay
              </button>
              <button
                type="button"
                [style]="segStyle(chromePlacement() === 'group')"
                (click)="chromePlacement.set('group')"
              >
                Group
              </button>
            </div>
          </fieldset>
        </div>

        <!-- Remount when the key shape changes: createOverlayUrlState builds
             its controller once, so a fresh key needs a fresh instance.
             Tracking the key string makes @for tear the demo down and rebuild
             it, and the stale parameter then self-heals. -->
        @for (shape of [demoKey()]; track shape) {
          <app-stories-url-demo
            [feed]="feed"
            [pageSize]="pageSize"
            [addressing]="addressing()"
            [innerKey]="innerKey()"
            [hash]="hash()"
            [rememberSeen]="rememberSeen()"
            [desktopLayout]="desktopLayout()"
            [chromePlacement]="chromePlacement()"
          />
        }
      </div>
    </div>
  `,
})
export class StoriesPlayerUrlPageComponent {
  protected readonly feed = feed;
  protected readonly pageSize = _kPageSize;

  protected readonly addressing = persistedSignal<Addressing>(
    'reelkit-stories-player-url-addressing',
    'index',
  );
  protected readonly innerKey = persistedSignal<InnerKey>(
    'reelkit-stories-player-url-inner-key',
    'index',
  );
  protected readonly hash = persistedSignal(
    'reelkit-stories-player-url-hash',
    false,
  );
  protected readonly rememberSeen = persistedSignal(
    'reelkit-stories-player-url-remember-seen',
    true,
  );
  protected readonly desktopLayout = persistedSignal<DesktopLayout>(
    'reelkit-stories-player-url-desktop-layout',
    'single',
  );
  protected readonly chromePlacement = persistedSignal<ChromePlacement>(
    'reelkit-stories-player-url-chrome-placement',
    'overlay',
  );

  /** Hashing only means anything once an axis is addressed by id. */
  protected readonly hashable = computed(
    () => this.addressing() === 'stableId' || this.innerKey() === 'stableId',
  );

  protected readonly demoKey = computed(
    () =>
      `${this.addressing()}.${this.innerKey()}.${this.hash() ? 'hash' : 'raw'}`,
  );

  protected segStyle(active: boolean, disabled = false): string {
    const background = active
      ? 'rgba(99,102,241,0.55)'
      : 'rgba(255,255,255,0.06)';
    const color = disabled ? 'rgba(255,255,255,0.3)' : '#fff';
    const cursor = disabled ? 'not-allowed' : 'pointer';
    return `padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: ${background}; color: ${color}; font-size: 0.8rem; cursor: ${cursor};`;
  }
}

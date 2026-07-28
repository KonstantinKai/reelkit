import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { type ContentItem } from '@reelkit/angular-reel-player';
import { generateContent } from '../../data/mock-content';
import { persistedSignal } from '../../util/persisted-signal';
import { ReelUrlDemoComponent } from './reel-url-demo.component';

type Addressing = 'index' | 'stableId';
type Axis = 'one' | 'two';
type InnerKey = 'index' | 'stableId';

/** How many posts the demo pretends to have loaded so far. */
const _kPageSize = 6;

/** The full feed, generated once so a switch never regenerates it. */
const feed: ContentItem[] = generateContent(24);

/**
 * The reel player with its open state in the URL, switchable across every
 * built-in key shape so one page shows them all: index versus stable id, one
 * versus two axis (post plus a multi-media carousel's inner index), stable-id
 * inner key, and base64url hashing. The switches rebuild the URL key, so the
 * address bar changes shape while the player stays the same.
 */
@Component({
  selector: 'app-reel-player-url-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReelUrlDemoComponent],
  template: `
    <div
      style="min-height: 100dvh; background-color: #111; padding: 56px 16px 16px;"
    >
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1
          style="color: #fff; font-size: 1.5rem; margin-bottom: 16px; font-weight: 500;"
        >
          URL Reel Player
        </h1>
        <p
          style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 20px;"
        >
          Every thumbnail is an ordinary link — open one in a new tab, copy its
          address, or press back to close. The switches rebuild the URL key, so
          the address bar changes shape while the player stays the same. Only
          the first {{ pageSize }} posts have loaded; the buttons point past
          them, so a shared link pages the rest in through the locator before it
          opens.
        </p>

        <div
          style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;"
        >
          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Addressing
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(addressing() === 'index')"
                (click)="addressing.set('index')"
              >
                Index — ?reel=3
              </button>
              <button
                type="button"
                [style]="segStyle(addressing() === 'stableId')"
                (click)="addressing.set('stableId')"
              >
                Stable id — ?reel=&lt;id&gt;
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Axis
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [style]="segStyle(axis() === 'one')"
                (click)="axis.set('one')"
              >
                One — post
              </button>
              <button
                type="button"
                [style]="segStyle(axis() === 'two')"
                (click)="axis.set('two')"
              >
                Two — post.media
              </button>
            </div>
          </fieldset>

          <fieldset style="border: 0; padding: 0; margin: 0;">
            <legend
              style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px;"
            >
              Inner key (2-axis)
            </legend>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                [disabled]="!innerSwitchable()"
                [style]="
                  segStyle(
                    innerSwitchable() && innerKey() === 'index',
                    !innerSwitchable()
                  )
                "
                (click)="innerKey.set('index')"
              >
                Index — .2
              </button>
              <button
                type="button"
                [disabled]="!innerSwitchable()"
                [style]="
                  segStyle(
                    innerSwitchable() && innerKey() === 'stableId',
                    !innerSwitchable()
                  )
                "
                (click)="innerKey.set('stableId')"
              >
                Stable id — .&lt;media-id&gt;
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
        </div>

        <!-- Remount when the key shape changes: createOverlayUrlState builds its
             controller once, so a fresh key needs a fresh instance. Tracking the
             key string makes @for tear the demo down and rebuild it. -->
        @for (k of [demoKey()]; track k) {
          <app-reel-url-demo
            [feed]="feed"
            [addressing]="addressing()"
            [axis]="axis()"
            [innerKey]="innerKey()"
            [hash]="hash()"
          />
        }
      </div>
    </div>
  `,
})
export class ReelPlayerUrlPageComponent {
  protected readonly feed = feed;
  protected readonly pageSize = _kPageSize;

  protected readonly addressing = persistedSignal<Addressing>(
    'reelkit-reel-player-url-addressing',
    'index',
  );
  protected readonly axis = persistedSignal<Axis>(
    'reelkit-reel-player-url-axis',
    'one',
  );
  protected readonly innerKey = persistedSignal<InnerKey>(
    'reelkit-reel-player-url-inner-key',
    'index',
  );
  protected readonly hash = persistedSignal(
    'reelkit-reel-player-url-hash',
    false,
  );

  protected readonly innerSwitchable = computed(() => this.axis() === 'two');
  protected readonly hashable = computed(
    () =>
      this.addressing() === 'stableId' ||
      (this.innerSwitchable() && this.innerKey() === 'stableId'),
  );

  protected readonly demoKey = computed(
    () =>
      `${this.addressing()}.${this.axis()}.${this.innerKey()}.${
        this.hash() ? 'hash' : 'raw'
      }`,
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

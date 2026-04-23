import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerSlideDirective,
  RkPlayerNestedNavigationDirective,
  RkPlayerTimelineDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  RkMediaSlideComponent,
  RkPlayerLoadingDirective,
  RkPlayerErrorDirective,
  type ContentItem,
} from '@reelkit/angular-reel-player';

import { cdnUrl } from '@reelkit/example-data';
import { generateContent, getContentItem } from '../../data/mock-content';

type DemoType =
  | 'custom-overlay'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-nested-nav'
  | 'custom-timeline'
  | 'infinity'
  | 'custom-loading-error'
  | 'theming'
  | null;

interface Demo {
  id: NonNullable<DemoType>;
  title: string;
  description: string;
}

const DEMOS: Demo[] = [
  {
    id: 'custom-overlay',
    title: 'Custom Slide Overlay',
    description:
      'Uses rkPlayerSlideOverlay to replace the default overlay with a custom branded UI.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses rkPlayerControls with CloseButton + SoundButton sub-components and a custom Share button. Slide overlay is hidden via rkPlayerSlideOverlay with empty template.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide (rkPlayerSlide)',
    description:
      'Uses rkPlayerSlide to inject a CTA card on the last slide. Other slides fall back to default.',
  },
  {
    id: 'custom-nested-nav',
    title: 'Custom Nested Navigation',
    description:
      'Uses rkPlayerNestedNavigation to replace the default left/right arrows inside multi-media slides with custom pill-shaped buttons.',
  },
  {
    id: 'custom-timeline',
    title: 'Custom Timeline (rkPlayerTimeline)',
    description:
      'Replaces the built-in playback bar with a custom scrub + timecode via the dedicated rkPlayerTimeline slot. Gating (auto/always/never + min duration) still applies. Reuses the built-in .rk-reel-timeline slot class for safe-area handling and scopes a CSS override to reserve room for the taller bar.',
  },
  {
    id: 'infinity',
    title: 'Infinity (Lazy Load)',
    description:
      'Loads content in batches of 20 as you scroll. Uses slideChange to detect proximity to the end and appends more items, up to 1,000 total.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses rkPlayerLoading and rkPlayerError to replace default wave loader and error icon. Includes a broken image slide.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the overlay by overriding --rk-reel-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

const CONTENT_COUNT = 10;
const INFINITY_BATCH = 20;
const INFINITY_MAX = 1000;
const INFINITY_THRESHOLD = 5;

function generateInfinityBatch(start: number, count: number): ContentItem[] {
  const batch: ContentItem[] = [];
  for (let i = start; i < start + count && i < INFINITY_MAX; i++) {
    const item = getContentItem(i);
    batch.push({
      ...item,
      id: `infinity-${i}`,
      media: item.media.map((m, mi) => ({ ...m, id: `infinity-${i}-${mi}` })),
    });
  }
  return batch;
}

function getMultiMediaFirstContent(count: number): ContentItem[] {
  const all = generateContent(count + 20);
  const multi = all.filter((c) => c.media.length > 1);
  const single = all.filter((c) => c.media.length === 1);
  return [...multi, ...single].slice(0, count);
}

@Component({
  selector: 'app-reel-player-custom-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerSlideDirective,
    RkPlayerNestedNavigationDirective,
    RkPlayerTimelineDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
    RkMediaSlideComponent,
    RkPlayerLoadingDirective,
    RkPlayerErrorDirective,
  ],
  styles: [
    `
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .themed-overlay {
        --rk-reel-overlay-bg: #0f172a;
        --rk-reel-button-bg: rgba(99, 102, 241, 0.55);
        --rk-reel-button-bg-hover-strong: rgba(168, 85, 247, 0.85);
        --rk-reel-button-size: 52px;
        --rk-reel-edge-padding: 24px;
        --rk-reel-slide-overlay-bg: linear-gradient(
          transparent,
          rgba(99, 102, 241, 0.55) 60%,
          rgba(168, 85, 247, 0.85)
        );
        --rk-reel-slide-overlay-name-color: #fef3c7;

        /* Timeline bar: warm orange sits outside the purple/indigo
           gradient so the fill + cursor stay readable. Dark-slate track
           grounds it. */
        --rk-reel-timeline-track: rgba(15, 23, 42, 0.55);
        --rk-reel-timeline-buffered: rgba(251, 146, 60, 0.4);
        --rk-reel-timeline-fill: #fb923c;
        --rk-reel-timeline-cursor: #fb923c;
        --rk-reel-timeline-height: 4px;
        --rk-reel-timeline-height-active: 8px;
        --rk-reel-timeline-cursor-width-active: 18px;
        --rk-reel-timeline-transition: 0.2s ease-out;
      }

      /* The custom timeline is taller than the built-in track, so reserve
         extra bottom space in the slide caption and lift the multi-media
         indicator above it. Scoped to this overlay demo. */
      .custom-timeline-overlay {
        --rk-reel-slide-overlay-padding: 48px 16px 64px;
      }
      .custom-timeline-overlay .rk-reel-nested-indicator {
        bottom: 56px;
      }
      /* Desktop gets 8px of breathing room below the track. Touch devices
         stack that onto the built-in safe-area + 12px floor. */
      .rk-custom-timeline {
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
      }
      @media (hover: none) and (pointer: coarse) {
        .rk-custom-timeline {
          padding-bottom: calc(
            max(env(safe-area-inset-bottom, 0px), 12px) + 8px
          );
        }
      }
    `,
  ],
  template: `
    <div
      style="
        min-height: 100dvh;
        background-color: #111;
        padding: 56px 16px 16px;
      "
    >
      <div style="max-width: 900px; margin: 0 auto;">
        <h1
          style="
            color: #fff;
            font-size: 1.5rem;
            margin-bottom: 8px;
            font-weight: 500;
          "
        >
          Custom Reel Player
        </h1>
        <p
          style="
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-bottom: 32px;
          "
        >
          Demonstrates template slot customization: overlays, controls, and
          custom slides.
        </p>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          "
        >
          @for (demo of demos; track demo.id) {
            <div
              style="
                background-color: #1a1a1a;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
              "
            >
              <h2 style="color: #fff; font-size: 1.1rem; font-weight: 500;">
                {{ demo.title }}
              </h2>
              <p
                style="
                  color: rgba(255,255,255,0.5);
                  font-size: 0.8rem;
                  line-height: 1.5;
                  flex: 1;
                "
              >
                {{ demo.description }}
              </p>
              <button
                [attr.data-testid]="'demo-' + demo.id + '-open'"
                (click)="activeDemo.set(demo.id)"
                style="
                  padding: 10px 20px;
                  background-color: #fff;
                  color: #000;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 0.85rem;
                "
              >
                Open Demo
              </button>
            </div>
          }
        </div>
      </div>

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'custom-overlay'"
        [content]="content"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkPlayerSlideOverlay let-item>
          <div
            class="custom-overlay"
            data-testid="custom-overlay"
            style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 48px 16px 16px;
              background: linear-gradient(transparent, rgba(100, 50, 200, 0.8));
              color: #fff;
              pointer-events: none;
              z-index: 5;
            "
          >
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">
              {{ item.author.name }}
            </div>
            <div style="font-size: 13px; opacity: 0.9;">
              {{ item.description }}
            </div>
          </div>
        </ng-template>
      </rk-reel-player-overlay>

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'custom-controls'"
        [content]="content"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkPlayerSlideOverlay>
          <!-- empty: hides default overlay -->
        </ng-template>
        <ng-template rkPlayerControls let-onClose>
          <rk-close-button (clicked)="onClose()" />
          <rk-sound-button />
          <button
            data-testid="custom-share-btn"
            style="
              position: absolute;
              bottom: 64px;
              right: 16px;
              z-index: 10;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background-color: rgba(0,0,0,0.5);
              border: none;
              color: #fff;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            "
            aria-label="Share"
          >
            ↗
          </button>
        </ng-template>
      </rk-reel-player-overlay>

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'custom-slide'"
        [content]="content"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkPlayerSlide
          let-item
          let-index="index"
          let-size="size"
          let-isActive="isActive"
          let-onReady="onReady"
          let-onWaiting="onWaiting"
        >
          @if (index === content.length - 1) {
            {{ callReady(onReady) }}
            <div
              data-testid="cta-slide"
              [style.width.px]="size[0]"
              [style.height.px]="size[1]"
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: #fff;
                text-align: center;
              "
            >
              <div>
                <h2 style="font-size: 24px; margin-bottom: 12px;">
                  Follow for more!
                </h2>
                <button
                  style="
                    padding: 12px 32px;
                    border-radius: 24px;
                    border: 2px solid #fff;
                    background-color: transparent;
                    color: #fff;
                    font-size: 16px;
                    cursor: pointer;
                  "
                >
                  Subscribe
                </button>
              </div>
            </div>
          } @else {
            <rk-media-slide
              [content]="item"
              [isActive]="isActive"
              [width]="size[0]"
              [height]="size[1]"
              [onReady]="onReady"
              [onWaiting]="onWaiting"
            />
          }
        </ng-template>
      </rk-reel-player-overlay>

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'custom-nested-nav'"
        [content]="nestedNavContent"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkPlayerNestedNavigation
          let-onPrev
          let-onNext="onNext"
          let-activeIndex="activeIndex"
          let-count="count"
        >
          <div
            data-testid="custom-nested-nav"
            style="
              position: absolute;
              bottom: 48px;
              left: 0;
              right: 0;
              display: flex;
              justify-content: center;
              gap: 8px;
              z-index: 10;
              pointer-events: none;
            "
          >
            <button
              data-testid="custom-nested-prev"
              (click)="onPrev()"
              [disabled]="activeIndex === 0"
              aria-label="Previous"
              [style.pointer-events]="'auto'"
              [style.padding]="'6px 16px'"
              [style.border-radius]="'16px'"
              [style.border]="'none'"
              [style.background-color]="
                activeIndex === 0
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.8)'
              "
              [style.color]="activeIndex === 0 ? '#999' : '#000'"
              [style.font-size]="'13px'"
              [style.font-weight]="'600'"
              [style.cursor]="activeIndex === 0 ? 'default' : 'pointer'"
            >
              Prev
            </button>
            <span
              data-testid="custom-nested-counter"
              style="
                pointer-events: auto;
                padding: 6px 12px;
                border-radius: 16px;
                background-color: rgba(0,0,0,0.6);
                color: #fff;
                font-size: 13px;
                font-weight: 500;
              "
            >
              {{ activeIndex + 1 }} / {{ count }}
            </span>
            <button
              data-testid="custom-nested-next"
              (click)="onNext()"
              [disabled]="activeIndex === count - 1"
              aria-label="Next"
              [style.pointer-events]="'auto'"
              [style.padding]="'6px 16px'"
              [style.border-radius]="'16px'"
              [style.border]="'none'"
              [style.background-color]="
                activeIndex === count - 1
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.8)'
              "
              [style.color]="activeIndex === count - 1 ? '#999' : '#000'"
              [style.font-size]="'13px'"
              [style.font-weight]="'600'"
              [style.cursor]="activeIndex === count - 1 ? 'default' : 'pointer'"
            >
              Next
            </button>
          </div>
        </ng-template>
      </rk-reel-player-overlay>

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'infinity'"
        [content]="infinityContent()"
        [initialIndex]="0"
        (closed)="closeInfinity()"
        (slideChange)="onInfinitySlideChange($event)"
      >
        <ng-template rkPlayerSlideOverlay>
          <!-- hidden -->
        </ng-template>
      </rk-reel-player-overlay>

      @if (activeDemo() === 'infinity') {
        <div
          style="
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 9999;
            padding: 4px 10px;
            border-radius: 8px;
            background-color: rgba(0,0,0,0.5);
            color: #fff;
            font-size: 13px;
            font-weight: 500;
          "
        >
          {{ infinityIndex() + 1 }} / {{ infinityContent().length }}
        </div>

        @if (infinityLoading()) {
          <div
            style="
              position: fixed;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 8px 16px;
              border-radius: 20px;
              background-color: rgba(0,0,0,0.7);
              color: #fff;
              font-size: 13px;
              font-weight: 500;
            "
          >
            <div
              style="
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              "
            ></div>
            Loading more…
          </div>
        }
      }
      @if (activeDemo() === 'theming') {
        <div class="themed-overlay">
          <rk-reel-player-overlay
            [isOpen]="true"
            [content]="content"
            [initialIndex]="0"
            timeline="always"
            (closed)="activeDemo.set(null)"
          />
        </div>
      }

      @if (activeDemo() === 'custom-timeline') {
        <div class="custom-timeline-overlay">
          <rk-reel-player-overlay
            [isOpen]="true"
            [content]="content"
            [initialIndex]="0"
            timeline="always"
            (closed)="activeDemo.set(null)"
          >
            <ng-template rkPlayerTimeline let-state="timelineState">
              <div
                class="rk-reel-timeline rk-custom-timeline"
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  padding-left: 16px;
                  padding-right: 16px;
                  color: #fff;
                  font-family: ui-monospace, SFMono-Regular, monospace;
                "
              >
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
                  "
                >
                  <span>{{ fmtTime(state.currentTime()) }}</span>
                  <span style="opacity: 0.7">
                    {{ fmtTime(state.duration()) }}
                  </span>
                </div>
                <div
                  #customTrack
                  role="slider"
                  aria-label="Seek"
                  [attr.aria-valuemin]="0"
                  [attr.aria-valuemax]="
                    isFinite(state.duration()) ? state.duration() : 0
                  "
                  [attr.aria-valuenow]="state.currentTime()"
                  tabindex="0"
                  [style.height.px]="state.isScrubbing() ? 10 : 6"
                  style="
                    position: relative;
                    border-radius: 999px;
                    background-color: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: height 0.15s ease-out;
                  "
                  (pointerdown)="
                    bindCustomTrack(customTrack, state); customTrack.focus()
                  "
                >
                  <div
                    [style.width.%]="state.progress() * 100"
                    style="
                      position: absolute;
                      inset: 0;
                      border-radius: 999px;
                      background: linear-gradient(
                        90deg,
                        #6366f1,
                        #a855f7,
                        #ec4899
                      );
                      pointer-events: none;
                    "
                  ></div>
                </div>
              </div>
            </ng-template>
          </rk-reel-player-overlay>
        </div>
      }

      <rk-reel-player-overlay
        [isOpen]="activeDemo() === 'custom-loading-error'"
        [content]="brokenContent"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkPlayerLoading let-index>
          <div
            style="
              position: absolute;
              inset: 0;
              z-index: 5;
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(255, 255, 255, 0.5);
              font-size: 14px;
              gap: 8px;
            "
          >
            <div
              style="
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              "
            ></div>
            Loading slide {{ index + 1 }}...
          </div>
        </ng-template>
        <ng-template rkPlayerError let-index>
          <div
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 10;
              color: #ff6b6b;
              text-align: center;
            "
          >
            <div style="font-size: 48px; margin-bottom: 8px">⚠️</div>
            <div style="font-size: 14px">
              Slide {{ index + 1 }} failed to load
            </div>
          </div>
        </ng-template>
      </rk-reel-player-overlay>
    </div>
  `,
})
export class ReelPlayerCustomPageComponent {
  protected readonly demos: Demo[] = DEMOS;
  protected readonly content: ContentItem[] = generateContent(CONTENT_COUNT);
  protected readonly brokenContent: ContentItem[] = [
    ...this.content.slice(0, 2),
    {
      id: 'broken-content',
      media: [
        {
          id: 'broken-img',
          type: 'image',
          src: 'https://broken.invalid/does-not-exist.jpg',
          aspectRatio: 9 / 16,
        },
      ],
      author: {
        name: 'Error Demo',
        avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
      },
      likes: 0,
      description: 'Broken image: shows custom error UI.',
    },
    ...this.content.slice(2, 5),
  ];
  protected readonly nestedNavContent: ContentItem[] =
    getMultiMediaFirstContent(CONTENT_COUNT);
  protected readonly activeDemo = signal<DemoType>(null);

  // `isFinite` reference for the custom-timeline template.
  protected readonly isFinite = Number.isFinite;

  protected fmtTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${sec}`;
  }

  private _customTrackDisposer: (() => void) | null = null;
  private _customTrackEl: HTMLElement | null = null;
  protected bindCustomTrack(
    el: HTMLElement,
    state: { bindInteractions: (el: HTMLElement) => () => void },
  ): void {
    if (this._customTrackEl === el) return;
    this._customTrackDisposer?.();
    this._customTrackEl = el;
    this._customTrackDisposer = state.bindInteractions(el);
  }

  protected readonly infinityContent = signal<ContentItem[]>(
    generateInfinityBatch(0, INFINITY_BATCH),
  );
  protected readonly infinityLoading = signal(false);
  protected readonly infinityIndex = signal(0);
  private infinityLoaded = INFINITY_BATCH;

  protected onInfinitySlideChange(index: number): void {
    this.infinityIndex.set(index);

    const loaded = this.infinityLoaded;
    if (loaded >= INFINITY_MAX) return;
    if (index < loaded - INFINITY_THRESHOLD) return;

    this.infinityLoaded = loaded + INFINITY_BATCH;
    this.infinityLoading.set(true);

    setTimeout(() => {
      const batch = generateInfinityBatch(loaded, INFINITY_BATCH);
      this.infinityContent.update((prev) => [...prev, ...batch]);
      this.infinityLoading.set(false);
    }, 2000);
  }

  protected closeInfinity(): void {
    this.activeDemo.set(null);
    if (this.infinityLoaded !== INFINITY_BATCH) {
      this.infinityContent.set(generateInfinityBatch(0, INFINITY_BATCH));
      this.infinityLoaded = INFINITY_BATCH;
      this.infinityLoading.set(false);
      this.infinityIndex.set(0);
    }
  }

  protected callReady(fn: () => void): '' {
    fn();
    return '';
  }
}

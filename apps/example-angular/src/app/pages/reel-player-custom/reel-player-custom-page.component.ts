import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerSlideDirective,
  RkPlayerNestedNavigationDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  RkMediaSlideComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';

import { generateContent } from '../../data/mock-content';

type DemoType =
  | 'default-overlay'
  | 'custom-overlay'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-nested-nav'
  | null;

interface Demo {
  id: NonNullable<DemoType>;
  title: string;
  description: string;
}

const DEMOS: Demo[] = [
  {
    id: 'default-overlay',
    title: 'Default Slide Overlay',
    description:
      'Built-in overlay showing author, description, and likes. No extra props needed.',
  },
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
];

const CONTENT_COUNT = 10;

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
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerSlideDirective,
    RkPlayerNestedNavigationDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
    RkMediaSlideComponent,
  ],
  template: `
    <div
      style="
        min-height: 100vh;
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
        [isOpen]="activeDemo() === 'default-overlay'"
        [content]="content"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      />

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
          <!-- empty — hides default overlay -->
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
        >
          @if (index === content.length - 1) {
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
    </div>
  `,
})
export class ReelPlayerCustomPageComponent {
  protected readonly demos: Demo[] = DEMOS;
  protected readonly content: ContentItem[] = generateContent(CONTENT_COUNT);
  protected readonly nestedNavContent: ContentItem[] =
    getMultiMediaFirstContent(CONTENT_COUNT);
  protected readonly activeDemo = signal<DemoType>(null);
}

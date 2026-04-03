import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  RkLightboxInfoDirective,
  RkLightboxControlsDirective,
  RkLightboxSlideDirective,
  RkLightboxNavigationDirective,
  RkLightboxLoadingDirective,
  RkLightboxErrorDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';
import { cdnUrl } from '@reelkit/example-data';

type DemoType =
  | 'custom-info'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-navigation'
  | 'custom-loading-error'
  | null;

interface Demo {
  id: NonNullable<DemoType>;
  title: string;
  description: string;
}

const DEMOS: Demo[] = [
  {
    id: 'custom-info',
    title: 'Custom Info Overlay',
    description:
      'Uses rkLightboxInfo to replace the default title/description with a custom styled overlay.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses rkLightboxControls with CloseButton + Counter + FullscreenButton sub-components and a custom Download button.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide (rkLightboxSlide)',
    description:
      'Uses rkLightboxSlide to inject a CTA card on the last slide. Other slides fall back to default.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses rkLightboxNavigation to replace the default prev/next arrows with pill-shaped buttons and a counter.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses rkLightboxLoading and rkLightboxError to replace default spinner and error icon. Includes a broken image.',
  },
];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest.',
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the sea.',
  },
];

@Component({
  selector: 'app-image-preview-custom-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxInfoDirective,
    RkLightboxControlsDirective,
    RkLightboxSlideDirective,
    RkLightboxNavigationDirective,
    RkLightboxLoadingDirective,
    RkLightboxErrorDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
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
          Custom Lightbox
        </h1>
        <p
          style="
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-bottom: 32px;
          "
        >
          Demonstrates template slot customization: info overlays, controls,
          navigation, and custom slides.
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

      <rk-lightbox-overlay
        [isOpen]="activeDemo() === 'custom-info'"
        [items]="images"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkLightboxInfo let-item>
          <div
            data-testid="custom-info"
            style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 16px 20px;
              background: linear-gradient(transparent, rgba(99,102,241,0.8));
              color: #fff;
              z-index: 10;
            "
          >
            <div style="font-weight: 600; font-size: 1rem;">
              {{ item.title }}
            </div>
            @if (item.description) {
              <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 4px;">
                {{ item.description }}
              </div>
            }
          </div>
        </ng-template>
      </rk-lightbox-overlay>

      <rk-lightbox-overlay
        [isOpen]="activeDemo() === 'custom-controls'"
        [items]="images"
        [initialIndex]="0"
        [showInfo]="false"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkLightboxControls
          let-onClose="onClose"
          let-activeIndex="activeIndex"
          let-count="count"
          let-isFullscreen="isFullscreen"
          let-onToggleFullscreen="onToggleFullscreen"
        >
          <div
            style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              z-index: 10;
            "
          >
            <div style="display: flex; align-items: center; gap: 8px;">
              <rk-counter [currentIndex]="activeIndex" [count]="count" />
              <rk-fullscreen-button
                [isFullscreen]="isFullscreen"
                (toggled)="onToggleFullscreen()"
              />
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button
                data-testid="custom-download-btn"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 8px 16px;
                  border-radius: 20px;
                  border: none;
                  background-color: rgba(255,255,255,0.15);
                  color: #fff;
                  cursor: pointer;
                  font-size: 0.75rem;
                  backdrop-filter: blur(8px);
                "
              >
                Download
              </button>
              <rk-close-button (clicked)="onClose()" style="position: static" />
            </div>
          </div>
        </ng-template>
      </rk-lightbox-overlay>

      <rk-lightbox-overlay
        [isOpen]="activeDemo() === 'custom-slide'"
        [items]="images"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkLightboxSlide
          let-item
          let-index="index"
          let-size="size"
          let-onReady="onReady"
        >
          @if (index === images.length - 1) {
            {{ callReady(onReady) }}
            <div
              data-testid="cta-slide"
              [style.width.px]="size[0]"
              [style.height.px]="size[1]"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #111;
                color: #fff;
                gap: 16px;
              "
            >
              <h2 style="font-size: 1.5rem; font-weight: 600;">
                View all photos
              </h2>
              <p style="opacity: 0.6;">You've reached the end of the gallery</p>
              <button
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 12px 24px;
                  border-radius: 20px;
                  border: none;
                  background-color: #6366f1;
                  color: #fff;
                  cursor: pointer;
                  font-size: 0.85rem;
                  backdrop-filter: blur(8px);
                "
              >
                Browse Gallery
              </button>
            </div>
          } @else {
            <img
              [src]="item.src"
              [alt]="item.title ?? ''"
              class="rk-lightbox-img rk-loaded"
              (load)="onReady()"
            />
          }
        </ng-template>
      </rk-lightbox-overlay>

      <rk-lightbox-overlay
        [isOpen]="activeDemo() === 'custom-navigation'"
        [items]="images"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkLightboxNavigation
          let-onPrev="onPrev"
          let-onNext="onNext"
          let-activeIndex="activeIndex"
          let-count="count"
        >
          <div
            data-testid="custom-nav"
            style="
              position: absolute;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              align-items: center;
              gap: 12px;
              z-index: 10;
            "
          >
            <button
              data-testid="custom-nav-prev"
              (click)="onPrev()"
              [disabled]="activeIndex === 0"
              [style.opacity]="activeIndex === 0 ? '0.3' : '1'"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 8px 16px;
                border-radius: 20px;
                border: none;
                background-color: rgba(255,255,255,0.15);
                color: #fff;
                cursor: pointer;
                font-size: 0.85rem;
                backdrop-filter: blur(8px);
              "
            >
              Prev
            </button>
            <span
              data-testid="custom-nav-counter"
              style="color: #fff; font-size: 0.85rem;"
            >
              {{ activeIndex + 1 }} / {{ count }}
            </span>
            <button
              data-testid="custom-nav-next"
              (click)="onNext()"
              [disabled]="activeIndex === count - 1"
              [style.opacity]="activeIndex === count - 1 ? '0.3' : '1'"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 8px 16px;
                border-radius: 20px;
                border: none;
                background-color: rgba(255,255,255,0.15);
                color: #fff;
                cursor: pointer;
                font-size: 0.85rem;
                backdrop-filter: blur(8px);
              "
            >
              Next
            </button>
          </div>
        </ng-template>
        <ng-template
          rkLightboxControls
          let-onClose="onClose"
          let-isFullscreen="isFullscreen"
          let-onToggleFullscreen="onToggleFullscreen"
        >
          <div
            style="
              position: absolute;
              top: 0;
              right: 0;
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 16px;
              z-index: 10;
            "
          >
            <rk-fullscreen-button
              [isFullscreen]="isFullscreen"
              (toggled)="onToggleFullscreen()"
            />
            <rk-close-button (clicked)="onClose()" style="position: static" />
          </div>
        </ng-template>
      </rk-lightbox-overlay>

      <rk-lightbox-overlay
        [isOpen]="activeDemo() === 'custom-loading-error'"
        [items]="brokenImages"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkLightboxLoading let-index>
          <div
            style="
              position: absolute;
              top: 22px;
              right: 72px;
              z-index: 10;
              color: #fff;
              font-size: 12px;
              background: rgba(0, 0, 0, 0.6);
              padding: 4px 12px;
              border-radius: 12px;
            "
          >
            Loading slide {{ index + 1 }}...
          </div>
        </ng-template>
        <ng-template rkLightboxError let-index>
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
      </rk-lightbox-overlay>
    </div>
  `,
})
export class ImagePreviewCustomPageComponent {
  protected readonly demos: Demo[] = DEMOS;
  protected readonly images: LightboxItem[] = sampleImages;
  protected readonly brokenImages: LightboxItem[] = [
    sampleImages[0],
    sampleImages[1],
    {
      src: 'https://broken.invalid/does-not-exist.jpg',
      title: 'Broken Image',
      description: 'This image fails to load — shows custom error UI.',
    },
    sampleImages[2],
    sampleImages[3],
  ];
  protected readonly activeDemo = signal<DemoType>(null);

  protected callReady(fn: () => void): '' {
    fn();
    return '';
  }
}

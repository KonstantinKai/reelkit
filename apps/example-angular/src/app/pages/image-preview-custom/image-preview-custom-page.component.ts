import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  RkLightboxInfoDirective,
  RkLightboxControlsDirective,
  RkLightboxSlideDirective,
  RkLightboxNavigationDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';

type DemoType =
  | 'default-info'
  | 'custom-info'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-navigation'
  | null;

interface Demo {
  id: NonNullable<DemoType>;
  title: string;
  description: string;
}

const DEMOS: Demo[] = [
  {
    id: 'default-info',
    title: 'Default Info Overlay',
    description:
      'Built-in info overlay showing title and description. No extra props needed.',
  },
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
];

const sampleImages: LightboxItem[] = [
  {
    src: 'https://picsum.photos/id/1015/1600/1000',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: 'https://picsum.photos/id/1016/1000/1600',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
  },
  {
    src: 'https://picsum.photos/id/1018/1600/900',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: 'https://picsum.photos/id/1019/900/1400',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
  },
  {
    src: 'https://picsum.photos/id/1020/1600/1067',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest.',
  },
  {
    src: 'https://picsum.photos/id/1022/1600/1067',
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
        [isOpen]="activeDemo() === 'default-info'"
        [items]="images"
        [initialIndex]="0"
        (closed)="activeDemo.set(null)"
      />

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
          let-currentIndex="currentIndex"
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
              <rk-counter [currentIndex]="currentIndex" [count]="count" />
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
        <ng-template rkLightboxSlide let-item let-index="index" let-size="size">
          @if (index === images.length - 1) {
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
    </div>
  `,
})
export class ImagePreviewCustomPageComponent {
  protected readonly demos: Demo[] = DEMOS;
  protected readonly images: LightboxItem[] = sampleImages;
  protected readonly activeDemo = signal<DemoType>(null);
}

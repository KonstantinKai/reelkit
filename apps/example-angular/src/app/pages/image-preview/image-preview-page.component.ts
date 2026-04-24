import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
  type TransitionType,
} from '@reelkit/angular-lightbox';
import type { SwipeToCloseDirection } from '@reelkit/angular';
import { cdnUrl } from '@reelkit/example-data';

const _kTransitions: TransitionType[] = ['slide', 'fade', 'flip', 'zoom-in'];
const _kSwipeDirections: SwipeToCloseDirection[] = ['up', 'down'];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description:
      'A beautiful mountain river flowing through the forest. The water is crystal clear and reflects the surrounding trees.',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
    width: 1000,
    height: 1600,
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description:
      'Misty morning in the dense forest. The sun rays pierce through the fog creating a magical atmosphere.',
    width: 1600,
    height: 900,
  },
  {
    src: 'https://broken.invalid/does-not-exist.jpg',
    title: 'Broken Image',
    description:
      'This image intentionally fails to demonstrate error handling.',
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
    width: 900,
    height: 1400,
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description:
      'A winding path through the autumn forest covered in golden leaves.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-06.jpg'),
    title: 'Sunset Silhouette',
    width: 1200,
    height: 1800,
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-08.jpg'),
    title: 'Desert Dunes',
    description:
      'Rolling sand dunes stretching to the horizon under the scorching sun.',
    width: 1920,
    height: 1280,
  },
  {
    src: cdnUrl('samples/images/image-09.jpg'),
    title: 'Puppy Portrait',
    description: 'An adorable puppy looking at the camera with curious eyes.',
    width: 900,
    height: 1350,
  },
  {
    src: cdnUrl('samples/images/image-10.jpg'),
    title: 'Northern Lights',
    description: 'The magical aurora borealis dancing across the night sky.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-11.jpg'),
    title: 'City Lights',
    description: 'Urban skyline glittering at night.',
    width: 1080,
    height: 1620,
  },
  {
    src: cdnUrl('samples/images/image-12.jpg'),
    title: 'Waterfall',
    description: 'A thundering waterfall cascading down the rocky cliff.',
    width: 1600,
    height: 1067,
  },
];

@Component({
  selector: 'app-image-preview-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkLightboxOverlayComponent],
  styleUrls: ['./image-preview-page.css'],
  template: `
    <div class="image-gallery-page">
      <div class="gallery-header">
        <h1>Image Gallery</h1>
        <p>
          Click on any image to open the preview. Use arrow keys or swipe to
          navigate.
        </p>
        <div class="transition-selector">
          <span>Transition:</span>
          @for (t of transitions; track t) {
            <button
              [class]="'transition-btn' + (transition() === t ? ' active' : '')"
              (click)="transition.set(t)"
            >
              {{ t }}
            </button>
          }
        </div>
        <div class="transition-selector">
          <span>Swipe-to-close:</span>
          @for (d of swipeDirections; track d) {
            <button
              [class]="
                'transition-btn' + (swipeDirection() === d ? ' active' : '')
              "
              (click)="swipeDirection.set(d)"
            >
              {{ d }}
            </button>
          }
        </div>
      </div>

      <div class="gallery-grid">
        @for (image of images; track image.src; let index = $index) {
          <div
            class="gallery-item"
            (click)="previewIndex.set(index)"
            role="button"
            [attr.tabindex]="0"
            (keydown.enter)="previewIndex.set(index)"
            (keydown.space)="$event.preventDefault(); previewIndex.set(index)"
          >
            @if (thumbErrors().has(index)) {
              <div
                style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: rgba(255, 255, 255, 0.3);
                  gap: 4px;
                  background-color: #1a1a1a;
                "
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
                <span style="font-size: 10px">Error</span>
              </div>
            } @else {
              <img
                [src]="thumbnailSrc(image.src)"
                [alt]="image.title ?? 'Image ' + (index + 1)"
                loading="lazy"
                (error)="onThumbError(index)"
              />
            }
            <div class="gallery-item-overlay">
              @if (image.title) {
                <span class="gallery-item-title">{{ image.title }}</span>
              }
            </div>
          </div>
        }
      </div>

      <rk-lightbox-overlay
        [isOpen]="previewIndex() !== null"
        [items]="images"
        [initialIndex]="previewIndex() ?? 0"
        [transition]="transition()"
        [swipeToCloseDirection]="swipeDirection()"
        (closed)="previewIndex.set(null)"
      />
    </div>
  `,
})
export class ImagePreviewPageComponent {
  protected readonly images: LightboxItem[] = sampleImages;
  protected readonly transitions: TransitionType[] = _kTransitions;
  protected readonly swipeDirections: SwipeToCloseDirection[] = _kSwipeDirections;
  protected readonly previewIndex = signal<number | null>(null);
  protected readonly transition = signal<TransitionType>('slide');
  protected readonly swipeDirection = signal<SwipeToCloseDirection>('up');

  protected readonly thumbErrors = signal<Set<number>>(new Set());

  protected onThumbError(index: number): void {
    this.thumbErrors.update((prev) => new Set([...prev, index]));
  }

  protected thumbnailSrc(src: string): string {
    return src;
  }
}

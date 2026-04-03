import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  RkLightboxOverlayComponent,
  RkLightboxControlsDirective,
  RkLightboxSlideDirective,
  RkLightboxVideoSlideComponent,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  RkSoundButtonComponent,
  setLightboxVideoMuted,
  type LightboxItem,
  type TransitionType,
} from '@reelkit/angular-lightbox';
import { cdnUrl } from '@reelkit/example-data';

const _kTransitions: TransitionType[] = ['slide', 'fade', 'flip', 'zoom-in'];

const sampleItems: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: cdnUrl('samples/videos/video-01.mp4'),
    type: 'video',
    poster: cdnUrl('samples/videos/video-poster-01.jpg'),
    title: 'Ocean Waves',
    description: 'Sample video demonstrating video support in the lightbox.',
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: cdnUrl('samples/videos/video-02.mp4'),
    type: 'video',
    poster: cdnUrl('samples/videos/video-poster-02.jpg'),
    title: 'Nature Landscape',
    description: 'Another sample video showcasing the opt-in video feature.',
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Autumn Path',
    description:
      'A winding path through the autumn forest covered in golden leaves.',
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Puppy Portrait',
    description: 'An adorable puppy looking at the camera with curious eyes.',
  },
];

@Component({
  selector: 'app-image-preview-video-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkLightboxSlideDirective,
    RkLightboxVideoSlideComponent,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
    RkSoundButtonComponent,
  ],
  styleUrls: ['../image-preview/image-preview-page.css'],
  template: `
    <div class="image-gallery-page">
      <div class="gallery-header">
        <h1>Mixed Gallery (Images + Video)</h1>
        <p>
          Click on any item to open the lightbox. Video items use the opt-in
          <code>RkLightboxVideoSlideComponent</code>.
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
      </div>

      <div class="gallery-grid">
        @for (item of items; track item.src; let index = $index) {
          <div
            class="gallery-item"
            (click)="previewIndex.set(index)"
            role="button"
            [attr.tabindex]="0"
            (keydown.enter)="previewIndex.set(index)"
            (keydown.space)="$event.preventDefault(); previewIndex.set(index)"
          >
            <img
              [src]="thumbnailSrc(item)"
              [alt]="item.title ?? 'Item ' + (index + 1)"
              loading="lazy"
            />
            <div class="gallery-item-overlay">
              @if (item.type === 'video') {
                <span
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.9);
                    margin-right: 8px;
                    vertical-align: middle;
                  "
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="#000">
                    <path d="M0 0l14 8-14 8z" />
                  </svg>
                </span>
              }
              @if (item.title) {
                <span class="gallery-item-title">{{ item.title }}</span>
              }
            </div>
          </div>
        }
      </div>

      <rk-lightbox-overlay
        [isOpen]="previewIndex() !== null"
        [items]="items"
        [initialIndex]="previewIndex() ?? 0"
        [transition]="transition()"
        (closed)="onClose()"
      >
        <ng-template
          rkLightboxControls
          let-ctx="onClose"
          let-activeIndex="activeIndex"
          let-count="count"
          let-isFullscreen="isFullscreen"
          let-onToggleFullscreen="onToggleFullscreen"
          let-onClose="onClose"
        >
          <div class="rk-lightbox-controls-left">
            <rk-counter [currentIndex]="activeIndex" [count]="count" />
            <rk-fullscreen-button
              [isFullscreen]="isFullscreen"
              (toggled)="onToggleFullscreen()"
            />
            <rk-sound-button [muted]="isMuted()" (toggled)="toggleMute()" />
          </div>
          <rk-close-button (clicked)="onClose()" />
        </ng-template>

        <ng-template
          rkLightboxSlide
          let-item
          let-size="size"
          let-isActive="isActive"
          let-onReady="onReady"
          let-onWaiting="onWaiting"
        >
          @if (item.type === 'video') {
            <rk-lightbox-video-slide
              [src]="item.src"
              [poster]="item.poster"
              [isActive]="isActive"
              [size]="size"
              [slideKey]="item.src"
              [onReady]="onReady"
              [onWaiting]="onWaiting"
            />
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
    </div>
  `,
})
export class ImagePreviewVideoPageComponent implements OnDestroy {
  protected readonly items: LightboxItem[] = sampleItems;
  protected readonly transitions: TransitionType[] = _kTransitions;
  protected readonly previewIndex = signal<number | null>(null);
  protected readonly transition = signal<TransitionType>('slide');
  protected readonly isMuted = signal(true);

  protected onClose(): void {
    this.previewIndex.set(null);
    // Reset to muted when lightbox closes so next open can autoplay.
    this.isMuted.set(true);
    setLightboxVideoMuted(true);
  }

  protected toggleMute(): void {
    const next = !this.isMuted();
    this.isMuted.set(next);
    setLightboxVideoMuted(next);
  }

  ngOnDestroy(): void {
    setLightboxVideoMuted(true);
  }

  protected thumbnailSrc(item: LightboxItem): string {
    if (item.type === 'video') {
      return item.poster ?? '';
    }
    return item.src.replace(/\/\d+\/\d+$/, '/400/300');
  }
}

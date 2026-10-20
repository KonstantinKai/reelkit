import { Component, signal } from '@angular/core';
import { RkLightboxOverlayComponent } from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';
import { photos } from './api';

// Counted from when each photo has loaded, so a slow one is never skipped.
const kSlideshowIntervalMs = 3000;

@Component({
  selector: 'app-gallery-slideshow',
  imports: [RkLightboxOverlayComponent],
  template: `
    <div class="gallery">
      <div class="grid">
        @for (photo of photos; track photo.src; let index = $index) {
          <button
            type="button"
            class="thumbnail"
            [attr.aria-label]="'Open ' + photo.title"
            (click)="openAt(index)"
          >
            <img [src]="photo.src" alt="" loading="lazy" />
          </button>
        }
      </div>

      <!--
        The default bar gains a play and pause button and a download button
        once autoAdvance and showDownload are on.
      -->
      <rk-lightbox-overlay
        [isOpen]="open()"
        [items]="photos"
        [initialIndex]="startIndex()"
        [autoAdvance]="true"
        [autoAdvanceInterval]="slideshowIntervalMs"
        [showDownload]="true"
        (closed)="open.set(false)"
      />
    </div>
  `,
  styles: `
    .gallery {
      height: 100%;
      overflow-y: auto;
      padding: 8px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    }

    .thumbnail {
      aspect-ratio: 1;
      padding: 0;
      border: 0;
      overflow: hidden;
      cursor: pointer;
      background: #1e293b;
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class GallerySlideshowComponent {
  protected readonly photos = photos;
  protected readonly slideshowIntervalMs = kSlideshowIntervalMs;
  protected readonly open = signal(false);
  protected readonly startIndex = signal(0);

  protected openAt(index: number) {
    this.startIndex.set(index);
    this.open.set(true);
  }
}

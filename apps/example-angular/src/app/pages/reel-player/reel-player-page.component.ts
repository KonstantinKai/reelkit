import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';
import { cdnUrl } from '@reelkit/example-data';
import { generateContent, getThumbnail } from '../../data/mock-content';
import type { ContentItem } from '@reelkit/angular-reel-player';

const CONTENT_COUNT = 50;

@Component({
  selector: 'app-reel-player-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <div
      style="
        min-height: 100dvh;
        background-color: #111;
        padding: 56px 16px 16px;
      "
    >
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1
          style="
            color: #fff;
            font-size: 1.5rem;
            margin-bottom: 24px;
            font-weight: 500;
          "
        >
          Reel Player Demo
        </h1>
        <p
          style="
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
            margin-bottom: 32px;
          "
        >
          Click on any thumbnail to open the player. Swipe up/down or use arrow
          keys to navigate. Supports images, videos, and multi-media posts with
          horizontal sliders.
        </p>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
          "
        >
          @for (item of content; track item.id; let index = $index) {
            <div
              role="button"
              tabindex="0"
              data-testid="thumbnail"
              (click)="openPlayer(index)"
              (keydown.enter)="openPlayer(index)"
              style="
                position: relative;
                aspect-ratio: 9 / 16;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                background-color: #222;
              "
            >
              @if (thumbErrors().has(index)) {
                <div
                  style="
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.3);
                    gap: 4px;
                  "
                >
                  <svg
                    width="32"
                    height="32"
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
                  [src]="getThumbnail(item)"
                  alt=""
                  style="width: 100%; height: 100%; object-fit: cover;"
                  loading="lazy"
                  (error)="onThumbError(index)"
                />
              }

              @if (hasVideo(item)) {
                <div
                  data-testid="video-indicator"
                  style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background-color: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              }

              @if (isMulti(item)) {
                <div
                  style="
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background-color: rgba(0,0,0,0.6);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 500;
                  "
                >
                  {{ item.media.length }}
                </div>
              }

              <div
                style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  padding: 32px 8px 8px;
                  background: linear-gradient(transparent, rgba(0,0,0,0.8));
                "
              >
                <div style="display: flex; align-items: center; gap: 6px;">
                  <img
                    [src]="item.author.avatar"
                    alt=""
                    style="
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      object-fit: cover;
                    "
                  />
                  <span
                    style="
                      color: #fff;
                      font-size: 0.7rem;
                      font-weight: 500;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ item.author.name }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <rk-reel-player-overlay
        [isOpen]="isPlayerOpen()"
        [content]="content"
        [initialIndex]="selectedIndex()"
        (closed)="closePlayer()"
      />
    </div>
  `,
})
export class ReelPlayerPageComponent {
  protected readonly content: ContentItem[] = (() => {
    const items = generateContent(CONTENT_COUNT);
    items.splice(3, 0, {
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
      description:
        'This slide has a broken image to demonstrate error handling.',
    });
    return items;
  })();
  protected readonly isPlayerOpen = signal(false);
  protected readonly selectedIndex = signal(0);

  protected readonly getThumbnail = getThumbnail;

  protected hasVideo(item: ContentItem): boolean {
    return item.media.some((m) => m.type === 'video');
  }

  protected isMulti(item: ContentItem): boolean {
    return item.media.length > 1;
  }

  protected openPlayer(index: number): void {
    this.selectedIndex.set(index);
    this.isPlayerOpen.set(true);
  }

  protected readonly thumbErrors = signal<Set<number>>(new Set());

  protected onThumbError(index: number): void {
    this.thumbErrors.update((prev) => new Set([...prev, index]));
  }

  protected closePlayer(): void {
    this.isPlayerOpen.set(false);
  }
}

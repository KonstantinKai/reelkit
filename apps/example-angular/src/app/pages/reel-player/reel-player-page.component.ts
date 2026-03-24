import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';
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
              <img
                [src]="getThumbnail(item)"
                alt=""
                style="width: 100%; height: 100%; object-fit: cover;"
                loading="lazy"
              />

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
  protected readonly content: ContentItem[] = generateContent(CONTENT_COUNT);
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

  protected closePlayer(): void {
    this.isPlayerOpen.set(false);
  }
}

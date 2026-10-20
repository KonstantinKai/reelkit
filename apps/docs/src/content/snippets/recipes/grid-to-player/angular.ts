import { Component, ElementRef, signal, viewChildren } from '@angular/core';
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';
import '@reelkit/angular-reel-player/styles.css';
import { posts, thumbnailOf } from './api';

@Component({
  selector: 'app-grid-to-player',
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <div class="feed">
      <div class="grid">
        @for (post of posts; track post.id; let index = $index) {
          <button
            #thumbnail
            type="button"
            class="thumbnail"
            [attr.aria-label]="'Open ' + post.description"
            (click)="openAt(index)"
          >
            <img [src]="thumbnailOf(post)" alt="" loading="lazy" />
          </button>
        }
      </div>

      <rk-reel-player-overlay
        [isOpen]="open()"
        [content]="posts"
        [initialIndex]="startIndex()"
        (slideChange)="lastViewed = $event"
        (closed)="close()"
      />
    </div>
  `,
  styles: `
    .feed {
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
      aspect-ratio: 3 / 4;
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
export class GridToPlayerComponent {
  protected readonly posts = posts;
  protected readonly thumbnailOf = thumbnailOf;
  protected readonly open = signal(false);
  protected readonly startIndex = signal(0);
  protected lastViewed = 0;
  private readonly _thumbnails =
    viewChildren<ElementRef<HTMLButtonElement>>('thumbnail');

  protected openAt(index: number) {
    this.startIndex.set(index);
    this.lastViewed = index;
    this.open.set(true);
  }

  protected close() {
    this.open.set(false);
    // As it closes, the player hands focus back to the thumbnail that opened
    // it. Wait one task for that, then move focus on to the post the viewer
    // stopped at, scrolled into view, so they continue from there.
    setTimeout(() => {
      const thumbnail = this._thumbnails()[this.lastViewed]?.nativeElement;
      thumbnail?.scrollIntoView({ block: 'nearest' });
      thumbnail?.focus({ preventScroll: true });
    });
  }
}

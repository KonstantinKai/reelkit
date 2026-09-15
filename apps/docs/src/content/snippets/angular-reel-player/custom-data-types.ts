import type { BaseContentItem } from '@reelkit/angular-reel-player';

interface MyPost extends BaseContentItem {
  // id: string  — from BaseContentItem
  // media: MediaItem[]  — from BaseContentItem
  title: string;
  tags: string[];
  publishedAt: Date;
}

@Component({
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <rk-reel-player-overlay [isOpen]="isOpen" [content]="posts" (closed)="isOpen = false">
      <ng-template rkPlayerSlideOverlay let-post let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <h3>{{ post.title }}</h3>
            @for (tag of post.tags; track tag) {
              <span>#{{ tag }} </span>
            }
          </div>
        }
      </ng-template>
    </rk-reel-player-overlay>
  `,
})
export class AppComponent {
  isOpen = false;
  posts: MyPost[] = [];
}

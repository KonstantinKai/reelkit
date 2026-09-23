import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesRingListComponent,
  type StoriesGroup,
} from '@reelkit/angular-stories-player';

@Component({
  selector: 'app-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkStoriesOverlayComponent, RkStoriesRingListComponent],
  template: `
    <rk-stories-ring-list [groups]="groups" (selected)="open($event)" />

    <!-- The player reports a close instead of closing itself, so the host
         decides: the ✕ button, a swipe down, Escape and the last story
         finishing all arrive as (closed). -->
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      [initialGroupIndex]="groupIndex()"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class FeedComponent {
  protected readonly groups: StoriesGroup[] = [
    {
      author: { id: 'alice', name: 'Alice', avatar: '/alice.jpg', verified: true },
      stories: [
        { id: 's1', mediaType: 'image', src: '/story-1.jpg' },
        { id: 's2', mediaType: 'video', src: '/story-2.mp4', poster: '/poster-2.jpg' },
      ],
    },
    {
      author: { id: 'bob', name: 'Bob', avatar: '/bob.jpg' },
      stories: [{ id: 's3', mediaType: 'image', src: '/story-3.jpg' }],
    },
  ];

  protected readonly isOpen = signal(false);
  protected readonly groupIndex = signal(0);

  protected open(index: number): void {
    this.groupIndex.set(index);
    this.isOpen.set(true);
  }
}

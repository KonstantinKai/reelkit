import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesRingListComponent,
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/angular-stories-player';

@Component({
  selector: 'app-remembering-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkStoriesOverlayComponent, RkStoriesRingListComponent],
  template: `
    <rk-stories-ring-list [groups]="groups()" [viewed]="viewed" (selected)="open($event)" />
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups()"
      [initialGroupIndex]="groupIndex()"
      [viewed]="viewed"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class RememberingFeedComponent {
  protected readonly groups = signal<StoriesGroup[]>([]);

  // One controller for both: the rings mute as a user is watched to the end,
  // and the player opens each user on their first unseen story. It reads the
  // groups through the signal, so users paged in later are counted too.
  protected readonly viewed = createStoriesViewedStateController({
    storageKey: 'my-app-stories-seen',
    groups: () => this.groups(),
  });

  protected readonly isOpen = signal(false);
  protected readonly groupIndex = signal(0);

  protected open(index: number): void {
    this.groupIndex.set(index);
    this.isOpen.set(true);
  }
}

import {
  RkStoriesRingComponent,
  RkStoriesRingListComponent,
  RkStoryHeaderComponent,
  RkCanvasProgressBarComponent,
  RkImageStorySlideComponent,
  RkVideoStorySlideComponent,
  RkHeartAnimationComponent,
} from '@reelkit/angular-stories-player';

// Each piece the player draws is exported on its own, so a page can build a
// ring row without the overlay, or a slot can rebuild a region out of the
// same parts the player uses.
@Component({
  imports: [RkStoriesRingComponent],
  template: `
    <rk-stories-ring
      [author]="author"
      [totalStories]="5"
      [viewedCount]="2"
      [size]="68"
      (clicked)="open()"
    />
  `,
})
export class RingOnlyComponent {}

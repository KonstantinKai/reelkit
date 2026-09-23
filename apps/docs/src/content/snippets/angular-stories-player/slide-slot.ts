import {
  RkStoriesSlideDirective,
  RkImageStorySlideComponent,
  RkVideoStorySlideComponent,
} from '@reelkit/angular-stories-player';

// A slide template is projected content, so it cannot pick up the player's
// story type on its own — cast to your own feed's type where you know it.
@Component({
  template: `
    <rk-stories-overlay [isOpen]="isOpen()" [groups]="groups" (closed)="isOpen.set(false)">
      <ng-template
        rkStoriesSlide
        let-story
        let-groupIndex="groupIndex"
        let-index="index"
        let-activeGroupIndex="activeGroupIndex"
        let-activeStoryIndex="activeStoryIndex"
        let-onReady="onReady"
        let-onError="onError"
        let-onDurationReady="onDurationReady"
      >
        @if (story.mediaType === 'video') {
          <!-- Every video plays through one shared element, which this slide
               claims while both indexes point at it. -->
          <rk-video-story-slide
            [src]="story.src"
            [poster]="story.poster"
            [groupIndex]="groupIndex"
            [storyIndex]="index"
            [activeGroupIndex]="activeGroupIndex"
            [activeStoryIndex]="activeStoryIndex"
            (durationReady)="onDurationReady($event)"
            (playbackStarted)="onReady()"
            (failed)="onError()"
          />
        } @else {
          <rk-image-story-slide
            [src]="story.src"
            (loaded)="onReady()"
            (failed)="onError()"
          />
        }
      </ng-template>
    </rk-stories-overlay>
  `,
})
export class CustomSlideComponent {}

import { RkTimelineBarComponent } from '@reelkit/angular-reel-player';

@Component({
  standalone: true,
  imports: [RkReelPlayerOverlayComponent, RkTimelineBarComponent],
  template: `
    <rk-reel-player-overlay [isOpen]="isOpen()" [content]="items">
      <!-- Wrap or augment the default bar: -->
      <ng-template rkPlayerTimeline>
        <my-timecode />
        <rk-timeline-bar />
      </ng-template>
    </rk-reel-player-overlay>
  `,
})
export class AppComponent {}

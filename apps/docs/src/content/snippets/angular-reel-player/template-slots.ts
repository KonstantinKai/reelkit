import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  type ContentItem,
  type PlayerSlideOverlayContext,
  type PlayerControlsContext,
  type PlayerNavigationContext,
} from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerNavigationDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
  ],
  template: `
    <rk-reel-player-overlay
      [isOpen]="isOpen"
      [content]="content"
      (closed)="isOpen = false"
    >
      <!-- Custom per-slide overlay: author + likes -->
      <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <div style="display:flex;align-items:center;gap:8px">
              <img [src]="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
              <span style="font-weight:600">{{ item.author.name }}</span>
            </div>
            <p style="margin-top:8px">{{ item.description }}</p>
          </div>
        }
      </ng-template>

      <!-- Custom global controls -->
      <ng-template rkPlayerControls
                   let-onClose
                   let-soundState="soundState">
        <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
          <rk-sound-button [soundState]="soundState" />
          <rk-close-button (click)="onClose()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkPlayerNavigation
                   let-onPrev
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">
          <button (click)="onPrev()" [disabled]="activeIndex === 0">&#9650;</button>
          <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#9660;</button>
        </div>
      </ng-template>

      <!-- Custom playback timeline -->
      <ng-template rkPlayerTimeline let-state="timelineState">
        <div class="rk-reel-timeline" style="padding:0 16px"
             (pointerdown)="bindTrack(track, state); track.focus()">
          <div #track
               role="slider"
               [attr.aria-valuenow]="state.currentTime()"
               style="height:6px;background:rgba(255,255,255,0.2);border-radius:999px">
            <div [style.width.%]="state.progress() * 100"
                 style="height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:999px"></div>
          </div>
        </div>
      </ng-template>
    </rk-reel-player-overlay>
  `,
})
export class AppComponent {
  isOpen = false;
  content: ContentItem[] = [];

  private _trackDispose: (() => void) | null = null;
  /** Wire pointer + keyboard scrub onto your custom track element. */
  bindTrack(el: HTMLElement, state: PlayerTimelineState) {
    this._trackDispose?.();
    this._trackDispose = state.bindInteractions(el);
  }
}

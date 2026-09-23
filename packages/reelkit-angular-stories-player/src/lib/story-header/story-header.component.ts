import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  X,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-angular';
import { formatTimeAgo, type AuthorInfo } from '@reelkit/stories-core';

/**
 * Default header of a playing story: the author, an optional verified badge,
 * how long ago the story was posted, and the sound, pause and close controls.
 *
 * It fades rather than unmounts when `visible` goes false, which is how a
 * long press hides the interface without disturbing playback.
 */
@Component({
  selector: 'rk-story-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ X, Pause, Play, Volume2, VolumeX }),
      multi: true,
    },
  ],
  template: `
    <div
      class="rk-stories-header"
      [class.rk-stories-header--hidden]="!visible()"
    >
      <img
        class="rk-stories-header-avatar"
        [src]="author().avatar"
        [alt]="author().name"
      />
      <span class="rk-stories-header-name">{{ author().name }}</span>
      @if (author().verified) {
        <svg
          class="rk-stories-header-verified"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="12" fill="#3897F0" />
          <path
            d="M9.5 12.5L11 14L15 10"
            stroke="#fff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @if (timeAgo()) {
        <span class="rk-stories-header-time">{{ timeAgo() }}</span>
      }
      <div class="rk-stories-header-actions">
        @if (isLoading() && !isError()) {
          <div class="rk-stories-header-spinner"></div>
        }
        @if (isVideo() && showSoundButton()) {
          <button
            class="rk-stories-header-btn"
            type="button"
            (click)="soundToggled.emit()"
            [attr.aria-label]="isMuted() ? 'Unmute' : 'Mute'"
          >
            <lucide-angular
              [img]="isMuted() ? VolumeXIcon : Volume2Icon"
              [size]="20"
            />
          </button>
        }
        @if (showPauseButton()) {
          <button
            class="rk-stories-header-btn rk-stories-header-btn--desktop"
            type="button"
            (click)="pauseToggled.emit()"
            [attr.aria-label]="isPaused() ? 'Play' : 'Pause'"
          >
            <lucide-angular
              [img]="isPaused() ? PlayIcon : PauseIcon"
              [size]="20"
            />
          </button>
        }
        <button
          class="rk-stories-header-btn"
          type="button"
          (click)="closed.emit()"
          aria-label="Close"
        >
          <lucide-angular [img]="XIcon" [size]="24" />
        </button>
      </div>
    </div>
  `,
})
export class RkStoryHeaderComponent {
  /** Avatar, name and verified flag of the group's author. */
  readonly author = input.required<AuthorInfo>();

  /** When the story was posted; drawn as a relative time. */
  readonly createdAt = input<string | Date | undefined>(undefined);

  /** Picks which pause icon is drawn; the header pauses nothing itself. */
  readonly isPaused = input(false);

  /** Picks which sound icon is drawn; the header mutes nothing itself. */
  readonly isMuted = input(false);

  /** A sound control only makes sense on a video story. */
  readonly isVideo = input(false);

  /** Draws the spinner while the story's media is still arriving. */
  readonly isLoading = input(false);

  /** Media that failed: the spinner goes, since nothing is coming. */
  readonly isError = input(false);

  /**
   * Fades the header out when false, leaving playback alone.
   *
   * @default true
   */
  readonly visible = input(true);

  /**
   * Draws the pause control. Off for a player that does not offer pausing.
   *
   * @default true
   */
  readonly showPauseButton = input(true);

  /**
   * Draws the sound control on a video story.
   *
   * @default true
   */
  readonly showSoundButton = input(true);

  /** The close button is always drawn, so it always needs a home. */
  readonly closed = output<void>();

  /** Emitted by the pause control; the player decides what pausing means. */
  readonly pauseToggled = output<void>();

  /** Emitted by the sound control; the player owns the muted state. */
  readonly soundToggled = output<void>();

  protected readonly timeAgo = computed(() => {
    const createdAt = this.createdAt();
    return createdAt ? formatTimeAgo(createdAt) : '';
  });

  protected readonly XIcon = X;
  protected readonly PauseIcon = Pause;
  protected readonly PlayIcon = Play;
  protected readonly Volume2Icon = Volume2;
  protected readonly VolumeXIcon = VolumeX;
}

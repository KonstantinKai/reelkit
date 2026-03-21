import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { createSharedVideo, captureFrame } from '@reelkit/core';
import { SoundStateService } from '../sound-state/sound-state.service';

/**
 * Shared video element instance — one per application, not per component.
 * Reused across all `RkVideoSlideComponent` instances so that iOS audio
 * context continuity is maintained when navigating between slides.
 */
const shared = createSharedVideo({
  className: 'rk-video-slide-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

/**
 * Renders a single video slide using a shared `<video>` element for iOS
 * sound continuity. Manages playback lifecycle (play/pause on active state),
 * persists playback position, and captures poster frames on deactivation.
 *
 * Must be rendered inside a component that provides `SoundStateService`.
 *
 * @example
 * ```html
 * <rk-video-slide
 *   [src]="item.src"
 *   [poster]="item.poster"
 *   [aspectRatio]="item.aspectRatio"
 *   [width]="size[0]"
 *   [height]="size[1]"
 *   [isActive]="isActive"
 *   [slideKey]="item.id"
 *   (videoRef)="onVideoRef($event)"
 * />
 * ```
 */
@Component({
  selector: 'rk-video-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block;width:100%;height:100%' },
  template: `
    <div
      #container
      class="rk-video-slide-container"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-hidden]="!isActive() || !isInnerActive() || null"
      [style.width.px]="width()"
      [style.height.px]="height()"
    >
      @if (posterSrc()) {
        <img
          [src]="posterSrc()"
          alt=""
          [class]="
            'rk-video-slide-poster' +
            (showPoster() || hasPlayError() ? ' rk-visible' : '')
          "
          [style.object-fit]="isVertical() ? 'cover' : 'contain'"
        />
      }
      @if (!hasPlayError()) {
        <div
          [class]="'rk-video-slide-loader' + (isLoading() ? ' rk-visible' : '')"
        ></div>
      }
    </div>
  `,
})
export class RkVideoSlideComponent {
  readonly src = input.required<string>();
  readonly poster = input<string | undefined>(undefined);
  /** Accessible label describing the video content. */
  readonly ariaLabel = input<string>('');
  readonly aspectRatio = input.required<number>();
  readonly width = input<number>(0);
  readonly height = input<number>(0);
  readonly isActive = input<boolean>(false);

  /**
   * Whether this is the active item within a nested horizontal slider.
   * Defaults to `true` for slides not inside a nested slider.
   */
  readonly isInnerActive = input<boolean>(true);

  readonly slideKey = input.required<string>();

  readonly videoRef = output<HTMLVideoElement | null>();

  protected readonly isLoading = signal(false);
  protected readonly showPoster = signal(true);
  protected readonly posterSrc = signal<string | undefined>(undefined);
  /** Set when the browser blocks autoplay or the video source cannot be played. */
  protected readonly hasPlayError = signal(false);
  protected readonly isVertical = computed(() => this.aspectRatio() < 1);

  private readonly _containerRef =
    viewChild.required<ElementRef<HTMLDivElement>>('container');

  private readonly _soundState = inject(SoundStateService);
  private readonly _zone = inject(NgZone);

  constructor() {
    this._registerPlaybackEffect();
    this._registerMuteEffect();
  }

  /**
   * Manages the full playback lifecycle for the active slide:
   * attaches the shared video element, starts playback, captures frames,
   * and cleans up on deactivation.
   */
  private _registerPlaybackEffect(): void {
    effect((onCleanup) => {
      const shouldPlay = this.isActive() && this.isInnerActive();
      if (!shouldPlay) return;

      const container = untracked(() => this._containerRef().nativeElement);
      const video = shared.getVideo();
      const key = untracked(() => this.slideKey());
      const src = untracked(() => this.src());
      const poster = untracked(() => this.poster());
      const muted = untracked(() => this._soundState.muted());
      const vertical = untracked(() => this.aspectRatio() < 1);

      this.isLoading.set(true);
      this.showPoster.set(true);
      this.hasPlayError.set(false);

      const captured = shared.capturedFrames.get(key);
      this.posterSrc.set(captured ?? poster);

      const handleCanPlay = (): void =>
        this._zone.run(() => this.isLoading.set(false));
      const handleWaiting = (): void =>
        this._zone.run(() => this.isLoading.set(true));
      const handlePlaying = (): void =>
        this._zone.run(() => {
          this.isLoading.set(false);
          this.showPoster.set(false);
        });

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);

      video.src = src;
      video.muted = muted;

      const savedPosition = shared.playbackPositions.get(key);
      video.currentTime = savedPosition ?? 0;
      video.style.objectFit = vertical ? 'cover' : 'contain';

      container.appendChild(video);
      this.videoRef.emit(video);

      this._zone.runOutsideAngular(() => {
        video.play().catch(() => {
          /* autoplay may be blocked */
        });
      });

      onCleanup(() => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);

        // Pause before saving position and removing from DOM. Without this an
        // in-flight play() promise resolves after detachment and resumes audio
        // on a disconnected element — causing audio bleed on Safari / iOS.
        video.pause();

        shared.playbackPositions.set(key, video.currentTime);

        const frame = captureFrame(video);
        if (frame) {
          shared.capturedFrames.set(key, frame);
        }

        if (video.parentNode === container) {
          container.removeChild(video);
        }

        this.videoRef.emit(null);
        this.isLoading.set(false);
        this.hasPlayError.set(false);
      });
    });
  }

  /**
   * Syncs the shared video element's muted state with `SoundStateService`.
   * Only `muted` is a reactive dependency here. The active check is a guard,
   * not a trigger — wrapped in `untracked()` so toggling isActive/isInnerActive
   * does not re-run this effect.
   */
  private _registerMuteEffect(): void {
    effect(() => {
      const muted = this._soundState.muted();
      const isCurrentlyActive = untracked(
        () => this.isActive() && this.isInnerActive(),
      );
      if (!isCurrentlyActive) return;
      shared.getVideo().muted = muted;
    });
  }
}

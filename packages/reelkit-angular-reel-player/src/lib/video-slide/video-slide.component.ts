import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  createSharedVideo,
  captureFrame,
  observeDomEvent,
  createDisposableList,
} from '@reelkit/angular';
import { SoundStateService } from '../sound-state/sound-state.service';

/**
 * Shared video element instance — one per application, not per component.
 * Reused across all `RkVideoSlideComponent` instances so that iOS audio
 * context continuity is maintained when navigating between slides.
 */
export const shared = createSharedVideo({
  className: 'rk-video-slide-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

let activeToken: symbol | null = null;

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
  readonly onReady = input<(() => void) | undefined>(undefined);
  readonly onWaiting = input<(() => void) | undefined>(undefined);
  readonly onError = input<(() => void) | undefined>(undefined);

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
    afterRenderEffect((onCleanup) => {
      const shouldPlay = this.isActive() && this.isInnerActive();
      if (!shouldPlay) return;

      const container = untracked(() => this._containerRef().nativeElement);
      const video = shared.getVideo();
      const key = untracked(() => this.slideKey());
      const src = untracked(() => this.src());
      const poster = untracked(() => this.poster());
      const muted = untracked(() => this._soundState.muted());
      const vertical = untracked(() => this.aspectRatio() < 1);

      untracked(() => {
        this.isLoading.set(true);
        this.showPoster.set(true);
        this.hasPlayError.set(false);

        const captured = shared.capturedFrames.get(key);
        this.posterSrc.set(captured ?? poster);
      });

      const readyFn = untracked(() => this.onReady());
      const waitingFn = untracked(() => this.onWaiting());
      const errorFn = untracked(() => this.onError());

      const handleCanPlay = (): void =>
        this._zone.run(() => {
          this.isLoading.set(false);
          readyFn?.();
        });
      const handleWaiting = (): void =>
        this._zone.run(() => {
          this.isLoading.set(true);
          waitingFn?.();
        });
      const handlePlaying = (): void =>
        this._zone.run(() => {
          this.isLoading.set(false);
          this.showPoster.set(false);
          readyFn?.();
        });

      const token = Symbol();
      activeToken = token;

      const disposables = createDisposableList();
      disposables.push(
        observeDomEvent(video, 'canplay', handleCanPlay),
        observeDomEvent(video, 'waiting', handleWaiting),
        observeDomEvent(video, 'playing', handlePlaying),
        observeDomEvent(video, 'error', () => {
          this._zone.run(() => {
            this.isLoading.set(false);
            this.hasPlayError.set(true);
            errorFn?.();
          });
        }),
      );

      video.pause();
      video.src = src;
      video.muted = muted;

      const savedPosition = shared.playbackPositions.get(key);
      video.currentTime = savedPosition ?? 0;
      video.style.objectFit = vertical ? 'cover' : 'contain';

      video.dataset['slideKey'] = key;
      container.appendChild(video);
      this.videoRef.emit(video);

      video.play().catch(() =>
        this._zone.run(() => {
          this.hasPlayError.set(true);
          errorFn?.();
        }),
      );

      onCleanup(() => {
        disposables.dispose();

        shared.playbackPositions.set(key, video.currentTime);

        const frame = captureFrame(video);
        if (frame) {
          shared.capturedFrames.set(key, frame);
        }

        // Only pause and remove if no new slide has taken ownership
        if (activeToken === token) {
          video.pause();
          activeToken = null;
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

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  afterRenderEffect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { createSharedVideo, captureFrame } from '@reelkit/angular';

/**
 * Module-scoped shared video singleton. One per lightbox usage.
 * The shared `<video>` element enables iOS sound continuity across slide changes.
 */
const shared = createSharedVideo({
  className: 'rk-lightbox-video-element',
});

/**
 * Module-scoped muted state mirrored onto the shared video element.
 * Mutated exclusively through {@link setLightboxVideoMuted}.
 */
let currentMuted = true;
let activeToken: symbol | null = null;

/**
 * Set the muted state on the shared video element directly.
 * Call this from your custom controls toggle handler — no re-render needed.
 */
export const setLightboxVideoMuted = (muted: boolean): void => {
  currentMuted = muted;
  shared.getVideo().muted = muted;
};

/**
 * Lightweight video slide component for the lightbox.
 *
 * Uses a shared `<video>` element (same pattern as reel-player) for iOS
 * sound continuity. Manages playback lifecycle, persists playback position,
 * and captures poster frames on deactivation.
 *
 * Use via a custom `rkLightboxSlide` template:
 * ```html
 * <ng-template rkLightboxSlide let-item let-size="size" let-isActive="isActive">
 *   <rk-lightbox-video-slide
 *     *ngIf="item.type === 'video'"
 *     [src]="item.src"
 *     [poster]="item.poster"
 *     [isActive]="isActive"
 *     [size]="size"
 *     [slideKey]="item.src"
 *   />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-lightbox-video-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../styles/lightbox-video-slide.css'],
  template: `
    <div
      #container
      class="rk-lightbox-video-container"
      [style.width.px]="size()[0]"
      [style.height.px]="size()[1]"
    >
      @if (posterSrc()) {
        <img
          [src]="posterSrc()"
          alt=""
          class="rk-lightbox-video-poster"
          [class.rk-visible]="!isActive() || showPoster() || hasPlayError()"
          style="object-fit: contain"
        />
      }
      @if (!hasPlayError()) {
        <div
          class="rk-lightbox-video-loader"
          [class.rk-visible]="isLoading()"
          aria-hidden="true"
        ></div>
      }
      <span
        class="rk-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        >{{
          hasPlayError()
            ? 'Video unavailable'
            : isLoading()
              ? 'Video loading'
              : isActive() && !showPoster()
                ? 'Video playing'
                : ''
        }}</span
      >
    </div>
  `,
})
export class RkLightboxVideoSlideComponent implements OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly containerRef =
    viewChild<ElementRef<HTMLDivElement>>('container');

  /** URL of the video source. */
  readonly src = input.required<string>();

  /** Optional poster image shown while video loads. */
  readonly poster = input<string | undefined>(undefined);

  /** Whether this slide is the active (visible) slide. */
  readonly isActive = input.required<boolean>();

  /** `[width, height]` in pixels. */
  readonly size = input.required<[number, number]>();

  /** Unique key for persisting playback position and captured frames. */
  readonly slideKey = input.required<string>();

  protected readonly isLoading = signal(false);
  protected readonly showPoster = signal(true);
  protected readonly posterSrc = signal<string | undefined>(undefined);
  /** Set when the browser blocks autoplay or the video source cannot be played. */
  protected readonly hasPlayError = signal(false);

  private deactivate: (() => void) | null = null;

  constructor() {
    afterRenderEffect(() => {
      const active = this.isActive();
      const src = this.src();
      const slideKey = this.slideKey();
      const poster = this.poster();

      this.runDeactivation();

      if (active) {
        // Read the view-child ref outside the reactive context so changes to
        // the ViewChild signal (e.g. after a re-render) do not cause the effect
        // to re-execute and trigger an extra activate/deactivate cycle.
        this.activate(src, slideKey, poster);
      }
    });
  }

  ngOnDestroy(): void {
    this.runDeactivation();
  }

  private runDeactivation(): void {
    if (this.deactivate) {
      this.deactivate();
      this.deactivate = null;
    }
  }

  private activate(
    src: string,
    slideKey: string,
    poster: string | undefined,
  ): void {
    // Read the view-child ref outside the reactive context so this method
    // (called from an effect) doesn't subscribe to containerRef changes.
    const containerEl = untracked(() => this.containerRef());
    if (!containerEl) return;

    const container = containerEl.nativeElement;
    const video = shared.getVideo();

    this.isLoading.set(true);
    this.showPoster.set(true);
    this.hasPlayError.set(false);
    this.posterSrc.set(shared.capturedFrames.get(slideKey) ?? poster);

    const onCanPlay = (): void => {
      this.ngZone.run(() => this.isLoading.set(false));
    };
    const onWaiting = (): void => {
      this.ngZone.run(() => this.isLoading.set(true));
    };
    const onPlaying = (): void => {
      this.ngZone.run(() => {
        this.isLoading.set(false);
        this.showPoster.set(false);
      });
    };

    const token = Symbol();
    activeToken = token;

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    video.pause();
    video.src = src;
    video.muted = currentMuted;
    video.style.objectFit = 'contain';
    video.currentTime = shared.playbackPositions.get(slideKey) ?? 0;

    container.appendChild(video);
    video.play().catch(() =>
      this.ngZone.run(() => {
        this.isLoading.set(false);
        this.hasPlayError.set(true);
      }),
    );

    this.deactivate = () =>
      this.deactivateVideo(
        token,
        video,
        container,
        slideKey,
        onCanPlay,
        onWaiting,
        onPlaying,
      );
  }

  private deactivateVideo(
    token: symbol,
    video: HTMLVideoElement,
    container: HTMLDivElement,
    slideKey: string,
    onCanPlay: () => void,
    onWaiting: () => void,
    onPlaying: () => void,
  ): void {
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('waiting', onWaiting);
    video.removeEventListener('playing', onPlaying);

    shared.playbackPositions.set(slideKey, video.currentTime);

    const frame = captureFrame(video);
    if (frame) {
      shared.capturedFrames.set(slideKey, frame);
    }

    if (activeToken === token) {
      video.pause();
      activeToken = null;
    }

    if (video.parentNode === container) {
      container.removeChild(video);
    }

    this.ngZone.run(() => {
      this.isLoading.set(false);
      this.showPoster.set(true);
      this.hasPlayError.set(false);
    });
  }
}

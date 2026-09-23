import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  SoundStateService,
  captureFrame,
  createDisposableList,
  createSharedVideo,
  noop,
  observeDomEvent,
  reaction,
  syncMutedToVideo,
  type CoreSignal,
  type DisposableList,
} from '@reelkit/angular';

/**
 * The one `<video>` every story slide borrows. A single element is what keeps
 * audio alive on iOS as the player moves from story to story; a fresh element
 * per slide loses the user gesture that allowed sound in the first place.
 */
const shared = createSharedVideo({
  className: 'rk-stories-video-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

/**
 * The element the slides share, for the player itself: pausing playback when
 * the viewer holds a press reaches the same `<video>` the active slide holds.
 *
 * @internal
 */
export const sharedStoryVideo = (): HTMLVideoElement => shared.getVideo();

/**
 * One video story.
 *
 * Which slide owns the shared element is decided from the controller's own
 * signals rather than from rendering: a slide claims the video when both
 * indexes point at it, and hands it back when they move on. Going through
 * change detection instead would put a frame between the two, and the
 * viewer would see the gap.
 */
@Component({
  selector: 'rk-video-story-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div #container class="rk-stories-video">
      @if (resolvedPoster()) {
        <img
          [src]="resolvedPoster()"
          alt=""
          class="rk-stories-video-poster"
          [class.rk-stories-video-poster--visible]="showPoster()"
        />
      }
    </div>
  `,
})
export class RkVideoStorySlideComponent {
  private readonly _ngZone = inject(NgZone);

  /**
   * Sound state the player provides. A slide rendered from a slot template
   * finds it too: the player renders every slot through its own injector, so
   * this resolves the same way whichever template drew the slide.
   */
  private readonly _soundState = inject(SoundStateService);

  private readonly _containerRef =
    viewChild.required<ElementRef<HTMLDivElement>>('container');

  /** Loaded only while this slide is the active one. */
  readonly src = input.required<string>();

  /** Shown until playback starts. A frame captured from an earlier play wins. */
  readonly poster = input<string | undefined>(undefined);

  /** Where this slide sits. Matched against the two signals below. */
  readonly groupIndex = input.required<number>();

  /** Where this slide sits. Matched against the two signals below. */
  readonly storyIndex = input.required<number>();

  /** Both signals equal to the pair above means this slide owns the video. */
  readonly activeGroupIndex = input.required<CoreSignal<number>>();

  /** Both signals equal to the pair above means this slide owns the video. */
  readonly activeStoryIndex = input.required<CoreSignal<number>>();

  /** Real length of the media, so the timer matches the video. */
  readonly durationReady = output<number>();

  /** Playback started: the story is on screen rather than buffering. */
  readonly playbackStarted = output<void>();

  /** Playback stalled mid-story. */
  readonly buffering = output<void>();

  /** The story is over; the player moves on rather than waiting for the timer. */
  readonly finished = output<void>();

  /** Covers a source that will not load and a play the browser refused. */
  readonly failed = output<void>();

  protected readonly showPoster = signal(true);

  protected readonly resolvedPoster = computed(
    () => shared.capturedFrames.get(this.src()) ?? this.poster() ?? '',
  );

  constructor() {
    afterRenderEffect(() => {
      const src = this.src();
      const groupIndex = this.groupIndex();
      const storyIndex = this.storyIndex();

      // Everything else is read untracked: this effect re-runs only when the
      // slide's own identity changes, never on a tick or a sound toggle.
      const container = untracked(() => this._containerRef().nativeElement);
      const activeGroupIndex = untracked(() => this.activeGroupIndex());
      const activeStoryIndex = untracked(() => this.activeStoryIndex());

      let active = false;
      let activeDisposables: DisposableList | null = null;

      const activate = (): void => {
        const video = shared.getVideo();
        const srcChanged = !video.src.endsWith(src);

        this.showPoster.set(true);

        // Listeners go on before src, currentTime or play are touched: a
        // cached video fires those events synchronously, and a listener
        // attached afterwards never hears them.
        activeDisposables = createDisposableList();
        activeDisposables.push(
          observeDomEvent(video, 'loadedmetadata', () => {
            if (video.duration && isFinite(video.duration)) {
              this._ngZone.run(() =>
                this.durationReady.emit(video.duration * 1000),
              );
            }
          }),
          observeDomEvent(video, 'canplay', () =>
            this._ngZone.run(() => this.playbackStarted.emit()),
          ),
          observeDomEvent(video, 'waiting', () =>
            this._ngZone.run(() => this.buffering.emit()),
          ),
          observeDomEvent(video, 'playing', () =>
            this._ngZone.run(() => this.showPoster.set(false)),
          ),
          observeDomEvent(video, 'ended', () =>
            this._ngZone.run(() => this.finished.emit()),
          ),
          observeDomEvent(video, 'error', () => {
            if (video.error) this._ngZone.run(() => this.failed.emit());
          }),
        );

        if (srcChanged) video.src = src;
        video.currentTime = 0;
        video.muted = untracked(() => this._soundState.muted());
        video.loop = false;
        video.style.objectFit = 'cover';
        video.style.width = '100%';
        video.style.height = '100%';

        container.appendChild(video);

        if (
          video.readyState >= 1 &&
          video.duration &&
          isFinite(video.duration)
        ) {
          this._ngZone.run(() =>
            this.durationReady.emit(video.duration * 1000),
          );
        }

        video.play().catch(noop);
      };

      const deactivate = (): void => {
        activeDisposables?.dispose();
        activeDisposables = null;

        const video = shared.getVideo();
        // Pause and detach only while the video is still here: the next
        // slide's activate may already have claimed it, since appendChild
        // takes it out of this container on its own.
        if (video.parentNode === container) {
          const frame = captureFrame(video);
          if (frame) shared.capturedFrames.set(src, frame);
          video.pause();
          container.removeChild(video);
        }
        this.showPoster.set(true);
      };

      const isMine = (): boolean =>
        activeGroupIndex.value === groupIndex &&
        activeStoryIndex.value === storyIndex;

      const disposables = createDisposableList();
      disposables.push(
        reaction(
          () => [activeGroupIndex, activeStoryIndex],
          () => {
            const shouldBeActive = isMine();
            if (shouldBeActive && !active) {
              active = true;
              activate();
            } else if (!shouldBeActive && active) {
              active = false;
              deactivate();
            }
          },
        ),
        syncMutedToVideo(
          untracked(() => this._soundState.controller),
          shared.getVideo(),
        ),
        () => {
          if (active) deactivate();
        },
      );

      if (isMine()) {
        active = true;
        activate();
      }

      return () => disposables.dispose();
    });
  }
}

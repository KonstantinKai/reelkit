import { DestroyRef, Injectable, inject } from '@angular/core';
import {
  createTimelineController,
  noop,
  toAngularSignal,
  type TimelineController,
} from '@reelkit/angular';
import { shared as sharedVideo } from '../video-slide/video-slide.component';

/**
 * Angular DI wrapper around core's `createTimelineController`.
 *
 * Provided at the component level by `RkReelPlayerOverlayComponent` so that
 * each player instance has its own isolated timeline state. Coordinates
 * video pause/resume around user scrubbing: the shared video pauses on
 * scrub start and resumes on scrub end if it was playing before.
 */
@Injectable()
export class TimelineStateService {
  private _wasPlaying = false;
  private readonly _ctrl: TimelineController = createTimelineController({
    onScrubStart: () => {
      const video = sharedVideo.getVideo();
      this._wasPlaying = !video.paused;
      if (!video.paused) video.pause();
    },
    onScrubEnd: () => {
      if (this._wasPlaying) {
        sharedVideo.getVideo().play().catch(noop);
      }
      this._wasPlaying = false;
    },
  });

  private readonly _destroyRef = inject(DestroyRef);

  readonly duration = toAngularSignal(this._ctrl.duration, this._destroyRef);
  readonly currentTime = toAngularSignal(
    this._ctrl.currentTime,
    this._destroyRef,
  );
  readonly progress = toAngularSignal(this._ctrl.progress, this._destroyRef);
  readonly bufferedRanges = toAngularSignal(
    this._ctrl.bufferedRanges,
    this._destroyRef,
  );
  readonly isScrubbing = toAngularSignal(
    this._ctrl.isScrubbing,
    this._destroyRef,
  );

  get controller(): TimelineController {
    return this._ctrl;
  }

  attach(video: HTMLVideoElement): void {
    this._ctrl.attach(video);
  }

  detach(): void {
    this._ctrl.detach();
  }

  seek(seconds: number): void {
    this._ctrl.seek(seconds);
  }
}

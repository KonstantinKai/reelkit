import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { TimelineStateService } from '../timeline-state/timeline-state.service';

/**
 * Default playback timeline bar for the Angular reel-player overlay.
 *
 * Reads state from the provided `TimelineStateService` and renders a DOM
 * track with buffered segments, a progress fill, and a draggable cursor.
 * Wires pointer + keyboard scrubbing through `bindInteractions`.
 */
@Component({
  selector: 'rk-timeline-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="rk-reel-timeline">
      <div
        #track
        class="rk-reel-timeline-track"
        role="slider"
        aria-label="Seek"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="ariaMax()"
        [attr.aria-valuenow]="timeline.currentTime()"
        [attr.aria-valuetext]="timecode()"
        tabindex="0"
        [attr.data-scrubbing]="timeline.isScrubbing() ? '' : null"
      >
        @for (range of timeline.bufferedRanges(); track $index) {
          <div
            class="rk-reel-timeline-buffered"
            [style.left.%]="range.start * 100"
            [style.width.%]="(range.end - range.start) * 100"
          ></div>
        }
        <div
          class="rk-reel-timeline-fill"
          [style.width.%]="timeline.progress() * 100"
        ></div>
        <div
          class="rk-reel-timeline-cursor"
          [style.left.%]="timeline.progress() * 100"
          [attr.data-scrubbing]="timeline.isScrubbing() ? '' : null"
        ></div>
      </div>
    </div>
  `,
})
export class RkTimelineBarComponent {
  protected readonly timeline = inject(TimelineStateService);
  private readonly _track =
    viewChild.required<ElementRef<HTMLDivElement>>('track');
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly ariaMax = computed(() => {
    const d = this.timeline.duration();
    return Number.isFinite(d) ? d : 0;
  });

  protected readonly timecode = computed(() => {
    const seconds = this.timeline.currentTime();
    const duration = this.timeline.duration();
    if (!Number.isFinite(duration) || duration <= 0) return '';
    const clamped = Math.max(0, Math.min(seconds, duration));
    const m = Math.floor(clamped / 60);
    const s = Math.floor(clamped % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  });

  constructor() {
    afterNextRender(() => {
      const dispose = this.timeline.controller.bindInteractions(
        this._track().nativeElement,
      );
      this._destroyRef.onDestroy(dispose);
    });
  }
}

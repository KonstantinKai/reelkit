import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import { type ReelApi } from '@reelkit/angular';
import { RkImageSlideComponent } from '../image-slide/image-slide.component';
import { RkVideoSlideComponent } from '../video-slide/video-slide.component';
import { RkNestedSliderComponent } from '../nested-slider/nested-slider.component';
import type {
  BaseContentItem,
  MediaType,
  PlayerNestedNavigationContext,
  PlayerNestedSlideContext,
} from '../types';

/**
 * Dispatches to the appropriate slide component based on the content item's
 * media array:
 *
 * - Single image  → `rk-image-slide`
 * - Single video  → `rk-video-slide`
 * - Multiple items → `rk-nested-slider` (horizontal carousel)
 *
 * @internal Used by `RkReelPlayerOverlayComponent` as the default slide renderer.
 */
@Component({
  selector: 'rk-media-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block;width:100%;height:100%' },
  imports: [
    RkImageSlideComponent,
    RkVideoSlideComponent,
    RkNestedSliderComponent,
  ],
  styles: [
    `
      .rk-media-slide-empty {
        background-color: #000;
        display: block;
      }
    `,
  ],
  template: `
    @let m = content().media;

    @if (m.length === 0) {
      <div
        class="rk-media-slide-empty"
        [style.width.px]="width()"
        [style.height.px]="height()"
        aria-hidden="true"
      ></div>
    } @else if (m.length === 1 && m[0].type === 'image') {
      <rk-image-slide
        [src]="m[0].src"
        [poster]="m[0].poster"
        [width]="width()"
        [height]="height()"
        [isActive]="isActive()"
        [onReady]="onReady()"
        [onWaiting]="onWaiting()"
        [onError]="onError()"
      />
    } @else if (m.length === 1 && m[0].type === 'video') {
      <rk-video-slide
        [src]="m[0].src"
        [poster]="m[0].poster"
        [aspectRatio]="m[0].aspectRatio"
        [width]="width()"
        [height]="height()"
        [isActive]="isActive()"
        [slideKey]="content().id"
        [onReady]="onReady()"
        [onWaiting]="onWaiting()"
        [onError]="onError()"
        (videoRef)="videoRef.emit($event)"
      />
    } @else {
      <rk-nested-slider
        [media]="m"
        [isActive]="isActive()"
        [width]="width()"
        [height]="height()"
        [slideKey]="content().id"
        [enableWheel]="enableWheel()"
        [onReady]="onReady()"
        [onWaiting]="onWaiting()"
        [onError]="onError()"
        [nestedSlideTemplate]="nestedSlideTemplate()"
        [nestedNavTemplate]="nestedNavTemplate()"
        (videoRef)="videoRef.emit($event)"
        (innerMediaType)="innerMediaType.emit($event)"
        (innerApiReady)="innerApiReady.emit($event)"
      />
    }
  `,
})
export class RkMediaSlideComponent {
  readonly content = input.required<BaseContentItem>();
  readonly isActive = input<boolean>(false);
  readonly width = input<number>(0);
  readonly height = input<number>(0);
  readonly enableWheel = input<boolean>(false);
  readonly onReady = input<(() => void) | undefined>(undefined);
  readonly onWaiting = input<(() => void) | undefined>(undefined);
  readonly onError = input<(() => void) | undefined>(undefined);
  readonly nestedSlideTemplate =
    input<TemplateRef<PlayerNestedSlideContext> | null>(null);
  readonly nestedNavTemplate =
    input<TemplateRef<PlayerNestedNavigationContext> | null>(null);

  readonly videoRef = output<HTMLVideoElement | null>();
  readonly innerMediaType = output<MediaType>();
  readonly innerApiReady = output<ReelApi>();

  readonly nestedSlider = viewChild(RkNestedSliderComponent);
}

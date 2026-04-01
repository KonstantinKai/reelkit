import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  type ReelApi,
} from '@reelkit/angular';
import { RkVideoSlideComponent } from '../video-slide/video-slide.component';
import { RkImageSlideComponent } from '../image-slide/image-slide.component';
import type {
  MediaItem,
  MediaType,
  PlayerNestedNavigationContext,
  PlayerNestedSlideContext,
} from '../types';

/**
 * Horizontal nested slider for multi-media content items (e.g. an Instagram
 * carousel post with both images and videos).
 *
 * Renders a horizontal `rk-reel` inside a vertical slide, with indicator dots
 * and left/right navigation arrows. Syncs its active ref with the parent
 * player for coordinated drag/unobserve behavior.
 *
 * @internal Used by `RkMediaSlideComponent` when a content item has multiple media assets.
 */
@Component({
  selector: 'rk-nested-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block;width:100%;height:100%' },
  imports: [
    NgTemplateOutlet,
    LucideAngularModule,
    ReelComponent,
    ReelIndicatorComponent,
    RkReelItemDirective,
    RkVideoSlideComponent,
    RkImageSlideComponent,
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ ChevronLeft, ChevronRight }),
      multi: true,
    },
  ],
  template: `
    <div
      class="rk-nested-slider-inner"
      role="region"
      aria-label="Media carousel"
      [style.width.px]="width()"
      [style.height.px]="height()"
    >
      <rk-reel
        [count]="media().length"
        [size]="size()"
        direction="horizontal"
        [loop]="false"
        [useNavKeys]="true"
        [enableWheel]="enableWheel()"
        [class.rk-nested-active]="isActive()"
        (apiReady)="onInnerApiReady($event)"
        (beforeChange)="onBeforeChange()"
        (afterChange)="onAfterChange($event)"
      >
        <ng-template rkReelItem let-index let-size="size">
          @let item = mediaAt(index);
          @let isInnerActive = innerActiveIndex() === index;
          @let key = slideKey() + ':' + item.id;

          @if (nestedSlideTemplate()) {
            <ng-container
              [ngTemplateOutlet]="nestedSlideTemplate()!"
              [ngTemplateOutletContext]="{
                $implicit: item,
                index: index,
                size: size,
                isActive: isActive(),
                isInnerActive: isInnerActive,
                slideKey: key,
              }"
            />
          } @else {
            @if (item.type === 'video') {
              <rk-video-slide
                [src]="item.src"
                [poster]="item.poster"
                [aspectRatio]="item.aspectRatio"
                [width]="size[0]"
                [height]="size[1]"
                [isActive]="isActive()"
                [isInnerActive]="isInnerActive"
                [slideKey]="key"
                [onReady]="isInnerActive ? onReady() : undefined"
                [onWaiting]="isInnerActive ? onWaiting() : undefined"
                [onError]="isInnerActive ? onError() : undefined"
                (videoRef)="
                  isInnerActive || !$event ? onVideoRef($event) : null
                "
              />
            } @else {
              <rk-image-slide
                [src]="item.src"
                [width]="size[0]"
                [height]="size[1]"
                [onReady]="isInnerActive ? onReady() : undefined"
                [onError]="isInnerActive ? onError() : undefined"
              />
            }
          }
        </ng-template>
      </rk-reel>

      @if (media().length > 1) {
        <div class="rk-nested-indicator">
          <rk-reel-indicator
            [count]="media().length"
            [active]="innerActiveIndex()"
            direction="horizontal"
            [visible]="5"
            [radius]="3"
            [gap]="4"
            activeColor="#fff"
            inactiveColor="rgba(255,255,255,0.4)"
            (dotClick)="onDotClick($event)"
          />
        </div>
      }

      @if (media().length > 1) {
        @if (nestedNavTemplate()) {
          <ng-container
            [ngTemplateOutlet]="nestedNavTemplate()!"
            [ngTemplateOutletContext]="{
              $implicit: onPrevFn,
              media: media()[innerActiveIndex()],
              onPrev: onPrevFn,
              onNext: onNextFn,
              activeIndex: innerActiveIndex(),
              count: media().length,
            }"
          />
        } @else {
          @if (innerActiveIndex() > 0) {
            <button
              class="rk-nested-nav rk-nested-nav-prev"
              (click)="onPrev()"
              aria-label="Previous media"
            >
              <lucide-angular [img]="ChevronLeftIcon" [size]="24" />
            </button>
          }
          @if (innerActiveIndex() < media().length - 1) {
            <button
              class="rk-nested-nav rk-nested-nav-next"
              (click)="onNext()"
              aria-label="Next media"
            >
              <lucide-angular [img]="ChevronRightIcon" [size]="24" />
            </button>
          }
        }
      }
    </div>
  `,
})
export class RkNestedSliderComponent {
  readonly media = input.required<MediaItem[]>();
  readonly isActive = input<boolean>(false);
  readonly width = input<number>(0);
  readonly height = input<number>(0);
  readonly slideKey = input.required<string>();
  readonly enableWheel = input<boolean>(false);
  readonly onReady = input<(() => void) | undefined>(undefined);
  readonly onWaiting = input<(() => void) | undefined>(undefined);
  readonly onError = input<(() => void) | undefined>(undefined);
  readonly nestedSlideTemplate =
    input<TemplateRef<PlayerNestedSlideContext> | null>(null);
  readonly nestedNavTemplate =
    input<TemplateRef<PlayerNestedNavigationContext> | null>(null);

  readonly innerActiveIndexChange = output<number>();
  readonly videoRef = output<HTMLVideoElement | null>();
  readonly innerMediaType = output<MediaType>();
  readonly innerApiReady = output<ReelApi>();

  /**
   * Tracks the active inner slide index. Automatically resets to `0` when the
   * `media` input changes (e.g. the parent swaps to a different content item),
   * preventing a stale index from pointing beyond the bounds of the new array.
   */
  readonly innerActiveIndex = linkedSignal(() => {
    void this.media();
    return 0;
  });

  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;

  /**
   * Stable arrow-function references for template context objects.
   * Avoids creating new function instances on every change-detection cycle.
   */
  readonly onPrevFn = (): void => this.onPrev();
  readonly onNextFn = (): void => this.onNext();

  readonly size = computed<[number, number]>(() => [
    this.width(),
    this.height(),
  ]);

  private _innerApi: ReelApi | null = null;
  private _videoEl: HTMLVideoElement | null = null;

  constructor() {
    effect(() => {
      if (this.isActive()) {
        const idx = this.innerActiveIndex();
        const items = this.media();
        if (items[idx]) {
          this.innerMediaType.emit(items[idx].type);
        }
      }
    });
  }

  mediaAt(index: number): MediaItem {
    // Guard against transient out-of-bounds access during media array changes.
    // The linkedSignal resets innerActiveIndex to 0 on media change, but the
    // virtual reel may still request the old index in the same render cycle.
    return this.media()[index] ?? this.media()[0];
  }

  onInnerApiReady(api: ReelApi): void {
    this._innerApi = api;
    this.innerApiReady.emit(api);
  }

  onAfterChange(event: { index: number }): void {
    this.innerActiveIndex.set(event.index);
    this.innerActiveIndexChange.emit(event.index);
    const items = this.media();
    const item = items[event.index];
    if (item) {
      this.innerMediaType.emit(item.type);
      if (item.type === 'image') {
        this.onReady()?.();
      }
    }
  }

  onBeforeChange(): void {
    if (this._videoEl && !this._videoEl.paused) {
      this._videoEl.pause();
    }
  }

  onVideoRef(ref: HTMLVideoElement | null): void {
    this._videoEl = ref;
    this.videoRef.emit(ref);
  }

  onDotClick(index: number): void {
    this._innerApi?.goTo(index, true);
  }

  onPrev(): void {
    this._innerApi?.prev();
  }

  onNext(): void {
    this._innerApi?.next();
  }

  unobserve(): void {
    this._innerApi?.unobserve();
  }

  observe(): void {
    this._innerApi?.observe();
  }
}

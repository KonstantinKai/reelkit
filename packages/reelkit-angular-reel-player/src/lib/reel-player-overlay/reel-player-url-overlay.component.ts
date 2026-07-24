import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  contentChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import type { UrlStateController } from '@reelkit/angular';
import { RkReelPlayerOverlayComponent } from './reel-player-overlay.component';
import {
  RkPlayerSlideDirective,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerTimelineDirective,
  RkPlayerNavigationDirective,
  RkPlayerNestedSlideDirective,
  RkPlayerNestedNavigationDirective,
  RkPlayerLoadingDirective,
  RkPlayerErrorDirective,
} from '../template-slots/player-template-slots';
import type { BaseContentItem, ContentItem, TimelineMode } from '../types';

/**
 * Full-screen reel player whose open state lives in the URL.
 *
 * Same player as {@link RkReelPlayerOverlayComponent}; the difference is who
 * decides it is open. Here that is a `UrlStateController` built with
 * `createOverlayUrlState`, so the visible slide has an address: it can be
 * linked to, shared, opened in a new tab, and closed with the back button.
 *
 * Opening pushes one history entry and every slide after replaces it, so
 * paging a feed costs nothing and a single back step always leaves. The
 * parameter addresses the vertical feed index only — which image a multi-media
 * post is showing is not carried in the URL.
 *
 * @example
 * ```ts
 * protected readonly reel = createOverlayUrlState({
 *   param: 'reel',
 *   ...indexKey(() => this.content().length),
 * });
 * ```
 * ```html
 * <a [routerLink]="[]" [queryParams]="{ reel: 0 }">Open</a>
 * <rk-reel-player-url-overlay [controller]="reel" [content]="content()" />
 * ```
 */
@Component({
  selector: 'rk-reel-player-url-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <rk-reel-player-overlay
      [isOpen]="index() !== null"
      [initialIndex]="index() ?? 0"
      [content]="content()"
      [ariaLabel]="ariaLabel()"
      [aspectRatio]="aspectRatio()"
      [transitionDuration]="transitionDuration()"
      [swipeDistanceFactor]="swipeDistanceFactor()"
      [loop]="loop()"
      [enableNavKeys]="enableNavKeys()"
      [enableWheel]="enableWheel()"
      [wheelDebounceMs]="wheelDebounceMs()"
      [timeline]="timeline()"
      [timelineMinDurationSeconds]="timelineMinDurationSeconds()"
      [slideTemplate]="slideSlot()?.templateRef"
      [slideOverlayTemplate]="slideOverlaySlot()?.templateRef"
      [controlsTemplate]="controlsSlot()?.templateRef"
      [timelineTemplate]="timelineSlot()?.templateRef"
      [navigationTemplate]="navigationSlot()?.templateRef"
      [nestedSlideTemplate]="nestedSlideSlot()?.templateRef"
      [nestedNavTemplate]="nestedNavSlot()?.templateRef"
      [loadingTemplate]="loadingSlot()?.templateRef"
      [errorTemplate]="errorSlot()?.templateRef"
      (closed)="handleClosed()"
      (slideChange)="handleSlideChange($event)"
    />
    <!-- Declares the projection outlet so the slot directives are instantiated
         and the queries below have something to match. Every slot is an
         <ng-template>, so nothing renders here. -->
    <ng-content />
  `,
})
export class RkReelPlayerUrlOverlayComponent<
  T extends BaseContentItem = ContentItem,
> {
  /**
   * Controller from `createOverlayUrlState`. Its `index` decides whether the
   * player is open and which slide it shows; this component writes back through
   * it on slide change and on close.
   */
  readonly controller = input.required<UrlStateController>();

  readonly content = input.required<T[]>();

  readonly ariaLabel = input<string>('Video player');
  readonly aspectRatio = input<number | undefined>(undefined);
  readonly transitionDuration = input<number>(300);
  readonly swipeDistanceFactor = input<number>(0.12);
  readonly loop = input<boolean>(false);
  readonly enableNavKeys = input<boolean>(true);
  readonly enableWheel = input<boolean>(true);
  readonly wheelDebounceMs = input<number>(200);
  readonly timeline = input<TimelineMode>('auto');
  readonly timelineMinDurationSeconds = input<number>(30);

  /** Emitted after the player closes. The URL drives closing, not this. */
  readonly closed = output<void>();

  readonly slideChange = output<number>();

  /**
   * The slot queries run here, not on the inner component.
   *
   * A `contentChild` query does not reach through a wrapper's `<ng-content>`,
   * so projecting the consumer's templates inward would leave every slot
   * unmatched. Reading them here — where the content is direct — and passing
   * each `TemplateRef` down as an input is what makes the wrapper viable.
   */
  protected readonly slideSlot = contentChild(RkPlayerSlideDirective<T>);
  protected readonly slideOverlaySlot = contentChild(
    RkPlayerSlideOverlayDirective<T>,
  );
  protected readonly controlsSlot = contentChild(RkPlayerControlsDirective<T>);
  protected readonly timelineSlot = contentChild(RkPlayerTimelineDirective<T>);
  protected readonly navigationSlot = contentChild(RkPlayerNavigationDirective);
  protected readonly nestedSlideSlot = contentChild(
    RkPlayerNestedSlideDirective,
  );
  protected readonly nestedNavSlot = contentChild(
    RkPlayerNestedNavigationDirective,
  );
  protected readonly loadingSlot = contentChild(RkPlayerLoadingDirective);
  protected readonly errorSlot = contentChild(RkPlayerErrorDirective);

  protected readonly index = signal<number | null>(null);

  constructor() {
    // The controller arrives as an input, so it cannot be read in a field
    // initialiser. An effect defers until it is bound, and re-subscribes if a
    // different controller is ever passed — its cleanup drops the old
    // subscription, so nothing keeps writing from a controller we let go of.
    effect((onCleanup) => {
      const controller = this.controller();
      const sync = () => this.index.set(controller.index.value);

      sync();
      onCleanup(controller.index.observe(sync));
    });
  }

  protected handleClosed(): void {
    this.controller().set(null);
    this.closed.emit();
  }

  protected handleSlideChange(index: number): void {
    this.controller().set(index);
    this.slideChange.emit(index);
  }
}

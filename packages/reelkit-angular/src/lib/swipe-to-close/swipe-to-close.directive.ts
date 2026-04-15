import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  abs,
  clamp,
  createGestureController,
  type GestureController,
} from '@reelkit/core';

const _kDismissThresholdFraction = 0.2;
const _kOpacityProgressNormaliser = 0.3;
const _kOpacityDragReduction = 0.8;
const _kAnimationDurationMs = 300;

/** Swipe direction for the {@link RkSwipeToCloseDirective} gesture. */
export type SwipeToCloseDirection = 'up' | 'down';

/**
 * Attribute directive that adds a vertical swipe-to-dismiss gesture to
 * its host element.
 *
 * When `rkSwipeToClose` is `true`, the directive attaches a
 * {@link GestureController} (touch-only) that:
 * - Translates the host along the swipe direction and fades it out
 * - Emits `dismissed` when the drag distance exceeds 20 % of viewport height
 * - Animates back to the original position if the threshold is not met
 *
 * Gesture callbacks run outside `NgZone` to avoid unnecessary
 * change detection cycles; DOM mutations are applied via `Renderer2`.
 *
 * @example
 * ```html
 * <div [rkSwipeToClose]="isMobile" rkSwipeToCloseDirection="up"
 *      (dismissed)="handleClose()">
 *   ...slider content...
 * </div>
 * ```
 */
@Directive({
  selector: '[rkSwipeToClose]',
})
export class RkSwipeToCloseDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly renderer = inject(Renderer2);

  /** When `true`, the swipe-to-close gesture is active. */
  readonly rkSwipeToClose = input<boolean>(false);

  /**
   * Swipe direction that triggers the close gesture.
   * @default 'up'
   */
  readonly rkSwipeToCloseDirection = input<SwipeToCloseDirection>('up');

  /** Emitted when the user completes a swipe exceeding the dismiss threshold. */
  readonly dismissed = output<void>();

  private controller: GestureController | null = null;
  private dragOffset = 0;
  private snapBackTimer: ReturnType<typeof setTimeout> | null = null;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;
  private verticalDragEndHandled = false;

  constructor() {
    effect(() => {
      const enabled = this.rkSwipeToClose();
      this.teardown();
      if (enabled) {
        this.setup();
      }
    });
  }

  private setStyles(
    translateY: number,
    opacity: number,
    transition: string,
  ): void {
    const el = this.el.nativeElement;
    this.renderer.setStyle(el, 'transform', `translateY(${translateY}px)`);
    this.renderer.setStyle(el, 'opacity', String(opacity));
    this.renderer.setStyle(el, 'transition', transition);
  }

  private readonly easeOutTransition = `transform ${_kAnimationDurationMs}ms ease-out, opacity ${_kAnimationDurationMs}ms ease-out`;

  private resetToOriginalPosition(): void {
    this.setStyles(0, 1, this.easeOutTransition);
    this.dragOffset = 0;
    this.clearSnapBackTimer();
    this.snapBackTimer = setTimeout(() => {
      this.setStyles(0, 1, 'none');
    }, _kAnimationDurationMs);
  }

  private matchesDirection(distance: number): boolean {
    return this.rkSwipeToCloseDirection() === 'down'
      ? distance > 0
      : distance < 0;
  }

  private setup(): void {
    const el = this.el.nativeElement;
    const sign = this.rkSwipeToCloseDirection() === 'down' ? 1 : -1;

    const controller = createGestureController(
      { useTouchEventsOnly: true },
      {
        onVerticalDragStart: () => {
          this.verticalDragEndHandled = false;
        },
        onVerticalDragUpdate: (event) => {
          const { primaryDistance } = event;
          if (this.matchesDirection(primaryDistance)) {
            const height = window.innerHeight;
            this.dragOffset = primaryDistance;
            const progress = clamp(
              abs(primaryDistance) / (height * _kOpacityProgressNormaliser),
              0,
              1,
            );
            const opacity = 1 - progress * _kOpacityDragReduction;
            this.renderer.setStyle(
              el,
              'transform',
              `translateY(${this.dragOffset}px)`,
            );
            this.renderer.setStyle(el, 'opacity', String(opacity));
            this.renderer.setStyle(el, 'transition', 'none');
          }
        },
        onVerticalDragEnd: (event) => {
          this.verticalDragEndHandled = true;
          const { primaryDistance } = event;
          const height = window.innerHeight;
          const threshold = height * _kDismissThresholdFraction;

          if (
            this.matchesDirection(primaryDistance) &&
            abs(primaryDistance) > threshold
          ) {
            this.setStyles(height * sign, 0, this.easeOutTransition);
            this.clearDismissTimer();
            this.dismissTimer = setTimeout(() => {
              this.ngZone.run(() => {
                this.dismissed.emit();
              });
            }, _kAnimationDurationMs);
          } else {
            this.resetToOriginalPosition();
          }
        },
        onDragEnd: () => {
          if (!this.verticalDragEndHandled && this.dragOffset !== 0) {
            this.resetToOriginalPosition();
          }
        },
      },
    );

    this.ngZone.runOutsideAngular(() => {
      controller.attach(el);
      controller.observe();
    });

    this.controller = controller;
  }

  private teardown(): void {
    this.clearSnapBackTimer();
    this.clearDismissTimer();

    if (this.controller) {
      this.controller.unobserve();
      this.controller.detach();
      this.controller = null;
    }
    const el = this.el.nativeElement;
    this.renderer.removeStyle(el, 'transform');
    this.renderer.removeStyle(el, 'opacity');
    this.renderer.removeStyle(el, 'transition');
    this.dragOffset = 0;
  }

  private clearSnapBackTimer(): void {
    if (this.snapBackTimer !== null) {
      clearTimeout(this.snapBackTimer);
      this.snapBackTimer = null;
    }
  }

  private clearDismissTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.teardown();
  }
}

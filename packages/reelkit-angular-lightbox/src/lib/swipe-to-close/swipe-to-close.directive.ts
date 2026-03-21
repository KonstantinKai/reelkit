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
import { createGestureController, type GestureController } from '@reelkit/core';

const DISMISS_THRESHOLD_FRACTION = 0.2;
const OPACITY_PROGRESS_NORMALISER = 0.3;
const OPACITY_DRAG_REDUCTION = 0.8;
const ANIMATION_DURATION_MS = 300;

/**
 * Attribute directive that adds a vertical swipe-to-dismiss gesture to
 * its host element.
 *
 * When `rkSwipeToCloseEnabled` is `true`, the directive attaches a
 * {@link GestureController} (touch-only) that:
 * - Translates the host upward and fades it out during an upward drag
 * - Emits `dismissed` when the drag distance exceeds 20 % of viewport height
 * - Animates back to the original position if the threshold is not met
 *
 * Gesture callbacks run outside `NgZone` to avoid unnecessary
 * change detection cycles; DOM mutations are applied via `Renderer2`.
 *
 * @example
 * ```html
 * <div [rkSwipeToClose]="isMobile" (dismissed)="handleClose()">
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

  /** When `true`, the swipe-to-close gesture is active. Typically `true` on touch devices. */
  readonly rkSwipeToClose = input<boolean>(false);

  /** Emitted when the user completes an upward swipe exceeding the dismiss threshold. */
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

  private readonly easeOutTransition = `transform ${ANIMATION_DURATION_MS}ms ease-out, opacity ${ANIMATION_DURATION_MS}ms ease-out`;

  private resetToOriginalPosition(): void {
    this.setStyles(0, 1, this.easeOutTransition);
    this.dragOffset = 0;
    this.clearSnapBackTimer();
    this.snapBackTimer = setTimeout(() => {
      this.setStyles(0, 1, 'none');
    }, ANIMATION_DURATION_MS);
  }

  private setup(): void {
    const el = this.el.nativeElement;

    const controller = createGestureController(
      { useTouchEventsOnly: true },
      {
        onVerticalDragStart: () => {
          this.verticalDragEndHandled = false;
        },
        onVerticalDragUpdate: (event) => {
          const { primaryDistance } = event;
          if (primaryDistance < 0) {
            // Read height at drag time so orientation changes are accounted for.
            const height = window.innerHeight;
            this.dragOffset = primaryDistance;
            const progress = Math.min(
              Math.abs(primaryDistance) /
                (height * OPACITY_PROGRESS_NORMALISER),
              1,
            );
            const opacity = 1 - progress * OPACITY_DRAG_REDUCTION;
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
          // Re-read height at gesture-end time to handle device rotation
          // between gesture start and end.
          const height = window.innerHeight;
          const threshold = height * DISMISS_THRESHOLD_FRACTION;

          if (primaryDistance < 0 && Math.abs(primaryDistance) > threshold) {
            this.setStyles(-height, 0, this.easeOutTransition);
            this.clearDismissTimer();
            this.dismissTimer = setTimeout(() => {
              this.ngZone.run(() => {
                this.dismissed.emit();
              });
            }, ANIMATION_DURATION_MS);
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

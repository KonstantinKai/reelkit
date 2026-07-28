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
import type {
  TransitionTransformFn,
  UrlStateController,
} from '@reelkit/angular';
import { RkLightboxOverlayComponent } from './lightbox-overlay.component';
import {
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkLightboxSlideDirective,
  RkLightboxLoadingDirective,
  RkLightboxErrorDirective,
} from '../template-slots/lightbox-template-slots';
import type { LightboxItem, ReelProxyProps } from '../types';
import type { SwipeToCloseDirection } from '@reelkit/angular';

/**
 * Full-screen image lightbox whose open state lives in the URL.
 *
 * Same gallery as {@link RkLightboxOverlayComponent}; the difference is who
 * decides it is open. Here that is a `UrlStateController` built with
 * `createOverlayUrlState`, so the visible slide has an address: it can be
 * linked to, shared, opened in a new tab, and closed with the back button.
 *
 * Opening pushes one history entry and every slide after replaces it, so
 * paging a gallery costs nothing and a single back step always leaves.
 *
 * @example
 * ```ts
 * protected readonly photo = createOverlayUrlState({
 *   param: 'photo',
 *   ...urlIndexKey(() => this.images().length),
 * });
 * ```
 * ```html
 * <a [routerLink]="[]" [queryParams]="{ photo: 0 }">Open</a>
 * <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
 * ```
 */
@Component({
  selector: 'rk-lightbox-url-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RkLightboxOverlayComponent],
  template: `
    <rk-lightbox-overlay
      [isOpen]="index() !== null"
      [initialIndex]="index() ?? 0"
      [items]="items()"
      [transitionFn]="transitionFn()"
      [showInfo]="showInfo()"
      [showControls]="showControls()"
      [showNavigation]="showNavigation()"
      [transitionDuration]="transitionDuration()"
      [swipeDistanceFactor]="swipeDistanceFactor()"
      [loop]="loop()"
      [enableNavKeys]="enableNavKeys()"
      [enableWheel]="enableWheel()"
      [wheelDebounceMs]="wheelDebounceMs()"
      [swipeToCloseDirection]="swipeToCloseDirection()"
      [ariaLabel]="ariaLabel()"
      [controlsTemplate]="controlsSlot()?.templateRef"
      [navigationTemplate]="navigationSlot()?.templateRef"
      [infoTemplate]="infoSlot()?.templateRef"
      [slideTemplate]="slideSlot()?.templateRef"
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
export class RkLightboxUrlOverlayComponent {
  /**
   * Controller from `createOverlayUrlState`. Its `index` decides whether the
   * gallery is open and which slide it shows; this component writes back
   * through it on slide change and on close.
   */
  readonly controller = input.required<UrlStateController>();

  readonly items = input.required<LightboxItem[]>();

  readonly transitionFn = input<TransitionTransformFn | undefined>(undefined);
  readonly showInfo = input<boolean>(true);
  readonly showControls = input<boolean>(true);
  readonly showNavigation = input<boolean>(true);
  readonly transitionDuration =
    input<ReelProxyProps['transitionDuration']>(300);
  readonly swipeDistanceFactor =
    input<ReelProxyProps['swipeDistanceFactor']>(0.12);
  readonly loop = input<ReelProxyProps['loop']>(false);
  readonly enableNavKeys = input<ReelProxyProps['enableNavKeys']>(true);
  readonly enableWheel = input<ReelProxyProps['enableWheel']>(true);
  readonly wheelDebounceMs = input<ReelProxyProps['wheelDebounceMs']>(200);
  readonly swipeToCloseDirection = input<SwipeToCloseDirection>('up');
  readonly ariaLabel = input<string>('Image gallery');

  /** Emitted after the gallery closes. The URL drives closing, not this. */
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
  protected readonly controlsSlot = contentChild(RkLightboxControlsDirective);
  protected readonly navigationSlot = contentChild(
    RkLightboxNavigationDirective,
  );
  protected readonly infoSlot = contentChild(RkLightboxInfoDirective);
  protected readonly slideSlot = contentChild(RkLightboxSlideDirective);
  protected readonly loadingSlot = contentChild(RkLightboxLoadingDirective);
  protected readonly errorSlot = contentChild(RkLightboxErrorDirective);

  protected readonly index = signal<number | null>(null);

  constructor() {
    // The controller arrives as an input, so it cannot be read in a field
    // initialiser. An effect defers until it is bound, and re-subscribes if a
    // different controller is ever passed — its cleanup drops the old
    // subscription, so nothing keeps writing from a controller we let go of.
    effect((onCleanup) => {
      const controller = this.controller();
      const sync = () => this.index.set(controller.position.value);

      sync();
      onCleanup(controller.position.observe(sync));
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

import { Directive, inject, TemplateRef } from '@angular/core';
import type {
  LightboxItem,
  LightboxControlsContext,
  LightboxNavContext,
  LightboxInfoContext,
  LightboxSlideContext,
} from '../types';

/**
 * Structural directive that marks a template as a custom controls slot.
 *
 * Provides a {@link LightboxControlsContext} to the template, giving access
 * to `onClose`, `currentIndex`, `count`, `isFullscreen`, and
 * `onToggleFullscreen`.
 *
 * @example
 * ```html
 * <rk-lightbox-overlay [isOpen]="open" [items]="images" (closed)="open = false">
 *   <ng-template rkLightboxControls let-ctx>
 *     <button (click)="ctx.onClose()">X</button>
 *     <span>{{ ctx.currentIndex + 1 }} / {{ ctx.count }}</span>
 *   </ng-template>
 * </rk-lightbox-overlay>
 * ```
 */
@Directive({ selector: '[rkLightboxControls]' })
export class RkLightboxControlsDirective {
  readonly templateRef =
    inject<TemplateRef<LightboxControlsContext>>(TemplateRef);

  /** Type guard for the template context, used by Angular for type checking. */
  static ngTemplateContextGuard(
    _dir: RkLightboxControlsDirective,
    ctx: unknown,
  ): ctx is LightboxControlsContext {
    return true;
  }
}

/**
 * Structural directive that marks a template as a custom navigation slot.
 *
 * Provides a {@link LightboxNavContext} to the template, giving access
 * to `onPrev`, `onNext`, `activeIndex`, and `count`.
 *
 * @example
 * ```html
 * <rk-lightbox-overlay [isOpen]="open" [items]="images" (closed)="open = false">
 *   <ng-template rkLightboxNavigation let-ctx>
 *     <button (click)="ctx.onPrev()">Prev</button>
 *     <button (click)="ctx.onNext()">Next</button>
 *   </ng-template>
 * </rk-lightbox-overlay>
 * ```
 */
@Directive({ selector: '[rkLightboxNavigation]' })
export class RkLightboxNavigationDirective {
  readonly templateRef = inject<TemplateRef<LightboxNavContext>>(TemplateRef);

  /** Type guard for the template context, used by Angular for type checking. */
  static ngTemplateContextGuard(
    _dir: RkLightboxNavigationDirective,
    ctx: unknown,
  ): ctx is LightboxNavContext {
    return true;
  }
}

/**
 * Structural directive that marks a template as a custom info overlay slot.
 *
 * Provides a {@link LightboxInfoContext} with the current `LightboxItem`
 * as `$implicit` and the `index`.
 *
 * @example
 * ```html
 * <rk-lightbox-overlay [isOpen]="open" [items]="images" (closed)="open = false">
 *   <ng-template rkLightboxInfo let-item let-index="index">
 *     <p>{{ item.title }} ({{ index + 1 }})</p>
 *   </ng-template>
 * </rk-lightbox-overlay>
 * ```
 */
@Directive({ selector: '[rkLightboxInfo]' })
export class RkLightboxInfoDirective {
  readonly templateRef = inject<TemplateRef<LightboxInfoContext>>(TemplateRef);

  /** Type guard for the template context, used by Angular for type checking. */
  static ngTemplateContextGuard(
    _dir: RkLightboxInfoDirective,
    ctx: unknown,
  ): ctx is LightboxInfoContext {
    return true;
  }
}

/**
 * Structural directive that marks a template as a custom slide renderer.
 *
 * Provides a {@link LightboxSlideContext} with the `LightboxItem` as
 * `$implicit`, plus `index`, `size`, and `isActive`.
 *
 * @example
 * ```html
 * <rk-lightbox-overlay [isOpen]="open" [items]="items" (closed)="open = false">
 *   <ng-template rkLightboxSlide let-item let-size="size" let-isActive="isActive">
 *     <rk-lightbox-video-slide
 *       *ngIf="item.type === 'video'; else imgTpl"
 *       [src]="item.src"
 *       [poster]="item.poster"
 *       [isActive]="isActive"
 *       [size]="size"
 *       [slideKey]="item.src"
 *     />
 *     <ng-template #imgTpl>
 *       <img [src]="item.src" class="rk-lightbox-img" />
 *     </ng-template>
 *   </ng-template>
 * </rk-lightbox-overlay>
 * ```
 */
export interface LightboxLoadingContext {
  /** Zero-based index of the currently active slide. */
  $implicit: number;

  /** The currently active lightbox item. */
  item: LightboxItem;
}

@Directive({ selector: '[rkLightboxLoading]' })
export class RkLightboxLoadingDirective {
  readonly templateRef =
    inject<TemplateRef<LightboxLoadingContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkLightboxLoadingDirective,
    ctx: unknown,
  ): ctx is LightboxLoadingContext {
    return true;
  }
}

export interface LightboxErrorContext {
  /** Zero-based index of the currently active slide. */
  $implicit: number;

  /** The currently active lightbox item. */
  item: LightboxItem;
}

@Directive({ selector: '[rkLightboxError]' })
export class RkLightboxErrorDirective {
  readonly templateRef =
    inject<TemplateRef<LightboxErrorContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkLightboxErrorDirective,
    ctx: unknown,
  ): ctx is LightboxErrorContext {
    return true;
  }
}

@Directive({ selector: '[rkLightboxSlide]' })
export class RkLightboxSlideDirective {
  readonly templateRef = inject<TemplateRef<LightboxSlideContext>>(TemplateRef);

  /** Type guard for the template context, used by Angular for type checking. */
  static ngTemplateContextGuard(
    _dir: RkLightboxSlideDirective,
    ctx: unknown,
  ): ctx is LightboxSlideContext {
    return true;
  }
}

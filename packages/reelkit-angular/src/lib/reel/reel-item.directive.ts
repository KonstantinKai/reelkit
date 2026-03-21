import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Template context available inside an `*rkReelItem` template.
 */
export interface RkReelItemContext {
  /** Absolute slide index (0-based). */
  $implicit: number;

  /** Position of this slide within the current visible range. */
  indexInRange: number;

  /** Current slider dimensions as `[width, height]` in pixels. */
  size: [number, number];
}

/**
 * Structural directive that marks the slide template inside `rk-reel`.
 *
 * @example
 * ```html
 * <rk-reel [count]="items.length">
 *   <ng-template rkReelItem let-i let-size="size">
 *     <app-slide [data]="items[i]" [style.width.px]="size[0]" />
 *   </ng-template>
 * </rk-reel>
 * ```
 */
@Directive({ selector: '[rkReelItem]' })
export class RkReelItemDirective {
  readonly templateRef = inject<TemplateRef<RkReelItemContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: RkReelItemDirective,
    ctx: unknown,
  ): ctx is RkReelItemContext {
    return true;
  }
}

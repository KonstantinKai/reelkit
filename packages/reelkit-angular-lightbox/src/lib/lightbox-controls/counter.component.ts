import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Image counter sub-component. Displays "1 / 3" style counter.
 * Import and compose in a custom `rkLightboxControls` template.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   <rk-counter [currentIndex]="ctx.currentIndex" [count]="ctx.count" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="rk-lightbox-counter" role="status" aria-live="polite">
      {{ displayIndex() }} / {{ count() }}
    </span>
  `,
})
export class RkCounterComponent {
  /** Zero-based index of the current slide. */
  readonly currentIndex = input.required<number>();

  /** Total number of items. */
  readonly count = input.required<number>();

  protected readonly displayIndex = computed(() => this.currentIndex() + 1);
}

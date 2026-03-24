import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  X,
} from 'lucide-angular';

/**
 * Close button sub-component. Renders the default X button used in the
 * lightbox header. Import and compose in a custom `rkLightboxControls` template.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   <rk-close-button (clicked)="ctx.onClose()" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-close-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ X }),
      multi: true,
    },
  ],
  template: `
    <button
      [class]="className()"
      (click)="clicked.emit()"
      title="Close (Esc)"
      aria-label="Close gallery"
      type="button"
    >
      <lucide-angular [img]="XIcon" [size]="24" />
    </button>
  `,
})
export class RkCloseButtonComponent {
  /** Optional additional CSS class. Defaults to `"rk-lightbox-close"`. */
  readonly className = input<string>('rk-lightbox-close');

  /** Emitted when the button is clicked. */
  readonly clicked = output<void>();

  protected readonly XIcon = X;
}

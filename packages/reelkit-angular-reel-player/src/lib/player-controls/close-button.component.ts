import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  output,
} from '@angular/core';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  X,
} from 'lucide-angular';

/**
 * Reusable close button rendered as an absolutely-positioned circular icon
 * in the top-right corner of the player.
 *
 * Relies on shared styles from `@reelkit/angular-reel-player/styles.css`
 * for the `.rk-reel-button` + `.rk-reel-close-btn` classes.
 *
 * @example
 * ```html
 * <rk-close-button (clicked)="onClose()" />
 * ```
 */
@Component({
  selector: 'rk-close-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
      class="rk-reel-button rk-reel-close-btn"
      (click)="clicked.emit()"
      aria-label="Close player"
    >
      <lucide-angular [img]="XIcon" [size]="24" />
    </button>
  `,
})
export class RkCloseButtonComponent {
  readonly clicked = output<void>();

  protected readonly XIcon = X;
}

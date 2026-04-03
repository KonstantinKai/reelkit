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
      class="rk-player-close-btn"
      (click)="clicked.emit()"
      aria-label="Close player"
    >
      <lucide-angular [img]="XIcon" [size]="24" />
    </button>
  `,
  styles: [
    `
      .rk-player-close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 10;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .rk-player-close-btn:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
    `,
  ],
})
export class RkCloseButtonComponent {
  readonly clicked = output<void>();

  protected readonly XIcon = X;
}

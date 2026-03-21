import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  output,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICON_X } from '../icons/icons';

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
  template: `
    <button
      class="rk-player-close-btn"
      (click)="clicked.emit()"
      aria-label="Close player"
      [innerHTML]="iconX"
    ></button>
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

      .rk-player-close-btn svg {
        pointer-events: none;
      }
    `,
  ],
})
export class RkCloseButtonComponent {
  readonly clicked = output<void>();

  private readonly _sanitizer = inject(DomSanitizer);

  protected readonly iconX: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_X);
}

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICON_VOLUME_2, ICON_VOLUME_X } from '../icons/icons';
import { SoundStateService } from '../sound-state/sound-state.service';

/**
 * Reusable mute/unmute toggle button rendered as an absolutely-positioned
 * circular icon in the bottom-right corner of the player.
 *
 * Must be rendered inside a component that provides `SoundStateService`
 * (automatically provided by `RkReelPlayerOverlayComponent`).
 *
 * Hidden automatically when `SoundStateService.disabled` is `true`.
 *
 * @example
 * ```html
 * <rk-sound-button />
 * ```
 */
@Component({
  selector: 'rk-sound-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (!soundState.disabled()) {
      <button
        class="rk-player-sound-btn"
        [class.rk-disabled]="isDisabled()"
        [style.opacity]="isDisabled() ? '0.4' : '1'"
        [style.cursor]="isDisabled() ? 'default' : 'pointer'"
        (click)="onToggle()"
        [attr.aria-label]="soundState.muted() ? 'Unmute' : 'Mute'"
        [attr.aria-disabled]="isDisabled()"
        [innerHTML]="soundState.muted() ? iconVolumeX : iconVolume2"
      ></button>
    }
  `,
  styles: [
    `
      .rk-player-sound-btn {
        position: absolute;
        bottom: 16px;
        right: 16px;
        z-index: 10;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          opacity 0.2s,
          background-color 0.2s;
      }

      .rk-player-sound-btn:not(.rk-disabled):hover {
        background-color: rgba(0, 0, 0, 0.7);
      }

      .rk-player-sound-btn svg {
        pointer-events: none;
      }
    `,
  ],
})
export class RkSoundButtonComponent {
  /**
   * When true, the button appears dimmed and click events are ignored.
   * Useful when the active slide contains an image instead of a video.
   */
  readonly isDisabled = input<boolean>(false);

  protected readonly soundState = inject(SoundStateService);

  private readonly _sanitizer = inject(DomSanitizer);

  protected readonly iconVolume2: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_VOLUME_2);
  protected readonly iconVolumeX: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_VOLUME_X);

  protected onToggle(): void {
    if (!this.isDisabled()) {
      this.soundState.toggle();
    }
  }
}

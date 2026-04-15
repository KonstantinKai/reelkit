import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Volume2,
  VolumeX,
} from 'lucide-angular';
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
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Volume2, VolumeX }),
      multi: true,
    },
  ],
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
      >
        @if (soundState.muted()) {
          <lucide-angular [img]="VolumeXIcon" [size]="22" />
        } @else {
          <lucide-angular [img]="Volume2Icon" [size]="22" />
        }
      </button>
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

  protected readonly Volume2Icon = Volume2;
  protected readonly VolumeXIcon = VolumeX;

  protected onToggle(): void {
    if (!this.isDisabled()) {
      this.soundState.toggle();
    }
  }
}

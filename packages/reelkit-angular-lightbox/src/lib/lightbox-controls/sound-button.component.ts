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
  Volume2,
  VolumeX,
} from 'lucide-angular';

/**
 * Sound/mute toggle sub-component. Renders Volume2 (unmuted) or VolumeX
 * (muted) icon. Compose in a custom `rkLightboxControls` template when
 * using video slides.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   <rk-sound-button [muted]="isMuted" (toggled)="onToggleMute()" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-sound-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Volume2, VolumeX }),
      multi: true,
    },
  ],
  template: `
    <button
      class="rk-lightbox-btn"
      (click)="toggled.emit()"
      [title]="muted() ? 'Unmute' : 'Mute'"
      [attr.aria-label]="muted() ? 'Unmute' : 'Mute'"
      type="button"
    >
      @if (muted()) {
        <lucide-angular [img]="VolumeXIcon" [size]="20" />
      } @else {
        <lucide-angular [img]="Volume2Icon" [size]="20" />
      }
    </button>
  `,
})
export class RkSoundButtonComponent {
  /** Whether audio is currently muted. */
  readonly muted = input.required<boolean>();

  /** Emitted when the button is clicked to toggle the muted state. */
  readonly toggled = output<void>();

  protected readonly Volume2Icon = Volume2;
  protected readonly VolumeXIcon = VolumeX;
}

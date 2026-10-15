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
  Pause,
  Play,
} from 'lucide-angular';

/**
 * Slideshow play/pause toggle. The default controls show it when
 * `autoAdvance` is on; in a custom `rkLightboxControls` template, render it
 * when `onToggleAutoAdvance` is present.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   @if (ctx.onToggleAutoAdvance) {
 *     <rk-play-pause-button
 *       [playing]="ctx.isAutoAdvancing"
 *       (toggled)="ctx.onToggleAutoAdvance()"
 *     />
 *   }
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-play-pause-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Play, Pause }),
      multi: true,
    },
  ],
  template: `
    <button
      class="rk-lightbox-btn rk-lightbox-play-pause"
      (click)="toggled.emit()"
      [title]="playing() ? 'Pause slideshow' : 'Play slideshow'"
      [attr.aria-label]="playing() ? 'Pause slideshow' : 'Play slideshow'"
      [attr.aria-pressed]="playing()"
      type="button"
    >
      @if (playing()) {
        <lucide-angular [img]="PauseIcon" [size]="20" />
      } @else {
        <lucide-angular [img]="PlayIcon" [size]="20" />
      }
    </button>
  `,
})
export class RkPlayPauseButtonComponent {
  /** Whether the slideshow is running. Shows Pause when it is, Play when not. */
  readonly playing = input.required<boolean>();

  /** Emitted when the button is clicked to switch the slideshow. */
  readonly toggled = output<void>();

  protected readonly PlayIcon = Play;
  protected readonly PauseIcon = Pause;
}

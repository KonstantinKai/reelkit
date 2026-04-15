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
  Maximize,
  Minimize,
} from 'lucide-angular';

/**
 * Fullscreen toggle sub-component. Renders a Maximize or Minimize icon
 * based on the current fullscreen state.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   <rk-fullscreen-button
 *     [isFullscreen]="ctx.isFullscreen"
 *     (toggled)="ctx.onToggleFullscreen()"
 *   />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-fullscreen-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Maximize, Minimize }),
      multi: true,
    },
  ],
  template: `
    <button
      class="rk-lightbox-btn"
      (click)="toggled.emit()"
      [title]="isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen'"
      [attr.aria-label]="
        isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen'
      "
      type="button"
    >
      @if (isFullscreen()) {
        <lucide-angular [img]="MinimizeIcon" [size]="20" />
      } @else {
        <lucide-angular [img]="MaximizeIcon" [size]="20" />
      }
    </button>
  `,
})
export class RkFullscreenButtonComponent {
  /** Whether the lightbox is currently in fullscreen mode. */
  readonly isFullscreen = input.required<boolean>();

  /** Emitted when the button is clicked to toggle fullscreen. */
  readonly toggled = output<void>();

  protected readonly MaximizeIcon = Maximize;
  protected readonly MinimizeIcon = Minimize;
}

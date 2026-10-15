import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  Download,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
} from 'lucide-angular';

/**
 * Download button for the active item. The default controls show it when
 * `showDownload` is on; in a custom `rkLightboxControls` template, render it
 * when `onDownload` is present.
 *
 * @example
 * ```html
 * <ng-template rkLightboxControls let-ctx>
 *   @if (ctx.onDownload) {
 *     <rk-download-button
 *       [downloading]="ctx.isDownloading"
 *       (pressed)="ctx.onDownload()"
 *     />
 *   }
 * </ng-template>
 * ```
 */
@Component({
  selector: 'rk-download-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Download }),
      multi: true,
    },
  ],
  template: `
    <button
      class="rk-lightbox-btn rk-lightbox-download"
      (click)="pressed.emit()"
      title="Download"
      aria-label="Download"
      [disabled]="downloading()"
      [attr.aria-busy]="downloading()"
      type="button"
    >
      <lucide-angular [img]="DownloadIcon" [size]="20" />
    </button>
  `,
})
export class RkDownloadButtonComponent {
  /** Whether a download is in progress. The button is disabled meanwhile. */
  readonly downloading = input.required<boolean>();

  /** Emitted when the button is clicked to download the active item. */
  readonly pressed = output<void>();

  protected readonly DownloadIcon = Download;
}

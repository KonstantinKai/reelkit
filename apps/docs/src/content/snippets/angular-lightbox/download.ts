import { Component } from '@angular/core';
import {
  RkCloseButtonComponent,
  RkDownloadButtonComponent,
  RkLightboxControlsDirective,
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-gallery',
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkDownloadButtonComponent,
    RkCloseButtonComponent,
  ],
  template: `
    <rk-lightbox-overlay
      [isOpen]="isOpen"
      [items]="items"
      [showDownload]="true"
      (closed)="isOpen = false"
    >
      <!-- Optional: a custom bar shows the button only when its handler is there -->
      <ng-template rkLightboxControls let-ctx>
        @if (ctx.onDownload) {
          <rk-download-button
            [downloading]="ctx.isDownloading"
            (pressed)="ctx.onDownload()"
          />
        }
        <rk-close-button (clicked)="ctx.onClose()" />
      </ng-template>
    </rk-lightbox-overlay>
  `,
})
export class GalleryComponent {
  isOpen = false;
  items: LightboxItem[] = [
    {
      src: '/beach-1600.jpg',
      // Save the original rather than the resized preview
      downloadUrl: '/beach-original.jpg',
      downloadName: 'beach.jpg',
    },
  ];
}

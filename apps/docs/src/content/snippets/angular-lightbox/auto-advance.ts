import { Component } from '@angular/core';
import {
  RkCloseButtonComponent,
  RkLightboxControlsDirective,
  RkLightboxOverlayComponent,
  RkPlayPauseButtonComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-gallery',
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkPlayPauseButtonComponent,
    RkCloseButtonComponent,
  ],
  template: `
    <rk-lightbox-overlay
      [isOpen]="isOpen"
      [items]="items"
      [autoAdvance]="true"
      [autoAdvanceInterval]="4000"
      (closed)="isOpen = false"
    >
      <!-- Optional: a custom bar shows the toggle only when its handler is there -->
      <ng-template rkLightboxControls let-ctx>
        @if (ctx.onToggleAutoAdvance) {
          <rk-play-pause-button
            [playing]="ctx.isAutoAdvancing"
            (toggled)="ctx.onToggleAutoAdvance()"
          />
        }
        <rk-close-button (clicked)="ctx.onClose()" />
      </ng-template>
    </rk-lightbox-overlay>
  `,
})
export class GalleryComponent {
  isOpen = false;
  items: LightboxItem[] = [{ src: '/beach.jpg' }, { src: '/forest.jpg' }];
}

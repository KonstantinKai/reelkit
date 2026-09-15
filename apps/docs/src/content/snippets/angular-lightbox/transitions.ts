import {
  RkLightboxOverlayComponent,
  lightboxFadeTransition,
} from '@reelkit/angular-lightbox';

@Component({
  imports: [RkLightboxOverlayComponent],
  template: `
    <rk-lightbox-overlay
      [isOpen]="isOpen"
      [items]="images"
      [transitionFn]="lightboxFadeTransition"
      (closed)="isOpen = false"
    />
  `,
})
export class GalleryComponent {
  protected readonly lightboxFadeTransition = lightboxFadeTransition;
}

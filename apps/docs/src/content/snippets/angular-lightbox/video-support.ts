import {
  RkLightboxOverlayComponent,
  RkLightboxSlideDirective,
  RkLightboxVideoSlideComponent,
  type LightboxItem,
  type LightboxSlideContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxSlideDirective,
    RkLightboxVideoSlideComponent,
  ],
  template: `
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
      <ng-template rkLightboxSlide
                   let-item
                   let-index="index"
                   let-size="size"
                   let-isActive="isActive"
                   let-autoAdvance="autoAdvance"
                   let-onReady="onReady"
                   let-onEnded="onEnded">
        @if (item.type === 'video') {
          <!-- With autoAdvance the video plays once and reports its end -->
          <rk-lightbox-video-slide
            [src]="item.src"
            [poster]="item.poster"
            [slideKey]="'lightbox-' + index"
            [size]="size"
            [isActive]="isActive"
            [loop]="!autoAdvance"
            [onReady]="onReady"
            [onEnded]="onEnded"
          />
        } @else {
          <img [src]="item.src"
               [style.width.px]="size[0]"
               [style.height.px]="size[1]"
               style="object-fit:contain" />
        }
      </ng-template>
    </rk-lightbox-overlay>
  `,
})
export class AppComponent {
  isOpen = false;
  items: LightboxItem[] = [
    { src: '/photo.jpg', title: 'Photo' },
    { src: '/clip.mp4', type: 'video', poster: '/clip-thumb.jpg', title: 'Video' },
  ];
}

import {
  RkLightboxOverlayComponent,
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
  type LightboxControlsContext,
  type LightboxNavContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkLightboxNavigationDirective,
    RkLightboxInfoDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
  ],
  template: `
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="images" (closed)="isOpen = false">

      <!-- Custom controls bar -->
      <ng-template rkLightboxControls
                   let-onClose="onClose"
                   let-activeIndex="activeIndex"
                   let-count="count"
                   let-isFullscreen="isFullscreen"
                   let-onToggleFullscreen="onToggleFullscreen">
        <div style="position:absolute;top:0;left:0;right:0;padding:12px;
                    display:flex;align-items:center;justify-content:space-between">
          <rk-close-button (clicked)="onClose()" />
          <rk-counter [currentIndex]="activeIndex + 1" [count]="count" />
          <rk-fullscreen-button
            [isFullscreen]="isFullscreen"
            (toggled)="onToggleFullscreen()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkLightboxNavigation
                   let-onPrev="onPrev"
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <button (click)="onPrev()" [disabled]="activeIndex === 0">&#8592;</button>
        <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#8594;</button>
      </ng-template>

      <!-- Custom info overlay -->
      <ng-template rkLightboxInfo let-item let-index="index">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;
                    background:linear-gradient(transparent,rgba(0,0,0,0.6))">
          <h3 style="color:#fff">{{ item.title }}</h3>
          <p style="color:rgba(255,255,255,0.7)">{{ item.description }}</p>
        </div>
      </ng-template>

    </rk-lightbox-overlay>
  `,
})
export class AppComponent {
  images: LightboxItem[] = [];
  isOpen = false;
}

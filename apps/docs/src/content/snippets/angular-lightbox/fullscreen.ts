import { fullscreenSignal, requestFullscreen, exitFullscreen } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  readonly isFullscreen = fullscreenSignal();

  toggle(container: HTMLElement): void {
    if (this.isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen(container);
    }
  }
}

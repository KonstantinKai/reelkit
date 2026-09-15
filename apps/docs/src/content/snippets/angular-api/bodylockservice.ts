import { inject } from '@angular/core';
import { BodyLockService } from '@reelkit/angular';

@Component({ ... })
export class OverlayComponent {
  private readonly bodyLock = inject(BodyLockService);

  open() { this.bodyLock.lock(); }
  close() { this.bodyLock.unlock(); }
}

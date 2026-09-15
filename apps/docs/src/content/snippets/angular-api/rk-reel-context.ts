import { inject } from '@angular/core';
import { RK_REEL_CONTEXT } from '@reelkit/angular';

@Component({ ... })
export class MyCustomControl {
  private readonly ctx = inject(RK_REEL_CONTEXT, { optional: true });

  jump(index: number) {
    this.ctx?.goTo(index, true);
  }
}

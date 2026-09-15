import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular-reel-player';

@Component({ ... })
export class AppComponent {
  readonly soundState = inject(SoundStateService);

  // Use in template:
  // [class.muted]="soundState.muted()"
  // [disabled]="soundState.disabled()"
  // (click)="soundState.toggle()"
}

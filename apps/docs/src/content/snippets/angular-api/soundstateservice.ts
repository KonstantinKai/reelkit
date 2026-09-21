import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular';

@Component({
  // Provide it on the component that owns the media, so two overlays
  // on one page never share a muted state.
  providers: [SoundStateService],
  // ...
})
export class OverlayComponent {
  readonly soundState = inject(SoundStateService);

  // Use in template:
  // [muted]="soundState.muted()"
  // [hidden]="soundState.disabled()"
  // (click)="soundState.toggle()"
}

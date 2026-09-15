import { Component } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="10"
      [size]="[400, 600]"
      (apiReady)="api = $event"
    >
      <ng-template rkReelItem let-i let-size="size">
        <app-slide [index]="i" [size]="size" />
      </ng-template>
    </rk-reel>

    <button (click)="api?.prev()">Prev</button>
    <button (click)="api?.next()">Next</button>
    <button (click)="api?.goTo(5)">Go to 5</button>
  `,
})
export class AppComponent {
  api: ReelApi | undefined;
}

import { Component } from '@angular/core';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
} from '@reelkit/angular';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

@Component({
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: `
    <rk-reel [count]="items.length" [size]="[400, 600]"
             direction="vertical" [enableWheel]="true">
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]"
             [style.background]="items[i].color"
             style="display:flex;align-items:center;justify-content:center;
                    font-size:2rem;color:#fff">
          {{ items[i].title }}
        </div>
      </ng-template>
      <rk-reel-indicator />
    </rk-reel>
  `,
})
export class AppComponent {
  readonly items = items;
}

import { Component, signal } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (apiReady)="reelApi.set($event)"
      (afterChange)="currentIndex.set($event.index)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]">
          {{ items[i].title }}
        </div>
      </ng-template>
    </rk-reel>

    <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%)">
      <button (click)="reelApi()?.prev()"
              [disabled]="currentIndex() === 0">Prev</button>
      <button (click)="reelApi()?.next()"
              [disabled]="currentIndex() === items.length - 1">Next</button>
    </div>
  `,
})
export class AppComponent {
  readonly items = [
    { title: 'Slide 1', color: '#6366f1' },
    { title: 'Slide 2', color: '#8b5cf6' },
    { title: 'Slide 3', color: '#ec4899' },
  ];

  readonly reelApi = signal<ReelApi | undefined>(undefined);
  readonly currentIndex = signal(0);
}

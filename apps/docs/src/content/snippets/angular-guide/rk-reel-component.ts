import { Component } from '@angular/core';
import { ReelComponent, ReelIndicatorComponent, RkReelItemDirective } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (afterChange)="onAfterChange($event)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]"
             [style.background]="items[i].color"
             style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
          <div style="font-size:1.5rem;font-weight:bold">{{ items[i].title }}</div>
          <div style="font-size:0.875rem;opacity:0.8">{{ items[i].subtitle }}</div>
        </div>
      </ng-template>

      <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:10">
        <rk-reel-indicator direction="vertical" />
      </div>
    </rk-reel>
  `,
})
export class AppComponent {
  items = [
    { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
    { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
    { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
    { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
    { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
    { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
  ];

  onAfterChange(event: { index: number; indexInRange: number }) {
    console.log('Current index:', event.index);
  }
}

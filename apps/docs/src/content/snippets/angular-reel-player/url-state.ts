import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import { createOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import '@reelkit/angular-reel-player/styles.css';

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent, RouterLink],
  template: `
    @for (post of content; track post.id; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ reel: i }">{{ post.id }}</a>
    }
    <rk-reel-player-url-overlay [controller]="reel" [content]="content" />
  `,
})
export class FeedComponent {
  content: ContentItem[] = [/* ... */];
  protected readonly reel = createOverlayUrlState({
    param: 'reel',
    adapter: createRouterUrlAdapter(),
    ...urlIndexKey(() => this.content.length),
  });
}

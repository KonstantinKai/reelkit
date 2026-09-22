# @reelkit/angular-stories-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular-stories-player"><img src="https://img.shields.io/npm/v/@reelkit/angular-stories-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-0%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-0%25-red" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Instagram-style stories for Angular. Tap to move through a group, swipe or cube
between groups, and an auto-advance timer drives the progress bar. Every region
is replaceable through a template slot.

## Installation

```bash
npm install @reelkit/angular-stories-player @reelkit/angular lucide-angular
```

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  type StoriesGroup,
} from '@reelkit/angular-stories-player';
import '@reelkit/angular-stories-player/styles.css';

@Component({
  standalone: true,
  imports: [RkStoriesOverlayComponent],
  template: `
    <button (click)="isOpen.set(true)">Open stories</button>
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class FeedComponent {
  isOpen = signal(false);

  groups: StoriesGroup[] = [
    {
      id: 'ada',
      author: { name: 'Ada', avatar: 'https://example.com/ada.jpg' },
      stories: [
        { id: '1', src: 'https://example.com/1.jpg', mediaType: 'image' },
        { id: '2', src: 'https://example.com/2.mp4', mediaType: 'video' },
      ],
    },
  ];
}
```

## Open state in the URL

`RkStoriesUrlOverlayComponent` keeps the open group and story in one query
parameter, so a story has a link that can be shared and closed with the back
button. Build the controller with `createOverlayUrlState` from
`@reelkit/angular` and pass it as `[controller]`.

## Remembering what was seen

Pass a `createStoriesViewedStateController` as `[viewed]`: a group opens on its
first unseen story, every story shown is recorded, and rings and carousel cards
dim once a group has been watched to the end. The factory is re-exported here,
so nothing beyond this package and `@reelkit/angular` needs installing.

## Documentation

Full reference, live demos and the template slot catalogue:
[reelkit.dev/docs/angular-stories-player](https://reelkit.dev/docs/angular-stories-player)

## License

MIT

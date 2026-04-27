---
title: Angular Reel Player
url: https://reelkit.dev/docs/angular-reel-player
section: Angular
order: 3
desc: Full-screen TikTok/Reels-style video reel player overlay for Angular. ContentItem schema, inputs, outputs, template slot directives, theming shared with React reel-player.
---

# Angular Reel Player

Full-screen TikTok/Reels-style video reel player overlay for Angular. CSS classes + theming tokens identical to `@reelkit/react-reel-player` (prefix `--rk-reel-*`, classes `.rk-reel-*`).

## Install

```bash
npm install @reelkit/angular-reel-player
```

```ts
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';
import '@reelkit/angular-reel-player/styles.css';
```

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: `
    @for (item of content; track item.id; let i = $index) {
      <button (click)="initialIndex.set(i); isOpen.set(true)">
        <img [src]="item.media[0].poster ?? item.media[0].src" />
      </button>
    }

    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      [initialIndex]="initialIndex()"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class FeedComponent {
  isOpen = signal(false);
  initialIndex = signal(0);

  content = [
    {
      id: '1',
      media: [
        {
          id: 'v1',
          type: 'video',
          src: '/v1.mp4',
          poster: '/p1.jpg',
          aspectRatio: 16 / 9,
        },
      ],
      author: { name: 'Alex', avatar: '/a1.jpg' },
      likes: 1234,
      description: 'Sunset',
    },
  ];
}
```

## ContentItem Schema

Same shape as React/Vue reel player.

```ts
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio: number; // < 1 vertical (cover), > 1 horizontal (contain)
}

interface ContentItem {
  id: string;
  media: MediaItem[];
  author?: { name: string; avatar?: string };
  likes?: number;
  description?: string;
}
```

## RkReelPlayerOverlayComponent Inputs

| Input                        | Type                            | Default                          | Description                                                          |
| ---------------------------- | ------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `isOpen`                     | `boolean`                       | required                         | Overlay visibility; false → removed from DOM                         |
| `content`                    | `T[] (extends BaseContentItem)` | required                         | Content items to display                                             |
| `ariaLabel`                  | `string`                        | `'Video player'`                 | Accessible label for dialog region                                   |
| `aspectRatio`                | `number \| undefined`           | `undefined` (defaults to `9/16`) | Width/height ratio for desktop container. Mobile uses full viewport. |
| `enableNavKeys`              | `boolean`                       | `true`                           | Keyboard arrow key navigation                                        |
| `enableWheel`                | `boolean`                       | `true`                           | Mouse wheel navigation                                               |
| `initialIndex`               | `number`                        | `0`                              | Zero-based index of initially visible item                           |
| `loop`                       | `boolean`                       | `false`                          | Infinite loop between slides                                         |
| `swipeDistanceFactor`        | `number`                        | `0.12`                           | Min swipe distance fraction to trigger slide change                  |
| `timeline`                   | `'auto' \| 'always' \| 'never'` | `'auto'`                         | Gating strategy for built-in playback timeline bar                   |
| `timelineMinDurationSeconds` | `number`                        | `30`                             | Min video duration (seconds) for `timeline='auto'` to render bar     |
| `transitionDuration`         | `number`                        | `300`                            | Slide animation duration in ms                                       |
| `wheelDebounceMs`            | `number`                        | `200`                            | Debounce duration for wheel events in ms                             |

## Outputs

| Output        | Type                    | Description                                     |
| ------------- | ----------------------- | ----------------------------------------------- |
| `apiReady`    | `EventEmitter<ReelApi>` | Fires once slider ready, exposes imperative API |
| `closed`      | `EventEmitter<void>`    | Fires when player closed                        |
| `slideChange` | `EventEmitter<number>`  | Fires when active slide index changes           |

## Template Slot Directives

Use these structural directives on `<ng-template>` for custom content:

| Directive                  | Context                                              | Description                                                            |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `rkPlayerControls`         | `PlayerControlsContext<T>`                           | Custom global controls bar (close, sound toggle, etc.)                 |
| `rkPlayerError`            | `{ $implicit: activeIndex, item, innerActiveIndex }` | Custom error indicator slot                                            |
| `rkPlayerLoading`          | `{ $implicit: activeIndex, item, innerActiveIndex }` | Custom loading indicator slot                                          |
| `rkPlayerNavigation`       | `PlayerNavigationContext`                            | Custom prev/next nav arrows                                            |
| `rkPlayerNestedNavigation` | `PlayerNestedNavigationContext`                      | Custom nav arrows for inner horizontal slider                          |
| `rkPlayerNestedSlide`      | `PlayerNestedSlideContext`                           | Custom content for each slide in inner horizontal slider               |
| `rkPlayerSlide`            | `PlayerSlideContext<T>`                              | Fully custom slide replacing default media slide                       |
| `rkPlayerSlideOverlay`     | `PlayerSlideOverlayContext<T>`                       | Per-slide overlay (author info, likes, description, etc.)              |
| `rkPlayerTimeline`         | `PlayerTimelineContext<T>`                           | Custom timeline bar. Rendered only when gate would render default bar. |

### Slot Context Types

| Name                            | Fields                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PlayerControlsContext<T>`      | `{ $implicit: onClose, activeIndex, content: T[], soundState: PlayerSoundState }`                  |
| `PlayerNavigationContext`       | `{ $implicit: onPrev, onNext, activeIndex, count }`                                                |
| `PlayerNestedNavigationContext` | `{ $implicit: onPrev, onNext, activeIndex, count }`                                                |
| `PlayerNestedSlideContext`      | `{ $implicit: MediaItem, index, size, isActive, isInnerActive, slideKey }`                         |
| `PlayerSlideContext<T>`         | `{ $implicit: T, index, size: [number, number], isActive, slideKey, onReady, onWaiting, onError }` |
| `PlayerSlideOverlayContext<T>`  | `{ $implicit: T, index, isActive }`                                                                |
| `PlayerTimelineContext<T>`      | `{ $implicit: timelineState, item, activeIndex }`                                                  |

## Keyboard Shortcuts

| Key          | Action                         |
| ------------ | ------------------------------ |
| `ArrowUp`    | Previous slide                 |
| `ArrowDown`  | Next slide                     |
| `ArrowLeft`  | Previous media (nested slider) |
| `ArrowRight` | Next media (nested slider)     |
| `Escape`     | Close player                   |

## CSS Theming

Tokens + classes shared with `@reelkit/react-reel-player`. See [Reel Player](/docs/reel-player) for full token + class list. Token prefix `--rk-reel-*`, class prefix `.rk-reel-*`.

## Custom Slot Examples

### `rkPlayerControls`

```html
<rk-reel-player-overlay [isOpen]="isOpen()" [content]="content">
  <ng-template
    rkPlayerControls
    let-onClose="$implicit"
    let-soundState="soundState"
  >
    <button (click)="onClose()">×</button>
    <button (click)="soundState.toggle()">
      {{ soundState.isMuted() ? '🔇' : '🔊' }}
    </button>
  </ng-template>
</rk-reel-player-overlay>
```

### `rkPlayerSlideOverlay`

```html
<rk-reel-player-overlay [isOpen]="isOpen()" [content]="content">
  <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
    @if (isActive) {
    <header>
      <img [src]="item.author.avatar" />
      <strong>{{ item.author.name }}</strong>
    </header>
    <p>{{ item.description }}</p>
    <span>♥ {{ item.likes }}</span>
    }
  </ng-template>
</rk-reel-player-overlay>
```

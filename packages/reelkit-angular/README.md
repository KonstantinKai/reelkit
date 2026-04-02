# @reelkit/angular

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular"><img src="https://img.shields.io/npm/v/@reelkit/angular?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/angular%20gzip-12.2%20kB-6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Angular bindings for `@reelkit/core`. Add a `<rk-reel>` component with a count and a template — it handles virtualization, gestures, and keyboard/wheel input. ~12.2 kB gzip.

## Installation

```bash
npm install @reelkit/angular
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
} from '@reelkit/angular';

@Component({
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div
          [style.width.px]="size[0]"
          [style.height.px]="size[1]"
          [style.background]="items[i].color"
          style="display:flex;align-items:center;justify-content:center;color:#fff"
        >
          {{ items[i].title }}
        </div>
      </ng-template>
      <rk-reel-indicator direction="vertical" />
    </rk-reel>
  `,
})
export class AppComponent {
  items = [
    { title: 'Slide 1', color: '#6366f1' },
    { title: 'Slide 2', color: '#8b5cf6' },
    { title: 'Slide 3', color: '#ec4899' },
  ];
}
```

## Features

- `<rk-reel>` — virtualized slider, keeps only 3 slides in the DOM
- `<rk-reel-indicator>` — dot indicators that auto-connect to the parent via context
- `rkReelItem` structural directive for slide templates
- Measures its own size via ResizeObserver — no explicit dimensions needed
- Swipe with momentum and snap, keyboard arrows, mouse wheel
- Loop mode for infinite circular scrolling
- `ChangeDetectionStrategy.OnPush` by default
- Typed with TypeScript

## API

### rk-reel Inputs

| Input                 | Type                         | Default      | Description                   |
| --------------------- | ---------------------------- | ------------ | ----------------------------- |
| `count`               | `number`                     | required     | Number of slides              |
| `direction`           | `'horizontal' \| 'vertical'` | `'vertical'` | Slide direction               |
| `size`                | `[number, number]`           | -            | Explicit [width, height]      |
| `initialIndex`        | `number`                     | `0`          | Starting slide index          |
| `loop`                | `boolean`                    | `false`      | Enable infinite loop          |
| `swipeDistanceFactor` | `number`                     | `0.12`       | Swipe threshold (0-1)         |
| `transitionDuration`  | `number`                     | `300`        | Animation duration in ms      |
| `enableNavKeys`       | `boolean`                    | `true`       | Enable keyboard navigation    |
| `enableWheel`         | `boolean`                    | `false`      | Enable mouse wheel navigation |
| `wheelDebounceMs`     | `number`                     | `200`        | Wheel debounce duration       |

### rk-reel Outputs

| Output           | Type                                        | Description               |
| ---------------- | ------------------------------------------- | ------------------------- |
| `afterChange`    | `{ index: number; indexInRange: number }`   | Fired after slide change  |
| `beforeChange`   | `{ index: number; nextIndex: number; ... }` | Fired before slide change |
| `apiReady`       | `ReelApi`                                   | Emits the imperative API  |
| `slideDragStart` | `number`                                    | Drag gesture started      |
| `slideDragEnd`   | `number`                                    | Drag gesture ended        |

### rkReelItem Template Context

| Variable       | Type               | Description                           |
| -------------- | ------------------ | ------------------------------------- |
| `$implicit`    | `number`           | Absolute slide index (0 to count - 1) |
| `indexInRange` | `number`           | Position in visible window (0, 1, 2)  |
| `size`         | `[number, number]` | Container [width, height]             |

### ReelIndicator Inputs

| Input       | Type     | Default | Description                    |
| ----------- | -------- | ------- | ------------------------------ |
| `direction` | `string` | -       | `'horizontal'` or `'vertical'` |
| `radius`    | `number` | `3`     | Dot radius in pixels           |
| `visible`   | `number` | `3`     | Number of visible dots         |
| `gap`       | `number` | `4`     | Gap between dots in pixels     |

## Documentation

API reference, demos, and guides at **[reelkit.dev](https://reelkit.dev)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

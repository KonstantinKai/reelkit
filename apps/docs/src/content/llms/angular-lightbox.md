---
title: Angular Lightbox
url: https://reelkit.dev/docs/angular-lightbox
section: Angular
order: 4
desc: Full-screen image gallery lightbox overlay for Angular. LightboxItem schema, inputs, outputs, template slot directives, tree-shakable transitionFn, swipe-to-close, theming shared with React lightbox.
---

# Angular Lightbox

Full-screen image gallery lightbox overlay for Angular. CSS classes + theming tokens identical to `@reelkit/react-lightbox` (prefix `--rk-lightbox-*`, classes `.rk-lightbox-*`).

## Install

```bash
npm install @reelkit/angular-lightbox
```

```ts
import { RkLightboxOverlayComponent } from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';
```

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  lightboxFadeTransition,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: `
    @for (item of items; track item.src; let i = $index) {
      <button (click)="initialIndex.set(i); isOpen.set(true)">
        <img [src]="item.src" [alt]="item.title" />
      </button>
    }

    <rk-lightbox-overlay
      [isOpen]="isOpen()"
      [items]="items"
      [initialIndex]="initialIndex()"
      [transitionFn]="fadeTransition"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class GalleryComponent {
  isOpen = signal(false);
  initialIndex = signal(0);
  protected readonly fadeTransition = lightboxFadeTransition;

  items = [
    {
      src: '/img1.jpg',
      title: 'Mountain',
      description: 'River through forest',
      width: 1600,
      height: 1000,
    },
    { src: '/img2.jpg', title: 'Snow', width: 1000, height: 1600 },
  ];
}
```

## LightboxItem Schema

| Field         | Type                 | Required | Description                  |
| ------------- | -------------------- | -------- | ---------------------------- |
| `src`         | `string`             | yes      | URL of image/video           |
| `type`        | `'image' \| 'video'` | no       | Item type. Default `'image'` |
| `poster`      | `string`             | no       | Thumbnail for video items    |
| `title`       | `string`             | no       | Title in info overlay        |
| `description` | `string`             | no       | Description below title      |
| `width`       | `number`             | no       | Intrinsic image width px     |
| `height`      | `number`             | no       | Intrinsic image height px    |

## RkLightboxOverlayComponent Inputs

| Input                   | Type                    | Default           | Description                                                                                                                                                                  |
| ----------------------- | ----------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`                | `boolean`               | required          | Visibility; false = overlay removed from DOM                                                                                                                                 |
| `items`                 | `LightboxItem[]`        | required          | Array of items (images/videos)                                                                                                                                               |
| `initialIndex`          | `number`                | `0`               | Zero-based index of initial item                                                                                                                                             |
| `transitionFn`          | `TransitionTransformFn` | `slideTransition` | Slide transition fn. Import from `@reelkit/angular-lightbox` (`slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition`) or pass a custom one. |
| `showInfo`              | `boolean`               | `true`            | Render title/description info overlay                                                                                                                                        |
| `showControls`          | `boolean`               | `true`            | Render top controls bar (close, counter, fullscreen)                                                                                                                         |
| `showNavigation`        | `boolean`               | `true`            | Render prev/next nav arrows (desktop only)                                                                                                                                   |
| `transitionDuration`    | `number`                | `300`             | Slide animation duration ms                                                                                                                                                  |
| `swipeDistanceFactor`   | `number`                | `0.12`            | Min swipe distance fraction (0–1) to trigger slide change                                                                                                                    |
| `swipeToCloseDirection` | `'up' \| 'down'`        | `'up'`            | Swipe-to-close direction on mobile                                                                                                                                           |
| `loop`                  | `boolean`               | `false`           | Wrap last slide back to first                                                                                                                                                |
| `enableNavKeys`         | `boolean`               | `true`            | Keyboard arrow-key nav                                                                                                                                                       |
| `enableWheel`           | `boolean`               | `true`            | Mouse-wheel nav                                                                                                                                                              |
| `wheelDebounceMs`       | `number`                | `200`             | Wheel event debounce ms                                                                                                                                                      |
| `ariaLabel`             | `string`                | `'Image gallery'` | Accessible label for dialog region                                                                                                                                           |

## Outputs

| Output        | Type                        | Description                                     |
| ------------- | --------------------------- | ----------------------------------------------- |
| `apiReady`    | `EventEmitter<LightboxApi>` | Fires once slider ready, exposes imperative API |
| `closed`      | `EventEmitter<void>`        | Fires when user closes lightbox                 |
| `slideChange` | `EventEmitter<number>`      | Fires w/ new active slide index after change    |

## Template Slot Directives

| Directive              | Context                 | Description                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `rkLightboxSlide`      | `SlideSlotContext`      | Replace slide content (required for video slides)     |
| `rkLightboxControls`   | `ControlsSlotContext`   | Replace top controls bar (close, counter, fullscreen) |
| `rkLightboxNavigation` | `NavigationSlotContext` | Replace prev/next nav arrows                          |
| `rkLightboxInfo`       | `InfoSlotContext`       | Replace bottom title/description gradient overlay     |
| `rkLightboxLoading`    | `LoadingSlotContext`    | Custom loading indicator                              |
| `rkLightboxError`      | `ErrorSlotContext`      | Custom error indicator                                |

### Slot Context Types

| Name                    | Fields                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `SlideSlotContext`      | `{ $implicit: item, index, size: [number, number], isActive, onReady, onWaiting, onError }` |
| `ControlsSlotContext`   | `{ $implicit: onClose, item, activeIndex, count, isFullscreen, onToggleFullscreen }`        |
| `NavigationSlotContext` | `{ $implicit: onPrev, onNext, item, activeIndex, count }`                                   |
| `InfoSlotContext`       | `{ $implicit: item, index }`                                                                |
| `LoadingSlotContext`    | `{ $implicit: item, activeIndex }`                                                          |
| `ErrorSlotContext`      | `{ $implicit: item, activeIndex }`                                                          |

## Keyboard Shortcuts

| Key          | Action                                        |
| ------------ | --------------------------------------------- |
| `ArrowLeft`  | Previous image                                |
| `ArrowRight` | Next image                                    |
| `Escape`     | Close lightbox (or exit fullscreen if active) |

## CSS Theming

Tokens + classes shared w/ `@reelkit/react-lightbox`. See [Lightbox](/docs/lightbox) for full ref. Token prefix `--rk-lightbox-*`, class prefix `.rk-lightbox-*`.

## Custom Slot Examples

### `rkLightboxControls`

```html
<rk-lightbox-overlay [isOpen]="isOpen()" [items]="items">
  <ng-template
    rkLightboxControls
    let-onClose="$implicit"
    let-activeIndex="activeIndex"
    let-count="count"
    let-isFullscreen="isFullscreen"
    let-onToggleFullscreen="onToggleFullscreen"
  >
    <button (click)="onClose()">×</button>
    <span>{{ activeIndex + 1 }} / {{ count }}</span>
    <button (click)="onToggleFullscreen()">
      {{ isFullscreen ? '⤡' : '⤢' }}
    </button>
  </ng-template>
</rk-lightbox-overlay>
```

### `rkLightboxSlide` for video items

```html
<rk-lightbox-overlay [isOpen]="isOpen()" [items]="items">
  <ng-template
    rkLightboxSlide
    let-item="$implicit"
    let-size="size"
    let-isActive="isActive"
    let-onReady="onReady"
    let-onError="onError"
  >
    @if (item.type === 'video') {
    <video
      [src]="item.src"
      [poster]="item.poster"
      [width]="size[0]"
      [height]="size[1]"
      [autoplay]="isActive"
      muted
      playsinline
      (canplay)="onReady()"
      (error)="onError()"
    ></video>
    } @else {
    <img [src]="item.src" (load)="onReady()" (error)="onError()" />
    }
  </ng-template>
</rk-lightbox-overlay>
```

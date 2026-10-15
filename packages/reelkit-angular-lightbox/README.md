# @reelkit/angular-lightbox

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular-lightbox"><img src="https://img.shields.io/npm/v/@reelkit/angular-lightbox?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-19.1%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-94%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://angular-demo.reelkit.dev/image-preview?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/lightbox.gif" width="240" alt="An image lightbox on a phone: tapping a gallery thumbnail opens it full screen, two sideways swipes page to the third photo, and a swipe up closes it back to the gallery." /></a>
</p>

Image gallery lightbox for Angular — opens full-screen with swipe navigation, keyboard controls, and transition effects. Every part of the UI is replaceable via template slots. ~19.1 kB gzip.

**[Live Demo](https://angular-demo.reelkit.dev/image-preview?utm_source=npm)**

## Installation

```bash
npm install @reelkit/angular-lightbox @reelkit/angular lucide-angular
```

Register the stylesheet once, any of three equivalent ways:

```typescript
// Anywhere that runs at startup — main.ts, app.config.ts, a component file.
import '@reelkit/angular-lightbox/styles.css';
// Or, from a global stylesheet:
//   @import '@reelkit/angular-lightbox/styles.css';
// Or in angular.json:
//   "styles": ["node_modules/@reelkit/angular-lightbox/styles.css"]
```

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';

@Component({
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: `
    @for (img of images; track img.src; let i = $index) {
      <img [src]="img.src" (click)="open(i)" />
    }
    <rk-lightbox-overlay
      [isOpen]="isOpen()"
      [items]="images"
      [initialIndex]="startIndex()"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class GalleryComponent {
  isOpen = signal(false);
  startIndex = signal(0);

  images: LightboxItem[] = [
    {
      src: 'https://example.com/image1.jpg',
      title: 'Sunset',
      description: 'Beautiful sunset over the ocean',
    },
    { src: 'https://example.com/image2.jpg', title: 'Mountains' },
  ];

  open(index: number) {
    this.startIndex.set(index);
    this.isOpen.set(true);
  }
}
```

## Features

- Touch gestures — swipe to navigate, swipe up to close
- Keyboard navigation — arrow keys, Escape
- Fullscreen — cross-browser Fullscreen API
- Transitions — tree-shakable `slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition` (import only what you use)
- Image preloading — adjacent images prefetched
- Video slides (opt-in) — via `rkLightboxSlide` template slot
- Counter — "1 / 10" indicator
- Info overlay — title and description with gradient
- Template slots — `rkLightboxControls`, `rkLightboxNavigation`, `rkLightboxInfo`, `rkLightboxSlide` to override any part
- Slideshow (opt-in) — `autoAdvance` plays the gallery on its own: images after they load, videos when they end, paused while the mouse is on a control
- Download (opt-in) — `showDownload` adds a button that saves the active item, from `downloadUrl` when the preview is a resized copy
- Sub-components — `RkCloseButtonComponent`, `RkCounterComponent`, `RkFullscreenButtonComponent`, `RkSoundButtonComponent`, `RkPlayPauseButtonComponent`, `RkDownloadButtonComponent`, `RkLightboxVideoSlideComponent`
- Shareable URLs — `<rk-lightbox-url-overlay>` opens itself from the address bar
- `rkSwipeToClose` directive for dismissing the overlay by swipe

## Template Slots

| Directive              | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `rkLightboxControls`   | Custom controls (close, counter, etc.)            |
| `rkLightboxNavigation` | Custom prev/next navigation arrows                |
| `rkLightboxInfo`       | Custom title/description overlay                  |
| `rkLightboxSlide`      | Custom slide renderer (required for video slides) |
| `rkLightboxLoading`    | Custom loading indicator                          |
| `rkLightboxError`      | Custom error indicator                            |

## API Reference

### rk-lightbox-overlay Inputs

| Input                   | Type                    | Default           | Description                               |
| ----------------------- | ----------------------- | ----------------- | ----------------------------------------- |
| `isOpen`                | `boolean`               | required          | Controls lightbox visibility              |
| `items`                 | `LightboxItem[]`        | required          | Array of items to display                 |
| `initialIndex`          | `number`                | `0`               | Starting image index                      |
| `transitionFn`          | `TransitionTransformFn` | `slideTransition` | Slide transition fn (built-in or custom)  |
| `swipeToCloseDirection` | `SwipeToCloseDirection` | `'up'`            | Which way a swipe dismisses the lightbox  |
| `ariaLabel`             | `string`                | `'Image gallery'` | Dialog `aria-label`                       |
| `showInfo`              | `boolean`               | `true`            | Show title/description                    |
| `loop`                  | `boolean`               | `false`           | Enable infinite loop                      |
| `enableNavKeys`         | `boolean`               | `true`            | Enable keyboard navigation                |
| `enableWheel`           | `boolean`               | `true`            | Enable mouse wheel                        |
| `wheelDebounceMs`       | `number`                | `200`             | Wheel debounce (ms)                       |
| `transitionDuration`    | `number`                | `300`             | Animation duration (ms)                   |
| `swipeDistanceFactor`   | `number`                | `0.12`            | Swipe threshold (0-1)                     |
| `autoAdvance`           | `boolean`               | `false`           | Play the gallery as a slideshow           |
| `autoAdvanceInterval`   | `number`                | `5000`            | Image time in a slideshow (ms), from load |
| `showDownload`          | `boolean`               | `false`           | Add a download button                     |

### rk-lightbox-overlay Outputs

| Output        | Type     | Description                  |
| ------------- | -------- | ---------------------------- |
| `closed`      | `void`   | Emitted when lightbox closes |
| `slideChange` | `number` | Emitted after slide change   |

### Types

```typescript
interface LightboxItem {
  src: string;
  type?: 'image' | 'video';
  poster?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  downloadUrl?: string; // what the download button saves; defaults to src
  downloadName?: string; // file name; defaults to the URL's last segment
}
```

The `rkLightboxControls` context also carries `isAutoAdvancing` and
`isDownloading`, plus `onToggleAutoAdvance` and `onDownload` only when the
feature is on. The `rkLightboxSlide` context carries `autoAdvance` and
`onEnded`: bind `[loop]="!autoAdvance"` and `[onEnded]="onEnded"` on
`rk-lightbox-video-slide` so a video plays once and moves the slideshow on.

### Sub-components

Use these inside custom `rkLightboxControls` templates:

| Component                     | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `RkCloseButtonComponent`      | Close button                                  |
| `RkCounterComponent`          | "1 / 10" counter                              |
| `RkFullscreenButtonComponent` | Fullscreen toggle                             |
| `RkSoundButtonComponent`      | Mute/unmute toggle                            |
| `RkPlayPauseButtonComponent`  | Slideshow toggle; `[playing]`, `(toggled)`    |
| `RkDownloadButtonComponent`   | Download button; `[downloading]`, `(pressed)` |

## Slideshow and download (opt-in)

```html
<rk-lightbox-overlay
  [isOpen]="isOpen()"
  [items]="images"
  [autoAdvance]="true"
  [autoAdvanceInterval]="4000"
  [showDownload]="true"
  (closed)="isOpen.set(false)"
/>
```

`autoAdvance` counts each image's interval from the moment it has loaded,
plays a video once and moves on when it ends, waits while the mouse rests on a
control, during a swipe and while the page is hidden, and stops on the last
slide unless `loop` is set. It runs outside the Angular zone. A play/pause
button joins the controls.

`showDownload` adds a button that saves the active item from `downloadUrl` (or
`src`) under `downloadName`. The file is fetched so a cross-origin link still
downloads; when the server sends no CORS headers it opens in a new tab instead.

## URL-driven lightbox

`<rk-lightbox-url-overlay>` takes the same inputs except `isOpen` — the address
bar owns the open state, so a shared link opens the gallery on the right image:

```ts
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, urlIndexKey } from '@reelkit/angular';

@Component({
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: `
    @for (image of images(); track image.src; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ photo: i }">
        <img [src]="image.src" alt="" />
      </a>
    }

    <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
  `,
})
export class GalleryComponent {
  protected readonly images = signal(photos);

  // Attaches now, releases on destroy.
  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...urlIndexKey(() => this.images().length),
  });
}
```

In a routed application pass `adapter: createRouterUrlAdapter()` from
`@reelkit/angular/ng-router-url-adapter`, otherwise the router's own location
goes stale. Swap `urlIndexKey` for `urlStableIdKey({ items: () => this.images() })`
to key the URL by image id.

## Keyboard Shortcuts

| Key          | Action                              |
| ------------ | ----------------------------------- |
| `ArrowLeft`  | Previous image                      |
| `ArrowRight` | Next image                          |
| `Escape`     | Close lightbox (or exit fullscreen) |

## CSS Classes

All UI elements use CSS classes prefixed with `rk-lightbox-`:

| Class                          | Description                 |
| ------------------------------ | --------------------------- |
| `.rk-lightbox-overlay`         | Root container              |
| `.rk-lightbox-close`           | Close button                |
| `.rk-lightbox-nav`             | Navigation arrows           |
| `.rk-lightbox-nav-prev`        | Previous arrow              |
| `.rk-lightbox-nav-next`        | Next arrow                  |
| `.rk-lightbox-counter`         | Image counter               |
| `.rk-lightbox-btn`             | Control buttons             |
| `.rk-lightbox-play-pause`      | Slideshow play/pause button |
| `.rk-lightbox-download`        | Download button             |
| `.rk-lightbox-info`            | Title/description container |
| `.rk-lightbox-title`           | Image title                 |
| `.rk-lightbox-description`     | Image description           |
| `.rk-lightbox-slide`           | Slide container             |
| `.rk-lightbox-img`             | Image element               |
| `.rk-lightbox-video-container` | Video slide wrapper         |
| `.rk-lightbox-video-element`   | Video element               |
| `.rk-lightbox-video-poster`    | Video poster image          |
| `.rk-lightbox-video-error`     | Video error state container |
| `.rk-lightbox-top-shade`       | Top gradient scrim          |
| `.rk-lightbox-spinner`         | Default loading spinner     |
| `.rk-lightbox-img-error`       | Image error state container |
| `.rk-lightbox-swipe-hint`      | Mobile swipe hint chip      |
| `.rk-lightbox-empty`           | Empty state text            |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-lightbox-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-lightbox-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/angular-lightbox?framework=angular#theming) for the full token table.

## Documentation

Docs, runnable StackBlitz examples, and customization guides at **[reelkit.dev/docs/angular-lightbox](https://reelkit.dev/docs/angular-lightbox?framework=angular)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

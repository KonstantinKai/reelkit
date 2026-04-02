# @reelkit/angular-lightbox

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular-lightbox"><img src="https://img.shields.io/npm/v/@reelkit/angular-lightbox?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/angular%20gzip-17.9%20kB-6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Image gallery lightbox for Angular — opens full-screen with swipe navigation, keyboard controls, and transition effects. Every part of the UI is replaceable via template slots. ~18.0 kB gzip.

## Installation

```bash
npm install @reelkit/angular-lightbox @reelkit/angular lucide-angular
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
- Transitions — slide, fade, and zoom-in effects
- Image preloading — adjacent images prefetched
- Video slides (opt-in) — via `rkLightboxSlide` template slot
- Counter — "1 / 10" indicator
- Info overlay — title and description with gradient
- Template slots — `rkLightboxControls`, `rkLightboxNavigation`, `rkLightboxInfo`, `rkLightboxSlide` to override any part
- Sub-components — `RkCloseButtonComponent`, `RkCounterComponent`, `RkFullscreenButtonComponent`, `RkSoundButtonComponent`

## Template Slots

| Directive              | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `rkLightboxControls`   | Custom controls (close, counter, etc.)            |
| `rkLightboxNavigation` | Custom prev/next navigation arrows                |
| `rkLightboxInfo`       | Custom title/description overlay                  |
| `rkLightboxSlide`      | Custom slide renderer (required for video slides) |

## API Reference

### rk-lightbox-overlay Inputs

| Input                 | Type             | Default   | Description                  |
| --------------------- | ---------------- | --------- | ---------------------------- |
| `isOpen`              | `boolean`        | required  | Controls lightbox visibility |
| `items`               | `LightboxItem[]` | required  | Array of items to display    |
| `initialIndex`        | `number`         | `0`       | Starting image index         |
| `transition`          | `TransitionType` | `'slide'` | Transition animation type    |
| `showInfo`            | `boolean`        | `true`    | Show title/description       |
| `loop`                | `boolean`        | `false`   | Enable infinite loop         |
| `enableNavKeys`       | `boolean`        | `true`    | Enable keyboard navigation   |
| `enableWheel`         | `boolean`        | `true`    | Enable mouse wheel           |
| `wheelDebounceMs`     | `number`         | `200`     | Wheel debounce (ms)          |
| `transitionDuration`  | `number`         | `300`     | Animation duration (ms)      |
| `swipeDistanceFactor` | `number`         | `0.12`    | Swipe threshold (0-1)        |

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
}

type TransitionType = 'slide' | 'fade' | 'zoom-in';
```

### Sub-components

Use these inside custom `rkLightboxControls` templates:

| Component                     | Description        |
| ----------------------------- | ------------------ |
| `RkCloseButtonComponent`      | Close button       |
| `RkCounterComponent`          | "1 / 10" counter   |
| `RkFullscreenButtonComponent` | Fullscreen toggle  |
| `RkSoundButtonComponent`      | Mute/unmute toggle |

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
| `.rk-lightbox-container`       | Root container              |
| `.rk-lightbox-close`           | Close button                |
| `.rk-lightbox-nav`             | Navigation arrows           |
| `.rk-lightbox-nav-prev`        | Previous arrow              |
| `.rk-lightbox-nav-next`        | Next arrow                  |
| `.rk-lightbox-counter`         | Image counter               |
| `.rk-lightbox-btn`             | Control buttons             |
| `.rk-lightbox-info`            | Title/description container |
| `.rk-lightbox-title`           | Image title                 |
| `.rk-lightbox-description`     | Image description           |
| `.rk-lightbox-slide`           | Slide container             |
| `.rk-lightbox-img`             | Image element               |
| `.rk-lightbox-video-container` | Video slide wrapper         |
| `.rk-lightbox-video-element`   | Video element               |
| `.rk-lightbox-video-poster`    | Video poster image          |
| `.rk-lightbox-video-loader`    | Video loading indicator     |

## Documentation

Docs, demos, and customization examples at **[reelkit.dev/docs/angular-lightbox](https://reelkit.dev/docs/angular-lightbox)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

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

Placement: unlike React/Vue (portal to `document.body`), `rk-lightbox-overlay` renders where placed, `position: fixed`. Keep it out of ancestors with `transform` / `perspective` / `filter` / `will-change: transform` — that ancestor becomes the containing block: lightbox sized to it, clipped by its `overflow`. An ancestor stacking context caps `--rk-lightbox-overlay-z`. Upside: `--rk-lightbox-*` tokens on any ancestor reach the lightbox.

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

| Field          | Type                 | Required | Description                               |
| -------------- | -------------------- | -------- | ----------------------------------------- |
| `src`          | `string`             | yes      | URL of image/video                        |
| `type`         | `'image' \| 'video'` | no       | Item type. Default `'image'`              |
| `poster`       | `string`             | no       | Thumbnail for video items                 |
| `title`        | `string`             | no       | Title in info overlay                     |
| `description`  | `string`             | no       | Description below title                   |
| `width`        | `number`             | no       | Intrinsic image width px                  |
| `height`       | `number`             | no       | Intrinsic image height px                 |
| `downloadUrl`  | `string`             | no       | What download button saves; default `src` |
| `downloadName` | `string`             | no       | File name; default last URL path segment  |

## Video Support

Video slides are opt-in via the `rkLightboxSlide` template slot plus `RkLightboxVideoSlideComponent` (selector `rk-lightbox-video-slide`). This keeps the video player out of the bundle for galleries that only need images.

The built-in sound button appears only when a `SoundStateService` is provided above `<rk-lightbox-overlay>` — that shared instance is what lets a toggle reach the video, since the slide renders from your template. Without one, drive the element directly with `setLightboxVideoMuted`.

```html
<rk-lightbox-overlay
  [isOpen]="isOpen"
  [items]="items"
  (closed)="isOpen = false"
>
  <ng-template
    rkLightboxSlide
    let-item
    let-index="index"
    let-size="size"
    let-isActive="isActive"
    let-autoAdvance="autoAdvance"
    let-onReady="onReady"
    let-onEnded="onEnded"
  >
    @if (item.type === 'video') {
    <!-- With autoAdvance the video plays once and reports its end -->
    <rk-lightbox-video-slide
      [src]="item.src"
      [poster]="item.poster"
      [slideKey]="'lightbox-' + index"
      [size]="size"
      [isActive]="isActive"
      [loop]="!autoAdvance"
      [onReady]="onReady"
      [onEnded]="onEnded"
    />
    } @else {
    <img
      [src]="item.src"
      [style.width.px]="size[0]"
      [style.height.px]="size[1]"
    />
    }
  </ng-template>
</rk-lightbox-overlay>
```

## URL State (shareable links, back button)

Live demo: https://angular-demo.reelkit.dev/image-preview-url

`RkLightboxUrlOverlayComponent` is a separate component whose open state lives in the URL. Build a controller with `createOverlayUrlState` from `@reelkit/angular` and pass it as `[controller]`: the gallery opens itself when the param names a slide and closes when it goes away. **Opening is a link** — the href is the open action, no click handler.

> **Built-in keys.** Spread `urlIndexKey` (by position) or `urlStableIdKey` (by a stable `id`) into the controller — both re-exported from `@reelkit/angular`. See the [URL State guide](/docs/core/guide#url-state) and [Core API](/docs/core/api#url-state).

```ts
import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import {
  createOverlayUrlState,
  urlIndexKey,
  urlStableIdKey,
} from '@reelkit/angular';

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

  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...urlIndexKey(() => this.images().length),
  });
}
```

Call `createOverlayUrlState` in an injection context — a field initialiser or the constructor. It attaches immediately and releases through `DestroyRef`, so a component destroyed while the gallery is open leaves no listener behind.

- Opening pushes **one** history entry. Paging slides **replaces** it — N swipes add 0 entries, so one back step always leaves the gallery. Back closes; it does not step photos.
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay.
- Deep link `?photo=3` opens the gallery at that slide on load.
- A param naming no slide (stale bookmark, hand-edited) is dropped from the URL instead of leaving the address bar asserting a slide that cannot open.

**Routed app — pass an adapter.** Writing `history.pushState` behind the Router leaves its location stale and its next navigation drops the param. Build an adapter on `Router` and pass it as `adapter`.

**Template slots work unchanged.** The url component runs the six slot queries itself and forwards each template to the gallery, so `<ng-template rkLightboxControls>` and its siblings sit inside `<rk-lightbox-url-overlay>` exactly as they would inside `<rk-lightbox-overlay>`.

**Stable links.** The index is positional — a bookmarked `?photo=3` opens a different image once the list is reordered. `urlStableIdKey` keys by each item's stable `id`, scanning the live list — one call covers the common case:

```ts
const photo = createOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => this.images() }),
});
```

Pass `hashCodec: base64UrlCodec` to base64url-encode the id in the URL — reversible obfuscation, not a cryptographic hash.

Key by a different field (a `slug`), or page an infinite feed with `locateAsync`, and build the `codec` (wire) and `locator` (lookup) yourself.

**Infinite / paginated galleries.** `locate` is synchronous, so it only answers for images already loaded. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have. While it is pending the gallery stays closed and the param is left alone, so the deep link survives the fetch; `null` or a rejection drops the param.

> **Shortcut.** Keying by the item's `id`? Skip the hand-rolled codec and locator — pass `locateAsync` straight to `urlStableIdKey({ items, locateAsync })` (it fetches on a miss, then returns the index). The fuller version below is for keying by another field, or for full control.

```ts
const photo = createOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.images().findIndex((x) => x.id === id),
    identify: (index) => this.images()[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      this.images.set(loaded); // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
```

An answer arriving after the URL moved on, after a close, or after destroy is discarded. Whatever it returns is authoritative — the lightbox takes it as-is rather than re-reading `images`, which Angular has not re-rendered yet.

## Auto-advance

`[autoAdvance]="true"` → slideshow on open. Off by default.

- Images stay `autoAdvanceInterval` (default 5000 ms), counted from load; failed image counts from error.
- Videos play once (no loop), advance on end. In `rkLightboxSlide` bind `[loop]="!autoAdvance"` + `[onEnded]="onEnded"` on `rk-lightbox-video-slide` (see Video Support).
- Waits while mouse rests on a control (button, link, caption), during swipe, while page hidden; continues from same progress.
- Manual nav restarts new slide's interval; slideshow stays on. Stops on last slide unless `loop`.
- Runs outside Angular zone → no change detection per frame.
- Custom `rkLightboxControls` gets `isAutoAdvancing` + `onToggleAutoAdvance` (only with `autoAdvance`) → render `rk-play-pause-button` when present.
- Timing = `createSlideshowController` from `@reelkit/core` ([Autoplay guide](/docs/core/guide#autoplay), [Core API](/docs/core/api#autoplay)).

```html
<rk-lightbox-overlay
  [isOpen]="isOpen"
  [items]="items"
  [autoAdvance]="true"
  [autoAdvanceInterval]="4000"
  (closed)="isOpen = false"
>
  <ng-template rkLightboxControls let-ctx>
    @if (ctx.onToggleAutoAdvance) {
    <rk-play-pause-button
      [playing]="ctx.isAutoAdvancing"
      (toggled)="ctx.onToggleAutoAdvance()"
    />
    }
    <rk-close-button (clicked)="ctx.onClose()" />
  </ng-template>
</rk-lightbox-overlay>
```

## Download

`[showDownload]="true"` → download button in controls. Saves active item from `downloadUrl` (else `src`) as `downloadName` (else last URL path segment).

- Fetch → blob → save (browsers ignore `download` attr cross-origin). Fetch fails (no CORS usual) → new tab. Serve with `Access-Control-Allow-Origin` for one-click save.
- Button disabled while downloading. Custom `rkLightboxControls` gets `isDownloading` + `onDownload` (only with `showDownload`) → render `rk-download-button` when present.
- Helper = `downloadFile` from `@reelkit/core` ([Download guide](/docs/core/guide#download)).

```html
<rk-lightbox-overlay
  [isOpen]="isOpen"
  [items]="items"
  [showDownload]="true"
  (closed)="isOpen = false"
>
  <ng-template rkLightboxControls let-ctx>
    @if (ctx.onDownload) {
    <rk-download-button
      [downloading]="ctx.isDownloading"
      (pressed)="ctx.onDownload()"
    />
    }
    <rk-close-button (clicked)="ctx.onClose()" />
  </ng-template>
</rk-lightbox-overlay>
```

Classes `.rk-lightbox-play-pause`, `.rk-lightbox-download` (with `.rk-lightbox-btn`); token `--rk-lightbox-btn-disabled-opacity` (`0.5`).

## RkLightboxUrlOverlayComponent Inputs

Takes every input of `rk-lightbox-overlay` except `isOpen`, replaced by `controller`.

| Input        | Type                 | Default  | Description                                                                                                                                                                |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `createOverlayUrlState`. Its `position` decides whether the gallery is open and which slide it shows; the component writes back on slide change and close. |

Outputs are the same `closed` and `slideChange`; the URL drives closing, so `closed` is a notification rather than the mechanism.

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
| `autoAdvance`           | `boolean`               | `false`           | Slideshow (see Auto-advance)                                                                                                                                                 |
| `autoAdvanceInterval`   | `number`                | `5000`            | Image time during slideshow, ms, from load                                                                                                                                   |
| `showDownload`          | `boolean`               | `false`           | Download button (see Download)                                                                                                                                               |
| `ariaLabel`             | `string`                | `'Image gallery'` | Accessible label for dialog region                                                                                                                                           |

## Outputs

| Output        | Type                   | Description                                  |
| ------------- | ---------------------- | -------------------------------------------- |
| `closed`      | `EventEmitter<void>`   | Fires when user closes lightbox              |
| `slideChange` | `EventEmitter<number>` | Fires w/ new active slide index after change |

## Template Slot Directives

| Directive              | Class                           | Context                   | Description                                           |
| ---------------------- | ------------------------------- | ------------------------- | ----------------------------------------------------- |
| `rkLightboxSlide`      | `RkLightboxSlideDirective`      | `LightboxSlideContext`    | Replace slide content (required for video slides)     |
| `rkLightboxControls`   | `RkLightboxControlsDirective`   | `LightboxControlsContext` | Replace top controls bar (close, counter, fullscreen) |
| `rkLightboxNavigation` | `RkLightboxNavigationDirective` | `LightboxNavContext`      | Replace prev/next nav arrows                          |
| `rkLightboxInfo`       | `RkLightboxInfoDirective`       | `LightboxInfoContext`     | Replace bottom title/description gradient overlay     |
| `rkLightboxLoading`    | `RkLightboxLoadingDirective`    | `LightboxLoadingContext`  | Custom loading indicator                              |
| `rkLightboxError`      | `RkLightboxErrorDirective`      | `LightboxErrorContext`    | Custom error indicator                                |

### Control Components

Standalone components to compose inside an `rkLightboxControls` template. Import each into the host component's `imports`.

| Component                     | Selector               | Description                                                               |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `RkCloseButtonComponent`      | `rk-close-button`      | Default close button                                                      |
| `RkCounterComponent`          | `rk-counter`           | Counter chip; takes `[currentIndex]` and `[count]`                        |
| `RkFullscreenButtonComponent` | `rk-fullscreen-button` | Fullscreen toggle button                                                  |
| `RkPlayPauseButtonComponent`  | `rk-play-pause-button` | Slideshow toggle; `[playing]`, `(toggled)`; `aria-pressed` while playing  |
| `RkDownloadButtonComponent`   | `rk-download-button`   | Download button; `[downloading]`, `(pressed)`; disabled while downloading |

```html
<ng-template
  rkLightboxControls
  let-onClose="onClose"
  let-activeIndex="activeIndex"
  let-count="count"
  let-isFullscreen="isFullscreen"
  let-onToggleFullscreen="onToggleFullscreen"
>
  <rk-close-button (clicked)="onClose()" />
  <rk-counter [currentIndex]="activeIndex + 1" [count]="count" />
  <rk-fullscreen-button
    [isFullscreen]="isFullscreen"
    (toggled)="onToggleFullscreen()"
  />
</ng-template>
```

### Slot Context Types

| Name                      | Fields                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LightboxSlideContext`    | `{ $implicit: item, index, size: [number, number], isActive, autoAdvance, onReady, onWaiting, onError, onEnded }`                                             |
| `LightboxControlsContext` | `{ $implicit: void, item, activeIndex, count, isFullscreen, isAutoAdvancing, isDownloading, onClose, onToggleFullscreen, onToggleAutoAdvance?, onDownload? }` |
| `LightboxNavContext`      | `{ $implicit: void, item, activeIndex, count, onPrev, onNext }`                                                                                               |
| `LightboxInfoContext`     | `{ $implicit: item, index }`                                                                                                                                  |
| `LightboxLoadingContext`  | `{ $implicit: activeIndex, item }`                                                                                                                            |
| `LightboxErrorContext`    | `{ $implicit: activeIndex, item }`                                                                                                                            |

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
    let-onClose="onClose"
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

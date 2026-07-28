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

## Timeline

`RkTimelineBarComponent` (selector `rk-timeline-bar`) is the default playback scrub bar. It consumes `TimelineStateService` — provided by `RkReelPlayerOverlayComponent` — and renders the track, buffered ranges, progress fill, and scrub pill. Inputs: `class?: string`, `style?: Record<string, string>`. Theme via the `--rk-reel-timeline-*` custom properties, or inject `TimelineStateService` directly for full control in a custom consumer component.

```html
<rk-reel-player-overlay [isOpen]="isOpen()" [content]="items">
  <!-- Wrap or augment the default bar: -->
  <ng-template rkPlayerTimeline>
    <my-timecode />
    <rk-timeline-bar />
  </ng-template>
</rk-reel-player-overlay>
```

## SoundStateService

Provided at the `RkReelPlayerOverlayComponent` level. Injected by the default sound button and exposed in the controls template slot context. Inject it in custom controls that are children of the overlay for direct access.

```typescript
import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular-reel-player';

@Component({ ... })
export class AppComponent {
  readonly soundState = inject(SoundStateService);
  // soundState.muted(), soundState.disabled(), soundState.toggle()
}
```

## URL State (shareable links, back button)

`RkReelPlayerUrlOverlayComponent` puts the open state in the address bar: build a controller with `createOverlayUrlState` in an injection context and pass it as `[controller]`. The player opens when the parameter names a slide and closes when it clears — links are shareable and the back button closes it. `RkReelPlayerOverlayComponent` stays `[isOpen]`-controlled, so each component carries exactly one open-state driver.

> **Built-in keys.** Spread `urlIndexKey` (by position) or `urlStableIdKey` (by a stable `id`) into the controller — both re-exported from `@reelkit/angular`. See the [URL State guide](/docs/core/guide#url-state) and [Core API](/docs/core/api#url-state).

Opening pushes one history entry and every slide change replaces it, so paging a feed adds no entries and one back step always leaves. Back closes only when opened from within the app; a shared link opened in a fresh tab has no history behind it, so close with the ✕ button or Escape. A parameter naming no slide is dropped instead of asserting one that cannot open. The URL depth follows the controller's key: a one-axis `urlIndexKey` addresses the post only (`?reel=3`), a two-axis `urlIndexTwoAxisKey` also carries a multi-media post's inner media index (`?reel=3.2`); pick one key per app, the two wire shapes do not cross-decode.

A routed app passes a Router-backed adapter — `createRouterUrlAdapter` from `@reelkit/angular/ng-router-url-adapter` — so the Router stays the single source of navigation truth.

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import {
  createOverlayUrlState,
  urlIndexKey,
  urlStableIdKey,
} from '@reelkit/angular';
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
  content: ContentItem[] = [
    /* ... */
  ];
  protected readonly reel = createOverlayUrlState({
    param: 'reel',
    adapter: createRouterUrlAdapter(),
    ...urlIndexKey(() => this.content.length),
  });
}
```

Full `createOverlayUrlState` options: [Angular API reference](/docs/angular/api#createoverlayurlstate).

### One key or two — pick your URL depth

The same `RkReelPlayerUrlOverlayComponent` drives either shape; it discriminates at runtime from the controller's position, so there is no mode input. Choose the key when you build the controller:

| Key                     | Wire        | Carries                                               |
| ----------------------- | ----------- | ----------------------------------------------------- |
| `urlIndexKey(…)`        | `?reel=3`   | The vertical post only.                               |
| `urlIndexTwoAxisKey(…)` | `?reel=3.2` | The post **and** the inner media index of a carousel. |

The two wires are deliberately distinct — a two-axis key is strictly dotted (`3.0`, never a bare `3`), so a bare one-axis link does not cross-decode. Switching an app between keys invalidates any previously shared links. Pick one shape and keep it.

```ts
import { createOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/angular';

protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => this.content.length,
    innerCounts: () => this.content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2 — ?reel=3.2
```

**Stable links.** The index is positional, so a bookmarked `?reel=3` opens a different post once the feed is reordered, which for a feed is the normal case. `urlStableIdKey` keys by each post's stable `id`, scanning the live feed — one call covers the common case:

```ts
protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => this.loaded() }),
});
```

Pass `hashCodec: base64UrlCodec` to base64url-encode the id in the URL — reversible obfuscation, not a cryptographic hash.

Key by a different field (a `slug`), or page an infinite feed with `locateAsync`, and build the `codec` (wire) and `locator` (lookup) yourself.

```ts
protected readonly reel = createOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
  },
});
```

**Infinite feeds.** `locate` is synchronous, so it can only answer for posts already loaded — a shared link to post 400 of a feed that has loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have.

> **Shortcut.** Keying by the item's `id`? Skip the hand-rolled codec and locator — pass `locateAsync` straight to `urlStableIdKey({ items, locateAsync })` (it fetches on a miss, then returns the index). The fuller version below is for keying by another field, or for full control.

```ts
protected readonly reel = createOverlayUrlState({
  param: 'reel',
  adapter: createRouterUrlAdapter(),
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
    locateAsync: async (id) => {
      const page = await this.loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!page) return null; // exhausted — link names no post
      this.loaded.set(page); // commit — the overlay renders from this state
      return page.findIndex((x) => x.id === id);
    },
  },
});
```

- While `locateAsync` is pending the player stays closed and the parameter is left alone, so the deep link survives the fetch. `null` or a rejection drops the parameter.
- An answer arriving after the URL moved on, after a close, or after unmount is discarded — a slow fetch cannot open a slide nobody asked for.
- Nothing is rendered while pending; the page already owns that loading state, so render your own skeleton.
- There is no timeout — the player cannot know how long the feed is. Settle with `null` when pagination is exhausted, or the overlay stays closed indefinitely.

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

## RkReelPlayerUrlOverlayComponent Inputs

Type: `RkReelPlayerUrlOverlayProps`

Takes every `RkReelPlayerOverlayComponent` input except `isOpen` and `initialIndex`, replaced by a `controller` whose position picks the slide. Outputs `closed` and `slideChange`.

| Input        | Type                 | Default  | Description                                                                                                                                                       |
| ------------ | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `createOverlayUrlState`. Its `position` decides whether the player is open and which slide it shows; the overlay writes back on change and close. |

## Template Slot Directives

Use these structural directives on `<ng-template>` for custom content:

| Directive                  | Class                               | Context                                              | Description                                                            |
| -------------------------- | ----------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `rkPlayerControls`         | `RkPlayerControlsDirective`         | `PlayerControlsContext<T>`                           | Custom global controls bar (close, sound toggle, etc.)                 |
| `rkPlayerError`            | `RkPlayerErrorDirective`            | `{ $implicit: activeIndex, item, innerActiveIndex }` | Custom error indicator slot                                            |
| `rkPlayerLoading`          | `RkPlayerLoadingDirective`          | `{ $implicit: activeIndex, item, innerActiveIndex }` | Custom loading indicator slot                                          |
| `rkPlayerNavigation`       | `RkPlayerNavigationDirective`       | `PlayerNavigationContext`                            | Custom prev/next nav arrows                                            |
| `rkPlayerNestedNavigation` | `RkPlayerNestedNavigationDirective` | `PlayerNestedNavigationContext`                      | Custom nav arrows for inner horizontal slider                          |
| `rkPlayerNestedSlide`      | `RkPlayerNestedSlideDirective`      | `PlayerNestedSlideContext`                           | Custom content for each slide in inner horizontal slider               |
| `rkPlayerSlide`            | `RkPlayerSlideDirective`            | `PlayerSlideContext<T>`                              | Fully custom slide replacing default media slide                       |
| `rkPlayerSlideOverlay`     | `RkPlayerSlideOverlayDirective`     | `PlayerSlideOverlayContext<T>`                       | Per-slide overlay (author info, likes, description, etc.)              |
| `rkPlayerTimeline`         | `RkPlayerTimelineDirective`         | `PlayerTimelineContext<T>`                           | Custom timeline bar. Rendered only when gate would render default bar. |

### Control Components

Standalone components to compose inside an `rkPlayerControls` template. Import each into the host component's `imports`.

| Component                | Selector          | Description                                                                       |
| ------------------------ | ----------------- | --------------------------------------------------------------------------------- |
| `RkCloseButtonComponent` | `rk-close-button` | Default close button for the controls bar                                         |
| `RkSoundButtonComponent` | `rk-sound-button` | Default mute/unmute toggle; takes the `soundState` from the controls slot context |

```html
<ng-template
  rkPlayerControls
  let-onClose="$implicit"
  let-soundState="soundState"
>
  <rk-sound-button [soundState]="soundState" />
  <rk-close-button (click)="onClose()" />
</ng-template>
```

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

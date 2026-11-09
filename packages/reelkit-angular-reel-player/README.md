# @reelkit/angular-reel-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular-reel-player"><img src="https://img.shields.io/npm/v/@reelkit/angular-reel-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-24.4%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-91%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://angular-demo.reelkit.dev/reel-player?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/reel.gif" width="240" alt="A full-screen reel player on a phone: a swipe up moves to a three-photo post, a swipe sideways shows its next photo, and a swipe down returns to the first post." /></a>
</p>

Instagram Reels / TikTok-style video player for Angular. Opens as a full-screen overlay with vertical swipe navigation. Handles video autoplay, sound continuity on iOS, and multi-media posts. ~24.4 kB gzip.

**[Live Demo](https://angular-demo.reelkit.dev/reel-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/angular-reel-player @reelkit/angular lucide-angular
```

Register the stylesheet once, any of three equivalent ways:

```typescript
// Anywhere that runs at startup — main.ts, app.config.ts, a component file.
import '@reelkit/angular-reel-player/styles.css';
// Or, from a global stylesheet:
//   @import '@reelkit/angular-reel-player/styles.css';
// Or in angular.json:
//   "styles": ["node_modules/@reelkit/angular-reel-player/styles.css"]
```

## Quick Start

```typescript
import { Component, signal } from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';

@Component({
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <button (click)="isOpen.set(true)">Open Player</button>
    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class AppComponent {
  isOpen = signal(false);
  content: ContentItem[] = [
    {
      id: '1',
      media: [
        {
          id: 'v1',
          type: 'video',
          src: 'https://example.com/video.mp4',
          poster: 'https://example.com/poster.jpg',
          aspectRatio: 9 / 16,
        },
      ],
      author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
      likes: 1234,
      description: 'Amazing video!',
    },
  ];
}
```

## Features

- Vertical swipe navigation (touch, mouse, keyboard, wheel)
- Video autoplay with sound toggle
- Multi-media posts with horizontal nested slider
- Instagram-style indicator dots
- Keyboard navigation (Arrow keys, Escape)
- Desktop navigation arrows
- iOS sound continuity via shared `<video>` element
- Video position memory across slide changes
- Playback timeline bar over long videos, scrubbable, with buffered ranges
- Shareable URLs — `<rk-reel-player-url-overlay>` opens itself from the address bar
- Sub-components — `RkCloseButtonComponent`, `RkSoundButtonComponent`, `RkImageSlideComponent`, `RkVideoSlideComponent`, `RkSlideOverlayComponent`, `RkTimelineBarComponent`

## Template Slots

Customization via `@ContentChild` template directives:

| Directive                  | Class                               | Context                         | Description                                    |
| -------------------------- | ----------------------------------- | ------------------------------- | ---------------------------------------------- |
| `rkPlayerSlideOverlay`     | `RkPlayerSlideOverlayDirective`     | `PlayerSlideOverlayContext<T>`  | Custom per-slide overlay (author, likes, etc.) |
| `rkPlayerSlide`            | `RkPlayerSlideDirective`            | `PlayerSlideContext<T>`         | Fully custom slide content                     |
| `rkPlayerControls`         | `RkPlayerControlsDirective`         | `PlayerControlsContext<T>`      | Custom player controls (close, sound)          |
| `rkPlayerNavigation`       | `RkPlayerNavigationDirective`       | `PlayerNavigationContext`       | Custom prev/next navigation arrows             |
| `rkPlayerNestedSlide`      | `RkPlayerNestedSlideDirective`      | `PlayerNestedSlideContext`      | Custom nested horizontal slide content         |
| `rkPlayerNestedNavigation` | `RkPlayerNestedNavigationDirective` | `PlayerNestedNavigationContext` | Custom arrows for the inner slider             |
| `rkPlayerTimeline`         | `RkPlayerTimelineDirective`         | `PlayerTimelineContext<T>`      | Custom playback timeline bar                   |
| `rkPlayerLoading`          | `RkPlayerLoadingDirective`          | `PlayerLoadingContext`          | Custom loading indicator                       |
| `rkPlayerError`            | `RkPlayerErrorDirective`            | `PlayerErrorContext`            | Custom error indicator                         |

`PLAYER_TEMPLATE_SLOT_DIRECTIVES` imports all of them at once.

### Template Contexts

| Context                         | Fields                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PlayerSlideContext<T>`         | `$implicit: T`, `index`, `size: [number, number]`, `isActive`, `slideKey`, `onReady()`, `onWaiting()`, `onError()`     |
| `PlayerSlideOverlayContext<T>`  | `$implicit: T`, `index`, `isActive`                                                                                    |
| `PlayerControlsContext<T>`      | `$implicit: () => void` (close), `onClose()`, `item: T`, `activeIndex`, `content: T[]`, `soundState: PlayerSoundState` |
| `PlayerTimelineContext<T>`      | `$implicit: T`, `activeIndex`, `timelineState: PlayerTimelineState`                                                    |
| `PlayerNavigationContext`       | `$implicit: () => void` (previous), `onPrev()`, `onNext()`, `item: BaseContentItem`, `activeIndex`, `count`            |
| `PlayerNestedSlideContext`      | `$implicit: MediaItem`, `index`, `size: [number, number]`, `isActive`, `isInnerActive`, `slideKey`                     |
| `PlayerNestedNavigationContext` | `$implicit: () => void` (previous), `onPrev()`, `onNext()`, `media: MediaItem`, `activeIndex`, `count`                 |
| `PlayerLoadingContext`          | `$implicit: number` (active index), `item: BaseContentItem`, `innerActiveIndex: number \| null`                        |
| `PlayerErrorContext`            | `$implicit: number` (active index), `item: BaseContentItem`, `innerActiveIndex: number \| null`                        |

`PlayerSoundState` is `{ muted(): boolean; disabled(): boolean; toggle(): void }`. `PlayerTimelineState` exposes `duration()`, `currentTime()`, `progress()`, `bufferedRanges(): readonly PlayerBufferedRange[]` (`{ start; end }` as 0-1 fractions), `isScrubbing()`, `seek(seconds)` and `bindInteractions(target): () => void` for a custom scrub track.

## API Reference

### rk-reel-player-overlay Inputs

| Input                        | Type                            | Default          | Description                                              |
| ---------------------------- | ------------------------------- | ---------------- | -------------------------------------------------------- |
| `isOpen`                     | `boolean`                       | required         | Controls overlay visibility                              |
| `content`                    | `T[]`                           | required         | Content items; `T extends BaseContentItem = ContentItem` |
| `initialIndex`               | `number`                        | `0`              | Starting slide index                                     |
| `initialInnerIndex`          | `number`                        | -                | Inner media index for the first slide only               |
| `aspectRatio`                | `number`                        | `9/16`           | Desktop container ratio                                  |
| `ariaLabel`                  | `string`                        | `'Video player'` | Accessible label announced when the overlay opens        |
| `timeline`                   | `'auto' \| 'always' \| 'never'` | `'auto'`         | When the built-in timeline bar renders                   |
| `timelineMinDurationSeconds` | `number`                        | `30`             | Under `'auto'`, videos shorter than this get no bar      |
| `loop`                       | `boolean`                       | `false`          | Enable infinite loop                                     |
| `enableNavKeys`              | `boolean`                       | `true`           | Enable keyboard navigation                               |
| `enableWheel`                | `boolean`                       | `true`           | Enable mouse wheel navigation                            |
| `wheelDebounceMs`            | `number`                        | `200`            | Wheel debounce duration (ms)                             |
| `transitionDuration`         | `number`                        | `300`            | Transition duration (ms)                                 |
| `swipeDistanceFactor`        | `number`                        | `0.12`           | Swipe threshold (0-1)                                    |

Each slot also has a template input — `slideTemplate`, `slideOverlayTemplate`, `controlsTemplate`, `timelineTemplate`, `navigationTemplate`, `nestedSlideTemplate`, `nestedNavTemplate`, `loadingTemplate`, `errorTemplate` — taking a `TemplateRef` with the slot's context. An input wins over the projected directive; projecting the directive is the usual way.

### rk-reel-player-overlay Outputs

| Output             | Type                               | Description                                                                    |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| `closed`           | `void`                             | Emitted when player closes                                                     |
| `slideChange`      | `number`                           | Emitted after slide change                                                     |
| `innerSlideChange` | `{ outer: number; inner: number }` | Active post's inner media index changed, on inner navigation and on activation |
| `apiReady`         | `ReelApi`                          | Emits the outer slider's imperative API                                        |

### Sub-components

| Component                 | Selector           | Inputs and outputs                                                                                                                                                                           |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RkCloseButtonComponent`  | `rk-close-button`  | output `clicked`                                                                                                                                                                             |
| `RkSoundButtonComponent`  | `rk-sound-button`  | `isDisabled` (`false`); reads and toggles the injected `SoundStateService`                                                                                                                   |
| `RkImageSlideComponent`   | `rk-image-slide`   | `src` (required), `poster`, `alt` (`''`), `isActive`, `width`, `height`, `onReady`, `onWaiting`, `onError`                                                                                   |
| `RkVideoSlideComponent`   | `rk-video-slide`   | `src`, `aspectRatio`, `slideKey` (all required), `poster`, `ariaLabel` (`''`), `width`, `height`, `isActive`, `isInnerActive` (`true`), `onReady`, `onWaiting`, `onError`; output `videoRef` |
| `RkSlideOverlayComponent` | `rk-slide-overlay` | `author: { name; avatar }`, `description`, `likes`                                                                                                                                           |
| `RkTimelineBarComponent`  | `rk-timeline-bar`  | no inputs; renders the injected `TimelineStateService`                                                                                                                                       |

### Services

Both are provided per `rk-reel-player-overlay`, so each player instance has its own state; inject them from inside a slot or a sub-component.

| Service                | Members                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SoundStateService`    | Re-exported from `@reelkit/angular`: `muted`, `disabled` (Angular signals), `toggle()`, `setDisabled()`, `reset()`                     |
| `TimelineStateService` | `duration`, `currentTime`, `progress`, `bufferedRanges`, `isScrubbing` (Angular signals), `attach(video)`, `detach()`, `seek(seconds)` |

### Types

```typescript
interface BaseContentItem {
  id: string;
  media: MediaItem[];
}

interface ContentItem extends BaseContentItem {
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio: number;
}
```

## URL-driven player

`<rk-reel-player-url-overlay>` lets the address bar own the open state, so a
shared link reopens the same post. Against `<rk-reel-player-overlay>` it adds a
required `controller` and drops the inputs the URL now decides — `isOpen`,
`initialIndex`, `initialInnerIndex` — along with the nine `*Template` inputs
(project the slot directives instead; the wrapper forwards them). It emits only
`closed` and `slideChange`.

| Input        | Type                                                                | Default  | Description                                                                                                           |
| ------------ | ------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController<number> \| UrlStateController<TwoAxisPosition>` | required | From `createOverlayUrlState`; its position opens the player and picks the slide (and inner media, for a two-axis key) |

`content`, `ariaLabel`, `aspectRatio`, `transitionDuration`,
`swipeDistanceFactor`, `loop`, `enableNavKeys`, `enableWheel`,
`wheelDebounceMs`, `timeline` and `timelineMinDurationSeconds` work as on
`<rk-reel-player-overlay>`:

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import { createOverlayUrlState, urlIndexKey } from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import '@reelkit/angular-reel-player/styles.css';

@Component({
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

  // Attaches now, releases on destroy.
  protected readonly reel = createOverlayUrlState({
    param: 'reel',
    adapter: createRouterUrlAdapter(),
    ...urlIndexKey(() => this.content.length),
  });
}
```

Swap `urlIndexKey` for `urlIndexTwoAxisKey` to put the inner media index in the
URL too (`?reel=3.2`), or `urlStableIdKey` to key it by post id so a bookmark
survives the feed being reordered. Drop the adapter outside the Angular router —
the History API is the default.

## Keyboard Shortcuts

| Key          | Action                  |
| ------------ | ----------------------- |
| `ArrowUp`    | Previous slide          |
| `ArrowDown`  | Next slide              |
| `ArrowLeft`  | Previous media (nested) |
| `ArrowRight` | Next media (nested)     |
| `Escape`     | Close player            |

## CSS Classes

| Class                                | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| `.rk-reel-overlay`                   | Overlay background                             |
| `.rk-reel-container`                 | Player container                               |
| `.rk-reel-slide-wrapper`             | Slide wrapper                                  |
| `.rk-reel-button`                    | Shared circular icon button                    |
| `.rk-reel-nav-arrows`                | Desktop nav arrows container                   |
| `.rk-reel-nav-btn`                   | Individual nav arrow button                    |
| `.rk-reel-close-btn`                 | Close button                                   |
| `.rk-reel-sound-btn`                 | Sound toggle                                   |
| `.rk-reel-slide-overlay`             | Per-slide overlay (author, likes)              |
| `.rk-reel-slide-overlay-author`      | Author row                                     |
| `.rk-reel-slide-overlay-avatar`      | Author avatar                                  |
| `.rk-reel-slide-overlay-name`        | Author name                                    |
| `.rk-reel-slide-overlay-description` | Slide description                              |
| `.rk-reel-slide-overlay-likes`       | Like count                                     |
| `.rk-reel-nested-slider-inner`       | Nested horizontal slider                       |
| `.rk-reel-nested-active`             | Nested slider of the active post               |
| `.rk-reel-nested-nav`                | Nested nav arrows                              |
| `.rk-reel-nested-nav-prev`           | Nested prev arrow                              |
| `.rk-reel-nested-nav-next`           | Nested next arrow                              |
| `.rk-reel-nested-indicator`          | Nested slider dot indicator                    |
| `.rk-reel-video-container`           | Video slide wrapper                            |
| `.rk-reel-video-element`             | Video element                                  |
| `.rk-reel-video-poster`              | Video poster image                             |
| `.rk-reel-video-loader`              | Video loading indicator                        |
| `.rk-reel-media-error`               | Error state overlay                            |
| `.rk-reel-media-error-text`          | Error message text                             |
| `.rk-reel-loader`                    | Wave loading overlay                           |
| `.rk-reel-timeline`                  | Timeline bar container                         |
| `.rk-reel-timeline-track`            | Scrub track (`[data-scrubbing]` while dragged) |
| `.rk-reel-timeline-buffered`         | Buffered range segment                         |
| `.rk-reel-timeline-fill`             | Played progress fill                           |
| `.rk-reel-timeline-cursor`           | Scrub handle                                   |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-reel-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-reel-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/angular-reel-player?framework=angular#theming) for the full token table.

## Documentation

Docs, runnable StackBlitz examples, and customization guides at **[reelkit.dev/docs/angular-reel-player](https://reelkit.dev/docs/angular-reel-player?framework=angular)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

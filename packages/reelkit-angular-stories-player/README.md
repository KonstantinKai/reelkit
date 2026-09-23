# @reelkit/angular-stories-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/angular-stories-player"><img src="https://img.shields.io/npm/v/@reelkit/angular-stories-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-31.2%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-77%25-yellow" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Instagram-style stories for Angular. Tap to move through a group, swipe or cube
between groups, and an auto-advance timer drives the progress bar. Every region
is replaceable through a template slot. ~31.2 kB gzip.

**[Live Demo](https://angular-demo.reelkit.dev/stories-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/angular-stories-player @reelkit/angular lucide-angular
```

Register the stylesheet once, any of three equivalent ways:

```typescript
// Anywhere that runs at startup — main.ts, app.config.ts, a component file.
import '@reelkit/angular-stories-player/styles.css';
// Or, from a global stylesheet:
//   @import '@reelkit/angular-stories-player/styles.css';
// Or in angular.json:
//   "styles": ["node_modules/@reelkit/angular-stories-player/styles.css"]
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
      author: {
        id: 'ada',
        name: 'Ada',
        avatar: 'https://example.com/ada.jpg',
      },
      stories: [
        { id: '1', src: 'https://example.com/1.jpg', mediaType: 'image' },
        { id: '2', src: 'https://example.com/2.mp4', mediaType: 'video' },
      ],
    },
  ];
}
```

## Features

- Nested navigation — tap to move through a group, swipe to switch author
- Auto-advance — per-story duration, with a segmented canvas progress bar
- 3D transitions between authors — tree-shakable `cubeTransition`, `flipTransition`, `fadeTransition`, `zoomTransition`, `slideTransition` (import only what you use)
- Image and video stories, with the next story preloaded in the background
- Double-tap to react, with a heart animation over the story
- Hold to pause, release to resume
- Desktop carousel — `desktopLayout="carousel"` lays neighbouring authors out as preview cards
- Story rings — `<rk-stories-ring-list>` as the Instagram-style entry point
- Viewed state — resume each author on their first unseen story, and dim rings once watched to the end
- Shareable URLs — `<rk-stories-url-overlay>` opens itself from the address bar
- Template slots — eight `ng-template` directives to replace any region
- Generic over your story type — extend `StoryItem` with your own fields
- Themed through `--rk-stories-*` custom properties, shared with the React and Vue players

## Template Slots

Each directive receives a typed context, with the most useful value as the
implicit one. A slot left out keeps the built-in rendering, and
`STORIES_TEMPLATE_SLOT_DIRECTIVES` exports all eight as one array.

| Directive               | Context                                                                                                                                                                                      | Description                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `rkStoriesSlide`        | `StoriesSlideContext`: `$implicit` story, `index`, `groupIndex`, `isActive`, `size`, `activeGroupIndex`, `activeStoryIndex`, `onDurationReady`, `onReady`, `onWaiting`, `onError`, `onEnded` | Custom slide renderer, replacing image and video  |
| `rkStoriesHeader`       | `StoriesHeaderContext`: `$implicit` author, `story`, `storyIndex`, `isPaused`, `isMuted`, `isVideo`, `groupIndex`, `isActive`, `onToggleSound`, `onTogglePause`, `onClose`                   | Author row, pause, sound and close controls       |
| `rkStoriesFooter`       | `StoriesFooterContext`: `$implicit` story, `author`, `storyIndex`                                                                                                                            | Added below the story; there is no default footer |
| `rkStoriesProgressBar`  | `StoriesProgressBarContext`: `$implicit` group, `totalStories`, `activeIndex`, `progress`, `groupIndex`, `isActive`                                                                          | Replaces the canvas progress bar                  |
| `rkStoriesNavigation`   | `StoriesNavigationContext`: `$implicit` `{ onPrevStory, onNextStory, onPrevGroup, onNextGroup }`                                                                                             | Replaces both desktop arrows                      |
| `rkStoriesGroupPreview` | `StoriesGroupPreviewContext`: `$implicit` group, `groupIndex`, `story`, `offset`, `viewedCount`, `onOpen`                                                                                    | Fills a desktop carousel card                     |
| `rkStoriesLoading`      | `StoriesLoadingContext`: `$implicit` story, `storyIndex`, `groupIndex`                                                                                                                       | Replaces the spinner shown while a story loads    |
| `rkStoriesError`        | `StoriesErrorContext`: `$implicit` story, `storyIndex`, `groupIndex`                                                                                                                         | Replaces the "Content unavailable" panel          |

Slots render through the player's own injector, so a component drawn inside one
resolves the player's providers — an `rk-video-story-slide` in a slide template
finds the same sound state the header button writes.

## API Reference

### rk-stories-overlay Inputs

| Input                     | Type                             | Default            | Description                                                                                   |
| ------------------------- | -------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `isOpen`                  | `boolean`                        | required           | Renders the player and locks body scroll                                                      |
| `groups`                  | `StoriesGroup<T>[]`              | required           | Story groups; ones added while open are picked up                                             |
| `initialGroupIndex`       | `number`                         | `0`                | Group the player opens on                                                                     |
| `initialStoryIndex`       | `number \| undefined`            | resume, then `0`   | Story the player opens on; beats anything remembered                                          |
| `ariaLabel`               | `string`                         | `'Stories player'` | Accessible name of the dialog                                                                 |
| `groupTransition`         | `TransitionTransformFn`          | `cubeTransition`   | Transition between authors; ignored while the carousel shows                                  |
| `innerTransitionDuration` | `number`                         | `200`              | Crossfade between stories of one author (ms)                                                  |
| `defaultImageDuration`    | `number`                         | `5000`             | Auto-advance duration for an image story (ms)                                                 |
| `minSegmentWidth`         | `number`                         | `8`                | Below this the progress bar scrolls a window of segments (px)                                 |
| `tapZoneSplit`            | `number`                         | `0.3`              | Tap split (0–1); the left share goes back, the rest forward                                   |
| `hideUIOnPause`           | `boolean`                        | `true`             | Hide progress bar and header while held paused                                                |
| `enableKeyboard`          | `boolean`                        | `true`             | Arrow keys and Escape                                                                         |
| `desktopLayout`           | `'single' \| 'carousel'`         | `'single'`         | Phones always show the story alone                                                            |
| `chromePlacement`         | `'overlay' \| 'group'`           | `'overlay'`        | `'group'`: each group carries its own progress bar and header, turning with it like Instagram |
| `viewed`                  | `StoriesViewedStateController`   | —                  | Resume and record; hand the same one to the ring list                                         |
| `resumeStoryIndex`        | `(groupIndex: number) => number` | —                  | Where a group first opens; beats `viewed`                                                     |

Every slot also has an input — `slideTemplate`, `headerTemplate`,
`footerTemplate`, `progressBarTemplate`, `navigationTemplate`,
`loadingTemplate`, `errorTemplate`, `groupPreviewTemplate` — for a component
that holds the `TemplateRef` itself. A named template beats a projected one.

### rk-stories-overlay Outputs

| Output           | Payload                      | Description                                          |
| ---------------- | ---------------------------- | ---------------------------------------------------- |
| `closed`         | `void`                       | ✕, swipe down, Escape, or the last story finishing   |
| `apiReady`       | `StoriesApi`                 | On every open; the player is rebuilt each time       |
| `storyChanged`   | `{ groupIndex, storyIndex }` | After the active story changes                       |
| `storyViewed`    | `{ groupIndex, storyIndex }` | When a story comes on screen, the first one included |
| `storyCompleted` | `{ groupIndex, storyIndex }` | When a story's timer runs out                        |
| `doubleTapped`   | `{ groupIndex, storyIndex }` | On a double tap, alongside the heart animation       |
| `groupChanged`   | `number`                     | After the active group changes                       |
| `paused`         | `void`                       | On a long press, or the header's pause button        |
| `resumed`        | `void`                       | On release, or the header's play button              |

### rk-stories-url-overlay Inputs

Takes every `rk-stories-overlay` input and output except the open-state trio —
`isOpen`, `initialGroupIndex`, `initialStoryIndex` — which come from the
controller. Its slots are projected `ng-template`s, as on the overlay.

| Input        | Type                                  | Default  | Description                                                                                                                                                                            |
| ------------ | ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController<TwoAxisPosition>` | required | From `createOverlayUrlState` spread with `urlIndexTwoAxisKey`; its position decides whether the player is open and where, and the overlay writes back on every navigation and on close |
| `groups`     | `StoriesGroup<T>[]`                   | required | Story groups to play, in order                                                                                                                                                         |

`(closed)` fires after the player closes; the parameter is already cleared by
then, so the URL, not this output, drives closing.

### rk-stories-ring-list Inputs

| Input      | Type                           | Default  | Description                                                                                                                          |
| ---------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `groups`   | `StoriesGroup[]`               | required | One ring per group, in order                                                                                                         |
| `viewed`   | `StoriesViewedStateController` | —        | Mutes the ring of a group watched to the end; the list reads the store while it is on screen. Hand the same controller to the player |
| `ringSize` | `number`                       | `64`     | Diameter of each ring in pixels                                                                                                      |

`(selected)` emits the group index of the ring chosen.

### StoriesApi

From `(apiReady)`. The player is rebuilt on every open, so keep the newest
handle: `nextStory()`, `prevStory()`, `nextGroup()`, `prevGroup()`,
`goToGroup(index)`, `pause()`, `resume()`.

### Types

```typescript
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
  aspectRatio?: number;
  createdAt?: string | Date;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
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

## Keyboard Shortcuts

| Key          | Action         |
| ------------ | -------------- |
| `ArrowLeft`  | Previous story |
| `ArrowRight` | Next story     |
| `Escape`     | Close player   |

## CSS Classes

All UI elements use CSS classes prefixed with `rk-stories-`, identical to the
React and Vue players, so a stylesheet written for one works for the others.

| Class                       | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `.rk-stories-overlay`       | Full-screen root container                       |
| `.rk-stories-swipe-wrapper` | Swipe-to-close wrapper holding arrows and canvas |
| `.rk-stories-container`     | Rounded story canvas                             |
| `.rk-stories-ui-layer`      | Interface layer above the player                 |
| `.rk-stories-nav-btn`       | Desktop previous/next arrow                      |
| `.rk-stories-header`        | Header row                                       |
| `.rk-stories-ring`          | Circular avatar with its gradient ring           |
| `.rk-stories-ring-list`     | Horizontal row of rings                          |
| `.rk-stories-carousel`      | Desktop carousel layer                           |
| `.rk-stories-card`          | One preview card beside the player               |
| `.rk-stories-heart`         | Double-tap heart                                 |
| `.rk-stories-image`         | Image story element                              |
| `.rk-stories-video`         | Video story container                            |

Colors, sizes and durations are `--rk-stories-*` custom properties on `:root` —
prefer those over overriding a class.

## Documentation

Full reference, live demos and the template slot catalogue:
[reelkit.dev/docs/angular-stories-player](https://reelkit.dev/docs/angular-stories-player?framework=angular)

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

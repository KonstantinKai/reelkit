---
title: Angular Stories Player
url: https://reelkit.dev/docs/angular-stories-player
section: Angular
order: 5
desc: Instagram-style stories player overlay for Angular. Groups schema, inputs, outputs, template slots, viewed state, desktop carousel, URL state, theming tokens and CSS classes shared with the React and Vue stories players.
---

# Angular Stories Player

Instagram-style stories player overlay for Angular. Built on `@reelkit/stories-core`, same engine as React + Vue players. CSS classes + theming tokens identical across all three (classes `.rk-stories-*`, tokens `--rk-stories-*`) — theme ports between bindings.

Live demo: https://angular-demo.reelkit.dev/stories-player

## Features

Tap to advance stories, swipe to switch groups; video stories with sound toggle; per-story auto-advance timer; 3D transitions between users (cube, flip, fade, zoom, slide); canvas segmented progress bar; image + video; eight `ng-template` slots; double-tap heart; desktop chevrons; Instagram-style rings; generic over the story type; `--rk-stories-*` theming tokens; shareable `?story=group.story` links; seen rings and resume that survive reloads.

## Installation

```bash
npm install @reelkit/angular-stories-player @reelkit/angular lucide-angular
```

Peers: `@reelkit/angular`, `@angular/core` + `@angular/common` (>= 19), `lucide-angular` (default header + arrow icons). `@reelkit/stories-core` comes in as a dependency. Replace the icons through the `rkStoriesHeader` and `rkStoriesNavigation` slots.

Stylesheet once, any of three ways — all equivalent:

```ts
// 1. anywhere that runs at startup: main.ts, app.config.ts, a component file
import '@reelkit/angular-stories-player/styles.css';
```

```css
/* 2. from a global stylesheet */
@import '@reelkit/angular-stories-player/styles.css';
```

```json
// 3. angular.json
"styles": ["node_modules/@reelkit/angular-stories-player/styles.css"]
```

## Quick Start

`rk-stories-ring-list` emits `(selected)` with a group index → host keeps it as `initialGroupIndex`, sets `isOpen`. The player never closes itself: it emits `(closed)`, host sets `isOpen` back to `false`.

Placement: unlike React/Vue (portal to `document.body`), `rk-stories-overlay` renders where placed, `position: fixed`. Keep it out of ancestors with `transform` / `perspective` / `filter` / `will-change: transform` — that ancestor becomes the containing block: player sized to it, clipped by its `overflow`. An ancestor stacking context caps `--rk-stories-overlay-z`. Upside: `--rk-stories-*` tokens on any ancestor reach the player.

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesRingListComponent,
  type StoriesGroup,
} from '@reelkit/angular-stories-player';

@Component({
  selector: 'app-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkStoriesOverlayComponent, RkStoriesRingListComponent],
  template: `
    <rk-stories-ring-list [groups]="groups" (selected)="open($event)" />
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      [initialGroupIndex]="groupIndex()"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class FeedComponent {
  protected readonly groups: StoriesGroup[] = [
    {
      author: {
        id: 'alice',
        name: 'Alice',
        avatar: '/alice.jpg',
        verified: true,
      },
      stories: [
        { id: 's1', mediaType: 'image', src: '/story-1.jpg' },
        {
          id: 's2',
          mediaType: 'video',
          src: '/story-2.mp4',
          poster: '/poster-2.jpg',
        },
      ],
    },
  ];

  protected readonly isOpen = signal(false);
  protected readonly groupIndex = signal(0);

  protected open(index: number): void {
    this.groupIndex.set(index);
    this.isOpen.set(true);
  }
}
```

## URL State

Live demo: https://angular-demo.reelkit.dev/stories-player-url

`RkStoriesUrlOverlayComponent` (`rk-stories-url-overlay`): open group + story live in one `?story=<group>.<story>` parameter. Build the controller with `createOverlayUrlState` + a two-axis key (`urlIndexTwoAxisKey` by position, or `urlStableIdTwoAxisKey` for a group by stable id), pass it as `controller`.

```ts
this.stories = runInInjectionContext(this.injector, () =>
  createOverlayUrlState({
    param: 'story',
    adapter: createRouterUrlAdapter(),
    ...urlIndexTwoAxisKey({
      outerCount: () => this.groups.length,
      innerCounts: () => this.groups.map((group) => group.stories.length),
    }),
  }),
) as UrlStateController<TwoAxisPosition>;
```

- Opening pushes ONE history entry; every story + group change REPLACES it. One back step always closes.
- Inner navigation carried: `?story=2.3` opens exact story.
- Back closes only when opened from within app. Shared link opened in fresh tab has no history behind it — browser-back leaves site; ✕ or Escape removes param in place.
- Param naming no group/story dropped from URL, never opens neighbour.
- Routed app: pass router adapter (`createRouterUrlAdapter` from `@reelkit/angular/ng-router-url-adapter`), else router location goes stale and next navigation drops param.
- Stable ids: `urlStableIdTwoAxisKey`, or `outerCodec` + `outerLocator` on `urlIndexTwoAxisKey`. Add `innerCodec` + `innerLocate` + `innerIdentify` to address the story by id too; omit them and the story half stays a local index. `base64UrlCodec` obscures id on wire (reversible, not a hash).
- Infinite feeds: `locateAsync` on `outerLocator`, called only when sync `locate` misses. Pending → player stays closed, param left alone; `null`/rejection drops param. Same pager single-axis keys take — on two-axis key it rides `outerLocator`, group axis pages while story stays local index in resolved group.
- Answer arriving after URL moved on, after close, or after unmount is discarded.

## Remembering What Was Seen

One `createStoriesViewedStateController`, created where the feed lives, handed to `rk-stories-ring-list` and the overlay as `viewed`: rings keep the gradient until a group is watched to the end, a group reopens on its first unseen story, every story shown is recorded. Entries name author + story by id (survive reorder); same controller works in React and Vue.

```ts
protected readonly viewed = createStoriesViewedStateController({
  storageKey: 'my-app-stories-seen',
  groups: () => this.groups(),
});
```

- Opening story counts: reported viewed as the player opens.
- `resumeStoryIndex` consulted for every group reached for the first time this session, opening one included, unless `initialStoryIndex` names a story; a group already swiped through reopens where left. Explicit `resumeStoryIndex` input beats the controller.
- `rk-stories-url-overlay`: the parameter decides where the player opens.
- Entry = furthest story reached, not a tally.
- Storage pluggable (`createSessionStorageAdapter()`, own `StorageAdapter`); tabs stay in step through the storage event.
- Overlay + ring list read the store as soon as they exist, while still closed. Overlay wrapped in `@if (open)` reads too late: call `attachViewedState(() => this.viewed)` in the host constructor.

## Desktop Carousel

`desktopLayout="carousel"`: active story centred at usual size, up to two neighbouring groups per side as smaller dimmed cards. Card click opens that group while the cards slide across. Same `viewed` controller → watched group's card gets the muted ring.

- Up to 768px wide: no cards, swipes use `groupTransition`; resizing across switches live. With cards showing, groups slide whatever `groupTransition` says.
- Card previews the story the group opens on (left there this session, else `resumeStoryIndex`): video poster or image; a non-video story with neither is drawn by the `rkStoriesSlide` template at player size, scaled down; a video without poster shows `--rk-stories-card-bg`. Preview gets `isActive: false` and no-op lifecycle callbacks; keep mount-time side effects behind `isActive`.
- Timer does not start, and `(storyViewed)` does not fire, until the slide ends.
- Card click, `goToGroup` / `nextGroup` / `prevGroup`, arrow keys past a group's end all slide; a touch swipe moves the player itself, no slide.
- `rkStoriesGroupPreview` slot restyles a card; player still positions, scales, slides it.

## Progress Bar and Header per Group

`chromePlacement="group"` — every group gets its own progress bar + header inside its slide, both turn with the group (Instagram). Default `'overlay'`: one copy above the player, switching after the group changes.

- Neighbouring group shows the story it will open on, nothing played.
- Group being left keeps its progress until the turn ends; one played to the end stays full.
- `rkStoriesProgressBar` / `rkStoriesHeader` templates rendered for every group on screen, contexts carry `groupIndex` + `isActive`; neighbour → `isActive: false`, progress signals hold still.
- `rkStoriesHeader` template sits in the swipe area: a tap moves between stories unless it hits a `button`, a link, or `role="button"`.
- Desktop carousel: player hidden while cards slide, so the choice shows once the group is open.

## Template Slots

Eight `ng-template` directives, each with the most useful value as the implicit one. A slot left out keeps the built-in rendering. `STORIES_TEMPLATE_SLOT_DIRECTIVES` exports all eight as one array.

- `rkStoriesHeader` (`RkStoriesHeaderDirective`, `StoriesHeaderContext`) — `{ $implicit: author, story, storyIndex, isPaused, isMuted, isVideo, groupIndex, isActive, onToggleSound, onTogglePause, onClose }`
- `rkStoriesFooter` (`RkStoriesFooterDirective`, `StoriesFooterContext`) — `{ $implicit: story, author, storyIndex }`
- `rkStoriesSlide` (`RkStoriesSlideDirective`, `StoriesSlideContext`) — `{ $implicit: story, index, groupIndex, isActive, size, activeGroupIndex, activeStoryIndex, onDurationReady, onReady, onWaiting, onError, onEnded }`
- `rkStoriesProgressBar` (`RkStoriesProgressBarDirective`, `StoriesProgressBarContext`) — `{ $implicit: group, totalStories, activeIndex, progress, groupIndex, isActive }`; `activeIndex` + `progress` are core signals, bridge with `toAngularSignal`
- `rkStoriesNavigation` (`RkStoriesNavigationDirective`, `StoriesNavigationContext`) — `{ $implicit: StoriesNavigationActions }` = `{ onPrevStory, onNextStory, onPrevGroup, onNextGroup }`
- `rkStoriesGroupPreview` (`RkStoriesGroupPreviewDirective`, `StoriesGroupPreviewContext`) — `{ $implicit: group, groupIndex, story, offset, viewedCount, onOpen }`
- `rkStoriesLoading` (`RkStoriesLoadingDirective`, `StoriesLoadingContext`) — `{ $implicit: story, storyIndex, groupIndex }`
- `rkStoriesError` (`RkStoriesErrorDirective`, `StoriesErrorContext`) — `{ $implicit: story, storyIndex, groupIndex }`

```ts
<rk-stories-overlay [isOpen]="isOpen()" [groups]="groups" (closed)="isOpen.set(false)">
  <ng-template rkStoriesHeader let-author let-onClose="onClose">
    <header><strong>{{ author.name }}</strong>
      <button type="button" (click)="onClose()">Close</button>
    </header>
  </ng-template>
</rk-stories-overlay>
```

Slots render through the player's own injector, so a component drawn in one resolves the player's providers — an `rk-video-story-slide` in a slide template finds the same sound state the header button writes.

Slide lifecycle — a custom slide reports through its context; acted on only for the story on screen:

| Callback          | When                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| `onReady`         | Image loaded / video playing. Timer starts (or waits for a carousel slide to end). |
| `onWaiting`       | Stall (video buffering). Spinner shows, timer pauses.                              |
| `onError`         | Failed to load. Error panel, timer pauses.                                         |
| `onDurationReady` | Real media length (ms), so the timer matches. A `duration` set on the story wins.  |
| `onEnded`         | Media finished on its own. Moves to the next story without waiting for the timer.  |

`rk-image-story-slide` emits `(loaded)`, `(failed)`; `rk-video-story-slide` emits `(playbackStarted)`, `(buffering)`, `(failed)`, `(durationReady)`, `(finished)` — pass each on to the matching callback.

Preloader: built-in slides preload the next story; a preloaded story appears with no spinner; a URL that failed once shows the error straight away on reopen.

## Transitions

`groupTransition` — between users only; stories of one user always cross-fade (`innerTransitionDuration`, default 200ms). Import `cubeTransition`, `flipTransition`, `fadeTransition`, `zoomTransition`, `slideTransition` from `@reelkit/angular`.

```ts
<rk-stories-overlay
  [isOpen]="isOpen()"
  [groups]="groups"
  [groupTransition]="flip"
  (closed)="isOpen.set(false)"
/>
```

## Double-Tap & Likes

Heart plays on double tap; `(doubleTapped)` fires `{ groupIndex, storyIndex }` — persist the like yourself, the player keeps no like state. Speed: `--rk-stories-heart-duration`; colour/size/hide: `.rk-stories-heart`. `RkHeartAnimationComponent` exported for standalone use. No heart slot yet.

## StoriesApi

From `(apiReady)`. The player is rebuilt on every open, so keep the newest handle.

`nextStory()`, `prevStory()`, `nextGroup()`, `prevGroup()`, `goToGroup(index)`, `pause()`, `resume()`.

## Sub-Components

`RkStoriesRingComponent`, `RkStoriesRingListComponent`, `RkStoryHeaderComponent`, `RkCanvasProgressBarComponent` (`[live]="false"` draws only on signal change or resize), `RkImageStorySlideComponent`, `RkVideoStorySlideComponent`, `RkHeartAnimationComponent`. `RkStoriesCarouselComponent` and its `CarouselSlide` type are exported as well, but the overlay owns every value it draws from — use the `rkStoriesGroupPreview` slot to restyle a card rather than mounting it yourself. Every video story plays through one shared `<video>`, which is what keeps sound alive on iOS between stories.

## Custom Story Types

Extend `StoryItem`, type the groups as `StoriesGroup<PromoStory>[]`; slide templates receive your type (projected templates cannot infer it — cast where you know it).

## Re-exports

From `@reelkit/angular`: `createOverlayUrlState`, `urlIndexTwoAxisKey`, `urlStableIdTwoAxisKey`, `base64UrlCodec`, `createViewedStateController`, `twoAxisViewedTracking`, `createLocalStorageAdapter`, `createSessionStorageAdapter`, `createMemoryStorageAdapter`, plus the URL and viewed-state types.

From `@reelkit/stories-core`: `createStoriesViewedStateController`, `StoriesViewedStateController`, `StoriesViewedStateControllerConfig`, `StoryItem`, `AuthorInfo`, `StoriesGroup`, `MediaType`.

`attachViewedState` attaches a viewed-state controller for as long as the calling component lives.

## RkStoriesOverlayComponent Inputs

- `isOpen` (boolean, default `false`) — renders the player, locks body scroll
- `groups` (`StoriesGroup<T>[]`, required) — groups added while open are picked up without losing the viewer's place
- `initialGroupIndex` (number, default `0`)
- `initialStoryIndex` (number, default resume then `0`) — naming one beats anything remembered
- `ariaLabel` (string, default `'Stories player'`)
- `groupTransition` (`TransitionTransformFn`, default `cubeTransition`) — between users only; ignored while the carousel shows
- `innerTransitionDuration` (number, default `200`) — crossfade between stories of one user
- `defaultImageDuration` (number, default `5000`)
- `minSegmentWidth` (number, default `8`) — below this the progress bar scrolls a window of segments
- `tapZoneSplit` (number, default `0.3`) — left portion goes back, rest forward
- `hideUIOnPause` (boolean, default `true`)
- `enableKeyboard` (boolean, default `true`)
- `desktopLayout` (`DesktopLayout` = `'single' | 'carousel'`, default `'single'`) — phones always show the story alone
- `chromePlacement` (`ChromePlacement` = `'overlay' | 'group'`, default `'overlay'`) — `'group'`: bar + header per group slide, turning with it
- `viewed` (`StoriesViewedStateController`) — resume + record; hand the same one to the ring list
- `resumeStoryIndex` (`(groupIndex: number) => number`) — consulted for a group not yet visited this open; beats `viewed`
- Slot inputs, for a component holding the `TemplateRef` itself: `slideTemplate`, `headerTemplate`, `footerTemplate`, `progressBarTemplate`, `navigationTemplate`, `loadingTemplate`, `errorTemplate`, `groupPreviewTemplate`. A named template beats a projected one.

## RkStoriesOverlayComponent Outputs

- `(closed)` — void. Player reports, host decides; covers ✕, swipe down, Escape, last story finishing
- `(apiReady)` — `StoriesApi`, on every open
- `(storyChanged)`, `(storyViewed)`, `(storyCompleted)`, `(doubleTapped)` — `{ groupIndex, storyIndex }`
- `(groupChanged)` — number
- `(paused)`, `(resumed)` — void

## RkStoriesUrlOverlayComponent Inputs

Every overlay input except `isOpen`, `initialGroupIndex`, `initialStoryIndex` — supplied by the controller.

- `controller` (`UrlStateController<TwoAxisPosition>`, required) — its position (`{ outer, inner }`) decides open + where; the overlay writes back on every navigation and on close.

## StoryItem, AuthorInfo and StoriesGroup Interfaces

```ts
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

## Template Slot Context Types

Exported for annotating slots: `StoriesSlideContext`, `StoriesHeaderContext`, `StoriesFooterContext`, `StoriesProgressBarContext`, `StoriesNavigationContext`, `StoriesLoadingContext`, `StoriesErrorContext`, `StoriesGroupPreviewContext`, plus `StoriesNavigationActions`, `DesktopLayout`, `ChromePlacement`, `StoriesApi`.

## CSS Classes

Plain classes, identical to the React and Vue players. Override after `@reelkit/angular-stories-player/styles.css`; prefer tokens for colours/sizes.

- Overlay: `.rk-stories-overlay` (`--carousel`, `--sliding`), `.rk-stories-swipe-wrapper`, `.rk-stories-container`, `.rk-stories-ui-layer` (`--hidden`), `.rk-stories-error`, `.rk-stories-error-text`, `.rk-stories-nav-btn`, `.rk-stories-progress-bar`, `.rk-stories-slide-wrapper`, `.rk-stories-story`
- Slides: `.rk-stories-image`, `.rk-stories-video`, `.rk-stories-video-element`, `.rk-stories-video-poster` (`--visible`)
- Header: `.rk-stories-header` (`--hidden`), `.rk-stories-header-avatar`, `.rk-stories-header-name`, `.rk-stories-header-verified`, `.rk-stories-header-time`, `.rk-stories-header-actions`, `.rk-stories-header-btn` (`--desktop`: pause, shown wider than 768px), `.rk-stories-header-spinner`
- Heart: `.rk-stories-heart`
- Rings: `.rk-stories-ring` (`--active`), `.rk-stories-ring-avatar`, `.rk-stories-ring-list`, `.rk-stories-ring-list-item`, `.rk-stories-ring-list-name`
- Carousel: `.rk-stories-carousel` (`--instant`), `.rk-stories-card` (`--center`, `--hidden`), `.rk-stories-card-button`, `.rk-stories-card-image`, `.rk-stories-card-frame`, `.rk-stories-card-scrim`, `.rk-stories-card-info`, `.rk-stories-card-name`, `.rk-stories-card-time`

## Theming

All 61 tokens on `:root`, shared with React + Vue. Defaults:

- Overlay: `--rk-stories-overlay-bg` `#000`, `--rk-stories-overlay-z` `9999`, `--rk-stories-swipe-gap` `16px`, `--rk-stories-container-radius` `12px`, `--rk-stories-container-radius-mobile` `0`
- Chrome: `--rk-stories-ui-z` `15`, `--rk-stories-ui-transition` `200ms`, `--rk-stories-top-shade-height` `120px`, `--rk-stories-top-shade-bg` `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)`, `--rk-stories-progress-bar-z` `10`, `--rk-stories-progress-bar-padding` `8px 8px 0`
- Error: `--rk-stories-error-z` `5`, `--rk-stories-error-bg` `linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`, `--rk-stories-error-fg` `rgba(255, 255, 255, 0.5)`, `--rk-stories-error-gap` `12px`, `--rk-stories-error-text-size` `13px`
- Nav: `--rk-stories-nav-z` `20`, `--rk-stories-nav-size` `44px`, `--rk-stories-nav-bg` `rgba(255, 255, 255, 0.1)`, `--rk-stories-nav-bg-hover` `rgba(255, 255, 255, 0.2)`, `--rk-stories-nav-fg` `rgba(255, 255, 255, 0.7)`, `--rk-stories-nav-fg-hover` `#fff`, `--rk-stories-nav-transition` `150ms`
- Video: `--rk-stories-video-bg` `#000`, `--rk-stories-video-poster-transition` `200ms`
- Carousel: `--rk-stories-card-bg` `#262626`, `--rk-stories-card-radius` `8px`, `--rk-stories-card-scrim` `rgba(0, 0, 0, 0.45)`, `--rk-stories-card-fg` `#fff`, `--rk-stories-card-name-size` `14px`, `--rk-stories-card-time-fg` `rgba(255, 255, 255, 0.7)`, `--rk-stories-card-time-size` `13px`, `--rk-stories-card-gap` `6px`, `--rk-stories-card-transition` `300ms`
- Ring: `--rk-stories-ring-spin-duration` `4s`, `--rk-stories-ring-active-scale` `0.95`, `--rk-stories-ring-gradient` `none` (internal, written by the ring on every render)
- Ring list: `--rk-stories-ring-list-gap` `12px`, `--rk-stories-ring-list-padding` `12px`, `--rk-stories-ring-list-item-gap` `4px`, `--rk-stories-ring-list-name-size` `12px`
- Header: `--rk-stories-header-z` `5`, `--rk-stories-header-top` `18px`, `--rk-stories-header-padding` `12px 16px`, `--rk-stories-header-gap` `8px`, `--rk-stories-header-transition` `200ms`, `--rk-stories-header-avatar-size` `32px`, `--rk-stories-header-name-fg` `#fff`, `--rk-stories-header-name-size` `14px`, `--rk-stories-header-name-weight` `600`, `--rk-stories-header-time-fg` `rgba(255, 255, 255, 0.6)`, `--rk-stories-header-time-size` `12px`, `--rk-stories-header-actions-gap` `8px`, `--rk-stories-header-btn-fg` `#fff`, `--rk-stories-header-btn-padding` `4px`, `--rk-stories-header-spinner-size` `20px`, `--rk-stories-header-spinner-track` `rgba(255, 255, 255, 0.3)`, `--rk-stories-header-spinner-fg` `#fff`, `--rk-stories-header-spinner-duration` `0.8s`
- Heart: `--rk-stories-heart-z` `20`, `--rk-stories-heart-duration` `800ms`

## Accessibility

Labelled modal dialog: `role="dialog"`, `aria-modal="true"`, `ariaLabel` as the name (default "Stories player"). Focus captured on open, returned to the trigger on close; Tab/Shift+Tab cycle inside and wrap, escaped focus is pulled back — `captureFocusForReturn` + `createFocusTrap` from `@reelkit/core`, re-exported by `@reelkit/angular`. Body scroll locked while open. Carousel cards are buttons labelled "Open stories by <name>", after the player controls in the tab order and out of it while a slide runs; a card that opens its group hands focus back to the dialog.

## Server-Side Rendering

Renders nothing until open and reads no browser API during construction, so it is safe under Angular SSR; viewed state is read after mount, keeping the server render and first client render in agreement.

## Keyboard Shortcuts

| Key          | Action                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `ArrowLeft`  | Previous story. On a group's first story: previous group, where it was left; first group: nothing. |
| `ArrowRight` | Next story. On a group's last story: next group; last group: closes the player.                    |
| `Escape`     | Close player                                                                                       |

`[enableKeyboard]="false"` turns all three off.

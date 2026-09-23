---
title: Angular Stories Player
url: https://reelkit.dev/docs/angular-stories-player
section: Angular
order: 5
desc: Instagram-style stories player overlay for Angular. Groups schema, inputs, outputs, template slots, viewed state, desktop carousel, URL state, theming tokens and CSS classes shared with the React and Vue stories players.
---

# Angular Stories Player

Instagram-style stories player overlay for Angular. Built on `@reelkit/stories-core`, same engine as React + Vue players. CSS classes + theming tokens identical across all three (classes `.rk-stories-*`, tokens `--rk-stories-*`) — theme ports between bindings.

## Install

```bash
npm install @reelkit/angular-stories-player @reelkit/angular @reelkit/core @reelkit/stories-core lucide-angular
```

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

## RkStoriesUrlOverlayComponent

Every input above except `isOpen`, `initialGroupIndex`, `initialStoryIndex` — supplied by the controller.

- `controller` (`UrlStateController<TwoAxisPosition>`, required)

Open group + story live in one `?story=<group>.<story>` parameter. Inner navigation replaces the history entry, so one back step closes the player rather than walking back through every story.

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

## Viewed state

```ts
protected readonly viewed = createStoriesViewedStateController({
  storageKey: 'my-app-stories-seen',
  groups: () => this.groups(),
});
```

Each user resumes on their first unseen story, every story shown is recorded, rings go flat once a user is watched to the end. Give the same controller to `rk-stories-ring-list` and the overlay.

## Progress bar and header per group

`chromePlacement="group"` — every group gets its own progress bar + header inside its slide, both turn with the group (Instagram). Default `'overlay'`: one copy above the player, switching after the group changes.

- Neighbouring group shows the story it will open on, nothing played.
- Group being left keeps its progress until the turn ends; one played to the end stays full.
- `rkStoriesProgressBar` / `rkStoriesHeader` templates rendered for every group on screen, contexts carry `groupIndex` + `isActive`; neighbour → `isActive: false`, progress signals hold still.
- `rkStoriesHeader` template sits in the swipe area: a tap moves between stories unless it hits a `button`, a link, or `role="button"`.
- Desktop carousel: player hidden while cards slide, so the choice shows once the group is open.

## Template slots

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

## StoriesApi

From `(apiReady)`. The player is rebuilt on every open, so keep the newest handle.

`nextStory()`, `prevStory()`, `nextGroup()`, `prevGroup()`, `goToGroup(index)`, `pause()`, `resume()`.

## Sub-components

`RkStoriesRingComponent`, `RkStoriesRingListComponent`, `RkStoryHeaderComponent`, `RkCanvasProgressBarComponent` (`[live]="false"` draws only on signal change or resize), `RkImageStorySlideComponent`, `RkVideoStorySlideComponent`, `RkHeartAnimationComponent`. `RkStoriesCarouselComponent` and its `CarouselSlide` type are exported as well, but the overlay owns every value it draws from — use the `rkStoriesGroupPreview` slot to restyle a card rather than mounting it yourself. Every video story plays through one shared `<video>`, which is what keeps sound alive on iOS between stories.

## Re-exports

From `@reelkit/angular`: `createOverlayUrlState`, `urlIndexTwoAxisKey`, `urlStableIdTwoAxisKey`, `base64UrlCodec`, `createViewedStateController`, `twoAxisViewedTracking`, `createLocalStorageAdapter`, `createSessionStorageAdapter`, `createMemoryStorageAdapter`, plus the URL and viewed-state types.

From `@reelkit/stories-core`: `createStoriesViewedStateController`, `StoriesViewedStateController`, `StoriesViewedStateControllerConfig`, `StoryItem`, `AuthorInfo`, `StoriesGroup`, `MediaType`.

`attachViewedState` attaches a viewed-state controller for as long as the calling component lives.

## RkStoriesOverlayComponent inputs

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

## Outputs

- `(closed)` — void. Player reports, host decides; covers ✕, swipe down, Escape, last story finishing
- `(apiReady)` — `StoriesApi`, on every open
- `(storyChanged)`, `(storyViewed)`, `(storyCompleted)`, `(doubleTapped)` — `{ groupIndex, storyIndex }`
- `(groupChanged)` — number
- `(paused)`, `(resumed)` — void

## Content types

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

## CSS + theming

Classes `.rk-stories-*`, tokens `--rk-stories-*` on `:root` — identical to the React and Vue players, so a theme written for one works for the others.

## Accessibility + SSR

Labelled modal dialog: `role="dialog"`, `aria-modal="true"`, `ariaLabel` as the name (default "Stories player"). Focus captured on open, returned to the trigger on close; Tab/Shift+Tab cycle inside and wrap, escaped focus is pulled back — `captureFocusForReturn` + `createFocusTrap`. Body scroll locked while open. Carousel cards are buttons labelled "Open stories by <name>", after the player controls in the tab order and out of it while a slide runs. Renders nothing until open and reads no browser API during construction, so it is safe under Angular SSR; viewed state is read after mount, keeping the server render and first client render in agreement.

## Keyboard

`←` previous story (crosses into the previous user at a group edge), `→` next story, `Escape` close. `enableKeyboard="false"` turns all three off.

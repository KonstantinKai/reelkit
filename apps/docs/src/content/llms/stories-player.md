---
title: Stories Player
url: https://reelkit.dev/docs/stories-player
section: React
order: 5
desc: Instagram-style stories player overlay for React. StoriesGroup schema, two-level navigation (groups + stories), auto-advance timer, canvas progress bar, tap zones, slot renderers, theming.
---

# Stories Player

Instagram-style stories player overlay for React. Two-level nav (groups + stories), `requestAnimationFrame` auto-advance, canvas-rendered segmented progress bar, configurable tap zones, custom slot renderers, full theming via CSS custom properties.

## Features

- Nested navigation: tap to advance stories, swipe to switch groups
- Video stories with autoplay and a sound toggle
- Auto-advance timer per story, canvas-based segmented progress bar
- 3D group transitions: cube, flip, fade, zoom, slide
- Virtualized: only 3 slides in the DOM
- Double-tap heart animation, desktop chevron buttons, Instagram-style story rings
- Generic `StoryItem` types, render props for every UI element
- Shareable `?story=group.story` URLs; viewed state that survives reloads

## Installation

```bash
npm install @reelkit/react-stories-player @reelkit/react lucide-react
```

Peers: `@reelkit/react`, `react` and `react-dom` 18+, `lucide-react` (icons of the default header and navigation; replace them with `renderHeader` / `renderNavigation` to use another icon set).

```ts
import { StoriesOverlay } from '@reelkit/react-stories-player';
import type { StoriesGroup, StoryItem } from '@reelkit/stories-core';
import '@reelkit/react-stories-player/styles.css';
```

## Quick Start

```tsx
import { useState } from 'react';
import { StoriesOverlay } from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';

const groups = [
  {
    author: { id: 'a1', name: 'Alex', avatar: '/avatars/a1.jpg' },
    stories: [
      { id: 's1', mediaType: 'image', src: '/img1.jpg' },
      { id: 's2', mediaType: 'video', src: '/v1.mp4', poster: '/p1.jpg' },
    ],
  },
  // ...
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>View Stories</button>

      <StoriesOverlay
        isOpen={isOpen}
        groups={groups}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

## Live Demo

https://react-demo.reelkit.dev/stories-player — click a story ring to open the player; tap left/right sides to navigate, swipe to switch users.

## URL State (shareable links, back button)

Live demo: https://react-demo.reelkit.dev/stories-player-url

`StoriesUrlOverlay` is a separate component whose open state lives in the URL. Both axes ride one parameter — `?story=<group>.<story>` — so the playing story has a link that can be shared, bookmarked, and closed with the back button. Build a controller with `useOverlayUrlState` and `urlIndexTwoAxisKey`, then pass it as `controller`. **Opening a user is a link** — the href is the open action, no click handler.

> **Built-in keys.** Stories are two-axis, so spread a two-axis key: `urlIndexTwoAxisKey` (group and story by position) or `urlStableIdTwoAxisKey` (the group by a stable `id`) — both re-exported from `@reelkit/react`. See the [URL State guide](/docs/core/guide#url-state) and [Core API](/docs/core/api#url-state).

```tsx
import {
  StoriesUrlOverlay,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
} from '@reelkit/react-stories-player';
import { Link } from 'react-router-dom';

const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

// Opening a user is a link — the overlay reads the URL and opens itself.
{
  groups.map((g, i) => (
    <Link key={g.author.id} to={`?story=${i}.0`}>
      {g.author.name}
    </Link>
  ));
}

<StoriesUrlOverlay controller={stories} groups={groups} />;
```

Full `useOverlayUrlState` options (`param`, `adapter`, `codec`, `locator`): see the [React API reference](/docs/react/api#useoverlayurlstate).

- Opening pushes **one** history entry. Swiping stories _and_ switching users both **replace** it — N navigations add 0 entries, so one back step always closes the player. Back closes; it does not step stories.
- **Inner navigation is carried.** The story index is not frozen at group granularity — advancing within a user's stories updates `?story=2.<n>`, so a deep link lands on the exact story.
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay.
- A parameter naming no group or story (stale bookmark, hand-edited value, a story past a group's end) is dropped from the URL rather than opening a neighbor.

**Routed app — pass an adapter.** Writing `history.pushState` behind a router leaves its location stale and its next navigation drops the param:

```tsx
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const stories = useOverlayUrlState({
  param: 'story',
  adapter,
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

<StoriesUrlOverlay controller={stories} groups={groups} />;
```

**Stable links.** The group is positional by default — a bookmarked `?story=2.0` opens a different user once the feed is reordered. Address the group by a stable id instead: `outerCodec` spells the id into the URL, `outerLocator` finds where it sits. Add `innerCodec` + `innerLocate` + `innerIdentify` to address the story by id too; omit them and the story half stays a local index within the resolved group. The inner id must not contain `.` (the wire splits on the last dot).

```tsx
const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    // ?story=user_42.3
    outerCodec: { decode: (raw) => raw, encode: (id) => id },
    outerLocator: {
      locate: (id) => groups.findIndex((g) => g.author.id === id),
      identify: (index) => groups[index].author.id,
    },
    // Optional: ?story=user_42.story_7 — the story by id too
    innerCodec: { decode: (raw) => raw, encode: (id) => id },
    innerLocate: (outer, id) => {
      const index = groups[outer].stories.findIndex((s) => s.id === id);
      return index === -1 ? null : index;
    },
    innerIdentify: (outer, index) => groups[outer].stories[index].id,
  }),
});
```

**Infinite feeds.** Paging is a `outerLocator` concern, independent of the codec. `locate` is synchronous, so it answers only for groups already loaded — a shared link to group 400 of a feed that loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses; the story is re-bounded against whichever group it settles on.

> **Same `locateAsync`, outer axis.** This is the same `locateAsync` pager the single-axis keys take — on a two-axis key it rides the `outerLocator` you pass, so the group axis pages while the story stays a local index within the resolved group.

```tsx
const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    outerLocator: {
      locate: (index) => (index < groups.length ? index : null),
      identify: (index) => index,
      locateAsync: async (index) => {
        const loaded = await loadUntilGroup(index); // page up to it
        if (!loaded) return null; // exhausted — link names no group
        setGroups(loaded); // commit — the overlay renders from this state
        return index;
      },
    },
  }),
});
```

- While `locateAsync` is pending the player stays closed and the parameter is left alone, so the deep link survives the fetch. A `null` or a rejection drops the parameter.
- An answer arriving after the URL moved on, after a close, or after unmount is discarded — a slow fetch cannot open a story nobody asked for.

## Remembering what was seen

Rings show a gradient until a group is watched to the end, and a group reopens on the first story not yet seen. Both come from one `createStoriesViewedStateController` (from `@reelkit/stories-core`, re-exported here), created once where the feed lives and handed to the ring list and the player as `viewed`: they read the store, follow it and record what is shown by themselves. A stored entry names the author and the story by id, so it survives the feed being reordered; the same controller works in Vue and Angular. Options (`enabled`, `key`, `storage`) and the lower-level pieces: see [Stories Core](/docs/stories-core#viewed-controller).

```tsx
import { useRef, useState } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
} from '@reelkit/react-stories-player';

// The controller reads the groups through a getter every time; keep it
// current — a ref for a plain prop, or a signal.
const groupsRef = useRef(groups);
groupsRef.current = groups;

const [viewed] = useState(() =>
  createStoriesViewedStateController({
    storageKey: 'stories-seen',
    groups: () => groupsRef.current,
  }),
);

<StoriesRingList groups={groups} viewed={viewed} onSelect={open} />;

<StoriesOverlay
  isOpen={isOpen}
  onClose={close}
  groups={groups}
  initialGroupIndex={group}
  viewed={viewed}
/>;
```

- The story already on screen is reported viewed on mount, so opening a one-story group and closing marks it watched.
- `resumeStoryIndex` is consulted for every group reached for the first time this session, the one the player opens on included, unless `initialStoryIndex` names a story outright; a group already swiped through reopens where it was left.
- With `StoriesUrlOverlay` the parameter decides where the player opens, whatever has been stored. Everywhere else the resume callback decides.
- An entry names the furthest story reached, not a tally: adding a story to a watched group lights its ring again, removing one from the middle shortens the count.
- Storage is pluggable (`storage: createSessionStorageAdapter()`, or your own `StorageAdapter`); two open tabs stay in step through the browser's storage event.
- The player reads the store in an effect that runs while it is still closed. A player mounted only when it opens (`{open && <StoriesOverlay … />}`) has no such moment: call `viewed.attach()` yourself in an effect that returns its dispose.

## Desktop Carousel

`desktopLayout="carousel"` lays the player out like the Instagram web viewer: the active story in the center at its usual size, up to two neighbouring groups per side as smaller dimmed cards. Clicking a card opens that group while the cards slide across. The same `viewed` controller `StoriesRingList` takes gives a watched group's card the muted ring. The cards follow it by themselves, so only they repaint when a story is marked seen and the player does not render again.

```tsx
// The same controller the ring list takes: the cards draw the same rings and
// repaint by themselves when a story is marked seen.
<StoriesOverlay
  isOpen={open}
  onClose={() => setOpen(false)}
  groups={groups}
  initialGroupIndex={group}
  desktopLayout="carousel"
  viewed={viewed}
/>
```

- Up to 768px wide there are no cards and swipes use `groupTransition`, as with the default `'single'`; resizing across that width switches live.
- A card previews the story the group opens on (left there this session, else `resumeStoryIndex`): video poster or image; a non-video story with neither is drawn by `renderSlide` at player size and scaled down; a video without a poster shows `--rk-stories-card-bg`. The preview calls `renderSlide` with `isActive: false` and is inert (no focus, no clicks); keep mount-time side effects (playback, analytics) behind `isActive`.
- The timer does not run, and `onStoryViewed` does not fire for the opened story, until the slide ends. The slide runs regardless of `prefers-reduced-motion`.
- Card click, `goToGroup` / `nextGroup` / `prevGroup`, and arrow keys past a group's end all slide; a touch swipe moves the player itself and gets no slide.
- `renderGroupPreview` replaces a card's content; it gets `{ group, groupIndex, story, offset, viewedCount, onOpen }` (`GroupPreviewRenderProps<T>`), and the player still positions and slides the card.
- Default cards are buttons labelled "Open stories by {name}", after the player controls in tab order, out of it during a slide.

## Progress Bar and Header per Group

Default: one progress bar and header above the player, switching to the new group once it has changed. `chromePlacement="group"` gives every group its own inside its slide, so both turn with the group (Instagram).

```tsx
// Every group carries its own progress bar and header, so both turn with the
// group instead of switching above the player once it has changed.
<StoriesOverlay
  isOpen={open}
  onClose={() => setOpen(false)}
  groups={groups}
  chromePlacement="group"
/>
```

- A neighbouring group shows the story it will open on, nothing played.
- The group being left keeps its progress until the turn ends; one played to the end stays full.
- `renderProgressBar` / `renderHeader` are called for every group on screen and get `groupIndex` + `isActive`; for a neighbour `isActive` is `false` and the progress signals hold still.
- A custom header sits in the swipe area: a tap on it moves between stories unless it hits a `button`, a link, or `role="button"`.
- Desktop carousel: the player is hidden while cards slide, so the choice shows once the group is open.

## API Reference

### StoriesOverlayProps

`StoriesOverlayProps` — the controlled overlay's props. `onClose` is **required** here because you own the open state, so you must handle closing; the URL-driven `StoriesUrlOverlay` makes it optional (the URL drives closing).

| Prop                      | Type                                   | Default                                         | Description                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`                  | `boolean`                              | required                                        | Overlay visibility. True = body scroll locked.                                                                                                                                                                 |
| `groups`                  | `StoriesGroup<T>[]`                    | required                                        | Story groups to display                                                                                                                                                                                        |
| `onClose`                 | `() => void`                           | required                                        | Close overlay callback                                                                                                                                                                                         |
| `ariaLabel`               | `string`                               | `'Stories player'`                              | Dialog region accessible label                                                                                                                                                                                 |
| `initialGroupIndex`       | `number`                               | `0`                                             | Zero-based initial group index                                                                                                                                                                                 |
| `initialStoryIndex`       | `number`                               | `resumeStoryIndex(initialGroupIndex)`, else `0` | Zero-based initial story index in group. Naming one wins over anything remembered                                                                                                                              |
| `resumeStoryIndex`        | `(groupIndex: number) => number`       | —                                               | Story a group opens on the first time it is reached                                                                                                                                                            |
| `groupTransition`         | `TransitionTransformFn`                | `cubeTransition`                                | Outer (group) slider transition                                                                                                                                                                                |
| `defaultImageDuration`    | `number`                               | `5000`                                          | Default image auto-advance duration (ms)                                                                                                                                                                       |
| `tapZoneSplit`            | `number`                               | `0.3`                                           | Tap zone split ratio (0–1). Left = prev, right = next.                                                                                                                                                         |
| `hideUIOnPause`           | `boolean`                              | `true`                                          | Hide story UI (header, footer) on long-press pause                                                                                                                                                             |
| `enableKeyboard`          | `boolean`                              | `true`                                          | Enable keyboard nav (arrows, Escape)                                                                                                                                                                           |
| `innerTransitionDuration` | `number`                               | `200`                                           | Inner (story) transition duration (ms)                                                                                                                                                                         |
| `minSegmentWidth`         | `number`                               | `8`                                             | Min progress bar segment width (px)                                                                                                                                                                            |
| `apiRef`                  | `MutableRefObject<StoriesApi \| null>` | -                                               | Ref for imperative StoriesApi                                                                                                                                                                                  |
| `desktopLayout`           | `'single' \| 'carousel'`               | `'single'`                                      | Desktop layout; `'carousel'` = neighbouring group cards + slide. Phones: single. Type exported as `DesktopLayout`                                                                                              |
| `chromePlacement`         | `'overlay' \| 'group'`                 | `'overlay'`                                     | Where progress bar + header live; `'group'` = one per group slide, turning with it. Type exported as `ChromePlacement`                                                                                         |
| `viewed`                  | `StoriesViewedStateController`         | -                                               | From `createStoriesViewedStateController()`: groups resume on the first unseen story, every story shown is recorded, carousel cards mute a watched group's ring. Hand the same controller to `StoriesRingList` |

### Slot renderers

| Prop                 | Type                                               | Description                                                                      |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `renderHeader`       | `(props: HeaderRenderProps<T>) => ReactNode`       | Custom header. Gets author, story, pause/mute state, `groupIndex`, `isActive`.   |
| `renderFooter`       | `(props: FooterRenderProps<T>) => ReactNode`       | Custom footer. Gets author + story info.                                         |
| `renderSlide`        | `(props: SlideRenderProps<T>) => ReactNode`        | Custom slide. Replaces default image/video slides.                               |
| `renderNavigation`   | `(props: NavigationRenderProps) => ReactNode`      | Custom desktop nav. Replaces default prev/next chevrons.                         |
| `renderProgressBar`  | `(props: ProgressBarRenderProps<T>) => ReactNode`  | Custom progress bar. Replaces default canvas bar. Gets `groupIndex`, `isActive`. |
| `renderLoading`      | `(props: LoadingRenderProps<T>) => ReactNode`      | Custom loading UI. Default = header spinner.                                     |
| `renderError`        | `(props: ErrorRenderProps<T>) => ReactNode`        | Custom error UI. Default = error icon overlay.                                   |
| `renderGroupPreview` | `(props: GroupPreviewRenderProps<T>) => ReactNode` | Custom desktop carousel card content.                                            |

### StoriesUrlOverlayProps

Takes every `StoriesOverlay` prop except the open-state trio (`isOpen`, `initialGroupIndex`, `initialStoryIndex`), supplied from the controller instead.

| Prop         | Type                                  | Default  | Description                                                                                                                                                                                                                   |
| ------------ | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController<TwoAxisPosition>` | required | Controller from `useOverlayUrlState` spread with `urlIndexTwoAxisKey`. Its `position` — a `{ outer, inner }` object — decides whether the player is open and where; the overlay writes back on every navigation and on close. |
| `onClose`    | `() => void`                          | —        | Called after the player closes. The URL drives closing, not this.                                                                                                                                                             |

### Callbacks

| Prop              | Type                               | Description                                                                                                                            |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `onClose`         | `() => void`                       | Called on close. Required on `StoriesOverlay` (you own the open state); optional on `StoriesUrlOverlay`, where the URL drives closing. |
| `onStoryChange`   | `(groupIndex, storyIndex) => void` | Active story changed                                                                                                                   |
| `onGroupChange`   | `(groupIndex) => void`             | Active group changed                                                                                                                   |
| `onStoryViewed`   | `(groupIndex, storyIndex) => void` | Story became visible                                                                                                                   |
| `onStoryComplete` | `(groupIndex, storyIndex) => void` | Story timer done                                                                                                                       |
| `onDoubleTap`     | `(groupIndex, storyIndex) => void` | Double-tap gesture                                                                                                                     |
| `onPause`         | `() => void`                       | Player paused                                                                                                                          |
| `onResume`        | `() => void`                       | Player resumed                                                                                                                         |

## Transitions

`groupTransition` sets the 3D effect between groups. Transition functions come from `@reelkit/react`: `cubeTransition` (default), `flipTransition`, `fadeTransition`, `zoomTransition`, `slideTransition`.

```tsx
import { flipTransition } from '@reelkit/react';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  groupTransition={flipTransition}
/>;
```

## Content Loading Lifecycle

Each slide reports its loading state through the callbacks in `SlideRenderProps`:

| Callback          | When                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `onReady`         | Content ready (image loaded, video playing). The progress timer starts.     |
| `onWaiting`       | Content stalls (video buffering mid-playback). Spinner shows, timer pauses. |
| `onError`         | Content failed to load. The error overlay shows.                            |
| `onDurationReady` | Real media duration (from video metadata); restarts the timer with it.      |
| `onEnded`         | Media ended (video finished). Advances to the next story.                   |

The built-in `ImageStorySlide` and `VideoStorySlide` preload the next story, so a preloaded story appears without a spinner.

## Render Props

Every UI element can be replaced by a render prop (table under API Reference); each gets typed props with the state and callbacks it needs. `renderSlide` is usually built from `ImageStorySlide` / `VideoStorySlide`. `renderProgressBar` gets a `progress` signal emitting 0 to 1. `renderGroupPreview` replaces a carousel card's content; the player still positions, scales and slides the card, and `onOpen` opens the group.

### renderHeader

```tsx
<StoriesOverlay
  {...props}
  renderHeader={({
    author,
    isPaused,
    isMuted,
    isVideo,
    onToggleSound,
    onTogglePause,
    onClose,
  }) => (
    <header className="my-header">
      <img src={author.avatar} alt="" />
      <strong>{author.name}</strong>
      {isVideo && (
        <button onClick={onToggleSound}>{isMuted ? 'Unmute' : 'Mute'}</button>
      )}
      <button onClick={onTogglePause}>{isPaused ? 'Play' : 'Pause'}</button>
      <button onClick={onClose}>×</button>
    </header>
  )}
/>
```

### renderFooter (reply input)

```tsx
<StoriesOverlay
  {...props}
  renderFooter={({ author, story }) => (
    <footer>
      <input placeholder={`Reply to ${author.name}…`} />
      <button>❤️</button>
    </footer>
  )}
/>
```

## StoriesApi (via apiRef)

```tsx
const apiRef = useRef<StoriesApi | null>(null);

<StoriesOverlay
  apiRef={apiRef}
  groups={groups}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>;

// Skip an entire group
apiRef.current?.nextGroup();
```

| Method             | Type               | Description                 |
| ------------------ | ------------------ | --------------------------- |
| `nextStory()`      | `() => void`       | Next story in current group |
| `prevStory()`      | `() => void`       | Prev story in current group |
| `nextGroup()`      | `() => void`       | Next user group             |
| `prevGroup()`      | `() => void`       | Prev user group             |
| `goToGroup(index)` | `(number) => void` | Jump to group by index      |
| `pause()`          | `() => void`       | Pause auto-advance + timer  |
| `resume()`         | `() => void`       | Resume auto-advance + timer |

## Double-Tap & Likes

A built-in heart animation plays on double-tap. `onDoubleTap(groupIndex, storyIndex)` fires so you can persist the like yourself; the player keeps no like state.

```tsx
<StoriesOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  groups={groups}
  onDoubleTap={(groupIndex, storyIndex) =>
    toggleLike(groups[groupIndex].stories[storyIndex].id)
  }
/>
```

Speed: `--rk-stories-heart-duration`. Color, size, or hiding it: target `.rk-stories-heart` (`display: none` to hide and animate in `onDoubleTap` yourself). There is no render prop for the heart. `HeartAnimation` is exported for standalone use.

## Tap Zones (mobile)

- Left 30% → prev story
- Right 70% → next story
- Long press → pause (UI hidden if `hideUIOnPause`)
- Release long press → resume
- Double-tap → fires `onDoubleTap`

## Sub-Components

Reusable building blocks exported for composition in custom render props.

| Component           | Description                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CanvasProgressBar` | Canvas-based segmented progress bar. Renders one segment per story and animates the active segment fill via `requestAnimationFrame`. Supports a sliding window for groups with many stories. `live={false}`: draws only on signal change or resize, no animation loop. |
| `StoryHeader`       | Default header with author avatar, name, verified badge, relative timestamp, pause/play toggle, mute/unmute toggle, loading spinner, and close button. Used when `renderHeader` is not provided.                                                                       |
| `ImageStorySlide`   | Full-bleed image slide with `object-fit: cover`. Reports load/error via callbacks for lifecycle tracking.                                                                                                                                                              |
| `VideoStorySlide`   | Video slide using a shared `<video>` element for iOS sound continuity. Handles autoplay, poster frames, sound sync, and reports duration and playback lifecycle events.                                                                                                |
| `StoriesRing`       | Circular avatar with an Instagram-style gradient ring. Two states: a group with stories left to watch gets the rotating gradient, a fully watched one gets a flat muted ring.                                                                                          |
| `StoriesRingList`   | Horizontal scrollable row of `StoriesRing` components with author names. One ring per group.                                                                                                                                                                           |
| `HeartAnimation`    | Animated heart overlay triggered on double-tap. Scales up and fades out over 800ms. Customise via CSS.                                                                                                                                                                 |

```tsx
import {
  CanvasProgressBar,
  HeartAnimation,
  ImageStorySlide,
  StoriesRing,
  StoriesRingList,
  StoryHeader,
  VideoStorySlide,
} from '@reelkit/react-stories-player';

// `viewed` is the same createStoriesViewedStateController the player takes; the
// rings follow it by themselves.
<StoriesRingList
  groups={groups}
  viewed={viewed}
  onSelect={(groupIndex) => openStories(groupIndex)}
/>;
```

## Re-exports

Everything a consumer needs comes from this package; no direct `@reelkit/core` import is necessary.

- From `@reelkit/react`: `SoundProvider`, `useSoundState`, `useOverlayUrlState`, `createViewedStateController`, `twoAxisViewedTracking`, `createLocalStorageAdapter`, `createSessionStorageAdapter`, `createMemoryStorageAdapter`, `urlIndexTwoAxisKey`, `urlStableIdTwoAxisKey`, `base64UrlCodec`; types `UrlAdapter`, `UrlCodec`, `UrlLocator`, `UrlKey`, `UrlStateController`, `TwoAxisPosition`, `TwoAxisIdentity`, `UrlIndexTwoAxisKeyOptions`, `ViewedStateController`, `ViewedStateOptions`, `StorageAdapter`.
- From `@reelkit/stories-core`: `createStoriesViewedStateController`, `StoriesViewedStateController`, `StoriesViewedStateControllerConfig`; content types `StoryItem`, `AuthorInfo`, `StoriesGroup`, `MediaType`.

Inside the player a `SoundProvider` is already in place. A `VideoStorySlide` or custom slide rendered anywhere else needs one above it, or `useSoundState` throws.

## Types

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number; // ms; images default to 5000, videos use their own length
  createdAt?: string | Date;
  aspectRatio?: number; // width / height
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

Render prop types, all exported: `HeaderRenderProps<T>`, `FooterRenderProps<T>`, `SlideRenderProps<T>`, `NavigationRenderProps`, `ProgressBarRenderProps<T>`, `LoadingRenderProps<T>`, `ErrorRenderProps<T>`, `GroupPreviewRenderProps<T>`, plus `StoriesApi`, `DesktopLayout`, `ChromePlacement`.

## Custom Story Types

Extend `StoryItem` and pass the type parameter; every render prop receives the extended type.

```tsx
interface PromoStory extends StoryItem {
  title: string;
  ctaText?: string;
}

<StoriesOverlay<PromoStory>
  isOpen={isOpen}
  onClose={close}
  groups={promoGroups}
  renderSlide={({ story, size }) => <Promo story={story} size={size} />}
/>;
```

## CSS Classes

Plain class names (not CSS modules); override in a stylesheet loaded after `@reelkit/react-stories-player/styles.css`. Prefer the tokens under Theming for color, size and z-index.

- Overlay: `.rk-stories-overlay`, `.rk-stories-swipe-wrapper`, `.rk-stories-container`, `.rk-stories-ui-layer` (inside every group slide with `chromePlacement="group"`), `.rk-stories-ui-layer--hidden`, `.rk-stories-error`, `.rk-stories-error-text`
- Structure: `.rk-stories-slide-wrapper` (one group), `.rk-stories-story` (one story), `.rk-stories-progress-bar`, `.rk-stories-nav-btn`
- Header: `.rk-stories-header`, `.rk-stories-header--hidden`, `.rk-stories-header-avatar`, `.rk-stories-header-name`, `.rk-stories-header-verified`, `.rk-stories-header-time`, `.rk-stories-header-actions`, `.rk-stories-header-btn`, `.rk-stories-header-btn--desktop` (pause button, above 768px only), `.rk-stories-header-spinner`
- Media: `.rk-stories-image`, `.rk-stories-video`, `.rk-stories-video-element`, `.rk-stories-video-poster`, `.rk-stories-video-poster--visible`, `.rk-stories-heart`
- Rings: `.rk-stories-ring`, `.rk-stories-ring--active`, `.rk-stories-ring-avatar`, `.rk-stories-ring-list`, `.rk-stories-ring-list-item`, `.rk-stories-ring-list-name`
- Desktop carousel: `.rk-stories-overlay--carousel`, `.rk-stories-overlay--sliding`, `.rk-stories-carousel`, `.rk-stories-carousel--instant`, `.rk-stories-card` (`--center`, `--hidden`), `.rk-stories-card-button`, `.rk-stories-card-image`, `.rk-stories-card-frame` (scaled-down `renderSlide` preview of a story with no image or poster; inert), `.rk-stories-card-scrim`, `.rk-stories-card-info`, `.rk-stories-card-name`, `.rk-stories-card-time`

## Theming

Every visual value is a `--rk-stories-*` custom property. Override at `:root` or any ancestor of the overlay.

| Token                                  | Default                                                            | Controls                                                 |
| -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| `--rk-stories-overlay-bg`              | `#000`                                                             | Full-screen backdrop color                               |
| `--rk-stories-overlay-z`               | `9999`                                                             | Overlay z-index                                          |
| `--rk-stories-swipe-gap`               | `16px`                                                             | Gap between nav buttons and the story canvas             |
| `--rk-stories-container-radius`        | `12px`                                                             | Story canvas corners (desktop)                           |
| `--rk-stories-container-radius-mobile` | `0`                                                                | Story canvas corners up to 768px wide                    |
| `--rk-stories-ui-z`                    | `15`                                                               | UI layer z-index                                         |
| `--rk-stories-ui-transition`           | `200ms`                                                            | Fade when hideUIOnPause toggles                          |
| `--rk-stories-top-shade-height`        | `120px`                                                            | Top scrim height behind the header                       |
| `--rk-stories-top-shade-bg`            | `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)` | Top scrim color                                          |
| `--rk-stories-error-z`                 | `5`                                                                | Error state z-index                                      |
| `--rk-stories-error-bg`                | `linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`   | Error state background                                   |
| `--rk-stories-error-fg`                | `rgba(255, 255, 255, 0.5)`                                         | Error icon and text color                                |
| `--rk-stories-error-gap`               | `12px`                                                             | Space between error icon and text                        |
| `--rk-stories-error-text-size`         | `13px`                                                             | Error message font size                                  |
| `--rk-stories-nav-z`                   | `20`                                                               | Nav button z-index                                       |
| `--rk-stories-nav-size`                | `44px`                                                             | Nav button size                                          |
| `--rk-stories-nav-bg`                  | `rgba(255, 255, 255, 0.1)`                                         | Nav button background                                    |
| `--rk-stories-nav-bg-hover`            | `rgba(255, 255, 255, 0.2)`                                         | Nav button hover background                              |
| `--rk-stories-nav-fg`                  | `rgba(255, 255, 255, 0.7)`                                         | Nav button icon color                                    |
| `--rk-stories-nav-fg-hover`            | `#fff`                                                             | Nav button hover icon color                              |
| `--rk-stories-nav-transition`          | `150ms`                                                            | Nav button background and color transition               |
| `--rk-stories-video-bg`                | `#000`                                                             | Letterbox behind the video                               |
| `--rk-stories-video-poster-transition` | `200ms`                                                            | Poster fade when the video starts                        |
| `--rk-stories-progress-bar-z`          | `10`                                                               | Progress bar z-index                                     |
| `--rk-stories-progress-bar-padding`    | `8px 8px 0`                                                        | Space around the progress bar                            |
| `--rk-stories-header-z`                | `5`                                                                | Header z-index                                           |
| `--rk-stories-header-top`              | `18px`                                                             | Header offset from the top of the story                  |
| `--rk-stories-header-padding`          | `12px 16px`                                                        | Header row padding                                       |
| `--rk-stories-header-gap`              | `8px`                                                              | Space between avatar, name and time                      |
| `--rk-stories-header-transition`       | `200ms`                                                            | Header fade when hidden                                  |
| `--rk-stories-header-avatar-size`      | `32px`                                                             | Avatar size                                              |
| `--rk-stories-header-name-fg`          | `#fff`                                                             | Author name color                                        |
| `--rk-stories-header-name-size`        | `14px`                                                             | Author name font size                                    |
| `--rk-stories-header-name-weight`      | `600`                                                              | Author name font weight                                  |
| `--rk-stories-header-time-fg`          | `rgba(255, 255, 255, 0.6)`                                         | Time-ago color                                           |
| `--rk-stories-header-time-size`        | `12px`                                                             | Time-ago font size                                       |
| `--rk-stories-header-actions-gap`      | `8px`                                                              | Space between header action buttons                      |
| `--rk-stories-header-btn-fg`           | `#fff`                                                             | Header action icon color                                 |
| `--rk-stories-header-btn-padding`      | `4px`                                                              | Header action button padding                             |
| `--rk-stories-header-spinner-size`     | `20px`                                                             | Buffering spinner size                                   |
| `--rk-stories-header-spinner-track`    | `rgba(255, 255, 255, 0.3)`                                         | Spinner track color                                      |
| `--rk-stories-header-spinner-fg`       | `#fff`                                                             | Spinner arc color                                        |
| `--rk-stories-header-spinner-duration` | `0.8s`                                                             | One spinner turn                                         |
| `--rk-stories-heart-z`                 | `20`                                                               | Heart z-index                                            |
| `--rk-stories-heart-duration`          | `800ms`                                                            | Heart pop-in/fade-out duration                           |
| `--rk-stories-ring-spin-duration`      | `4s`                                                               | Rotation of a ring with stories left to watch            |
| `--rk-stories-ring-active-scale`       | `0.95`                                                             | Ring scale while pressed                                 |
| `--rk-stories-ring-gradient`           | `none`                                                             | Internal: written by the ring on every render; no effect |
| `--rk-stories-ring-list-gap`           | `12px`                                                             | Space between rings                                      |
| `--rk-stories-ring-list-padding`       | `12px`                                                             | Ring list padding                                        |
| `--rk-stories-ring-list-item-gap`      | `4px`                                                              | Space between a ring and its name                        |
| `--rk-stories-ring-list-name-size`     | `12px`                                                             | Name font size under a ring                              |
| `--rk-stories-card-bg`                 | `#262626`                                                          | Card background when there is no preview frame           |
| `--rk-stories-card-radius`             | `8px`                                                              | Card corner radius                                       |
| `--rk-stories-card-scrim`              | `rgba(0, 0, 0, 0.45)`                                              | Dimming over a side card                                 |
| `--rk-stories-card-fg`                 | `#fff`                                                             | Card text color                                          |
| `--rk-stories-card-name-size`          | `14px`                                                             | Card author name font size                               |
| `--rk-stories-card-time-fg`            | `rgba(255, 255, 255, 0.7)`                                         | Card time-ago color                                      |
| `--rk-stories-card-time-size`          | `13px`                                                             | Card time-ago font size                                  |
| `--rk-stories-card-gap`                | `6px`                                                              | Space between ring, name and time on a card              |
| `--rk-stories-card-transition`         | `300ms`                                                            | Carousel slide duration                                  |

## Accessibility

Modal dialog (`role="dialog"`, `aria-modal="true"`), named by `ariaLabel` (default "Stories player"). Focus is captured on open and returned to the trigger on close; Tab / Shift+Tab cycle inside and escaping focus is pulled back. Implemented with `captureFocusForReturn` and `createFocusTrap` from `@reelkit/core`, re-exported by `@reelkit/react`. Carousel cards are buttons labelled "Open stories by {name}", after the player controls in tab order, out of it during a slide.

## Server-Side Rendering

The overlay renders nothing while closed and portals into `document.body` only once it opens, on the client. `StoriesUrlOverlay` reads the address bar in an effect after mount, so a server render never opens it. `StoriesRingList` renders every ring unwatched on the server; the viewed store is read after mount, so server markup and first client render agree. See `/docs/ssr`.

## Keyboard Shortcuts

| Key          | Action                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArrowLeft`  | Previous story. On a group's first story, the previous group, on the story it was left on (else its resume story); nothing on the first group |
| `ArrowRight` | Next story. Past a group's last story, the next group; past the last group, the player closes                                                 |
| `Escape`     | Close player                                                                                                                                  |

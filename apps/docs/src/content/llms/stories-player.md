---
title: Stories Player
url: https://reelkit.dev/docs/stories-player
section: React
order: 5
desc: Instagram-style stories player overlay for React. StoriesGroup schema, two-level navigation (groups + stories), auto-advance timer, canvas progress bar, tap zones, slot renderers, theming.
---

# Stories Player

Instagram-style stories player overlay for React. Two-level nav (groups + stories), `requestAnimationFrame` auto-advance, canvas-rendered segmented progress bar, configurable tap zones, custom slot renderers, full theming via CSS custom properties.

## Install

```bash
npm install @reelkit/react-stories-player
```

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

## StoriesGroup Schema

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  aspectRatio?: number;
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

**Stable links.** The group is positional by default — a bookmarked `?story=2.0` opens a different user once the feed is reordered. Address the group by a stable id instead: `outerCodec` spells the id into the URL, `outerLocator` finds where it sits. The story half stays a plain index within the resolved group.

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

### StoriesUrlOverlayProps

Takes every `StoriesOverlay` prop except the open-state trio (`isOpen`, `initialGroupIndex`, `initialStoryIndex`), supplied from the controller instead.

| Prop         | Type                                  | Default  | Description                                                                                                                                                                                                                   |
| ------------ | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController<TwoAxisPosition>` | required | Controller from `useOverlayUrlState` spread with `urlIndexTwoAxisKey`. Its `position` — a `{ outer, inner }` object — decides whether the player is open and where; the overlay writes back on every navigation and on close. |
| `onClose`    | `() => void`                          | —        | Called after the player closes. The URL drives closing, not this.                                                                                                                                                             |

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

## StoriesOverlay Props

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

## Callbacks

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

## StoriesApi (via apiRef)

| Method             | Type               | Description                 |
| ------------------ | ------------------ | --------------------------- |
| `nextStory()`      | `() => void`       | Next story in current group |
| `prevStory()`      | `() => void`       | Prev story in current group |
| `nextGroup()`      | `() => void`       | Next user group             |
| `prevGroup()`      | `() => void`       | Prev user group             |
| `goToGroup(index)` | `(number) => void` | Jump to group by index      |
| `pause()`          | `() => void`       | Pause auto-advance + timer  |
| `resume()`         | `() => void`       | Resume auto-advance + timer |

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

## CSS Theming Tokens

Common tokens (full list at `/docs/stories-player`):

| Token                          | Default                                         | Controls                    |
| ------------------------------ | ----------------------------------------------- | --------------------------- |
| `--rk-stories-overlay-bg`      | `#000`                                          | Full-screen backdrop color  |
| `--rk-stories-overlay-z`       | `9999`                                          | Overlay z-index             |
| `--rk-stories-progress-track`  | `rgba(255, 255, 255, 0.3)`                      | Progress segment background |
| `--rk-stories-progress-fill`   | `#fff`                                          | Active progress fill color  |
| `--rk-stories-header-bg`       | `linear-gradient(rgba(0,0,0,0.4), transparent)` | Header gradient scrim       |
| `--rk-stories-button-bg`       | `rgba(0, 0, 0, 0.5)`                            | Button background           |
| `--rk-stories-button-fg`       | `#fff`                                          | Button icon color           |
| `--rk-stories-card-bg`         | `#262626`                                       | Carousel card background    |
| `--rk-stories-card-scrim`      | `rgba(0, 0, 0, 0.45)`                           | Dimming over a side card    |
| `--rk-stories-card-transition` | `300ms`                                         | Carousel slide duration     |

## CSS Classes

- `.rk-stories-overlay` — root full-screen container
- `.rk-stories-progress` — top progress bar canvas wrapper
- `.rk-stories-header` — author + close header
- `.rk-stories-author` — author row (avatar + name)
- `.rk-stories-footer` — bottom interaction footer
- `.rk-stories-slide` — story slide wrapper
- `.rk-stories-tap-prev`, `.rk-stories-tap-next` — invisible tap zones
- `.rk-stories-nav-prev`, `.rk-stories-nav-next` — desktop nav arrows
- `.rk-stories-overlay--carousel`, `.rk-stories-overlay--sliding` — desktop carousel showing, slide running
- `.rk-stories-carousel`, `.rk-stories-card` (`--center`, `--hidden`), `.rk-stories-card-button`, `.rk-stories-card-image`, `.rk-stories-card-scrim`, `.rk-stories-card-info`, `.rk-stories-card-name`, `.rk-stories-card-time` — desktop carousel cards

## Keyboard Shortcuts

| Key          | Action         |
| ------------ | -------------- |
| `ArrowLeft`  | Previous story |
| `ArrowRight` | Next story     |
| `Escape`     | Close player   |
| `Space`      | Pause / resume |

## Custom Slot Examples

### renderHeader

```tsx
<StoriesOverlay
  {...props}
  renderHeader={({ author, story, isPaused, close }) => (
    <header className="my-header">
      <img src={author.avatar} />
      <div>
        <strong>{author.name}</strong>
        {isPaused && <span>Paused</span>}
      </div>
      <button onClick={close}>×</button>
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

### Programmatic control via apiRef

```tsx
const apiRef = useRef<StoriesApi>(null);

<StoriesOverlay
  apiRef={apiRef}
  groups={groups}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>;

// Skip an entire group
apiRef.current?.nextGroup();
```

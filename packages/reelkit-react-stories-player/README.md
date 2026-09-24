# @reelkit/react-stories-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-stories-player"><img src="https://img.shields.io/npm/v/@reelkit/react-stories-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-7.5%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-82%25-green" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Instagram-style stories player for React. Full-screen overlay with tap-to-advance navigation, 3D cube transition between users, auto-advance timer, segmented progress bar, and double-tap heart animation. ~7.5 kB gzip.

**[Live Demo](https://react-demo.reelkit.dev/stories-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/react-stories-player @reelkit/react lucide-react
```

`react` and `react-dom` 18 or newer are peers too. The default header and
navigation draw their icons with `lucide-react`.

## Quick Start

```tsx
import { useState } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';

const groups: StoriesGroup[] = [
  {
    author: { id: 'u1', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', mediaType: 'image', src: '/story1.jpg' },
      {
        id: 's2',
        mediaType: 'video',
        src: '/story2.mp4',
        poster: '/poster.jpg',
      },
    ],
  },
  {
    author: { id: 'u2', name: 'Bob', avatar: '/bob.jpg' },
    stories: [{ id: 's3', mediaType: 'image', src: '/story3.jpg' }],
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

  return (
    <>
      <StoriesRingList
        groups={groups}
        onSelect={(i) => {
          setGroupIndex(i);
          setIsOpen(true);
        }}
      />
      <StoriesOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={groupIndex}
      />
    </>
  );
}
```

## Features

- Tap left/right to navigate stories within a group
- Swipe left/right with 3D cube transition between users
- Auto-advance timer with segmented progress bar
- Tap-and-hold to pause (auto-hides UI)
- Double-tap heart animation
- Video stories with autoplay and sound toggle
- Swipe down to close
- Keyboard navigation (Arrow keys, Escape)
- Story ring list with viewed/unviewed gradient
- Sliding window progress bar for 50+ stories
- Render props for header, footer, and slides
- Desktop navigation arrows
- Optional Instagram-style desktop carousel of neighbouring groups
- Remembers what was seen — a viewed-state controller backed by local, session, or memory storage
- Shareable URLs — `StoriesUrlOverlay` opens itself from the address bar, on the right story of the right group

## API Reference

### StoriesOverlay Props

| Prop                      | Type                                   | Default            | Description                                                                                            |
| ------------------------- | -------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| `isOpen`                  | `boolean`                              | required           | Controls overlay visibility                                                                            |
| `onClose`                 | `() => void`                           | required           | Called when overlay closes                                                                             |
| `groups`                  | `StoriesGroup<T>[]`                    | required           | Story groups to display                                                                                |
| `initialGroupIndex`       | `number`                               | `0`                | Starting group index                                                                                   |
| `initialStoryIndex`       | `number`                               | resumed            | Starting story index; left out, the group opens on `resumeStoryIndex(initialGroupIndex)`, else `0`     |
| `groupTransition`         | `TransitionTransformFn`                | cube               | Transition between groups                                                                              |
| `defaultImageDuration`    | `number`                               | `5000`             | Image auto-advance duration (ms)                                                                       |
| `tapZoneSplit`            | `number`                               | `0.3`              | Left zone ratio (0-1)                                                                                  |
| `hideUIOnPause`           | `boolean`                              | `true`             | Hide the progress bar and header while paused by a long press                                          |
| `enableKeyboard`          | `boolean`                              | `true`             | Enable keyboard navigation                                                                             |
| `innerTransitionDuration` | `number`                               | `200`              | Story crossfade duration (ms)                                                                          |
| `minSegmentWidth`         | `number`                               | `8`                | Min progress segment width (px)                                                                        |
| `desktopLayout`           | `'single' \| 'carousel'`               | `'single'`         | `'carousel'`: neighbouring groups as preview cards beside the story on desktop                         |
| `chromePlacement`         | `'overlay' \| 'group'`                 | `'overlay'`        | `'group'`: each group carries its own progress bar and header, turning with it like Instagram          |
| `viewed`                  | `StoriesViewedStateController`         | —                  | From `createStoriesViewedStateController()`: resume, recording and muted card rings for watched groups |
| `resumeStoryIndex`        | `(groupIndex) => number`               | —                  | Where a group opens when nothing was watched this session                                              |
| `ariaLabel`               | `string`                               | `'Stories player'` | Accessible label announced when the overlay opens                                                      |
| `apiRef`                  | `MutableRefObject<StoriesApi \| null>` | —                  | Imperative access to navigation and the timer                                                          |

### Callbacks

| Prop              | Type                               | Description                   |
| ----------------- | ---------------------------------- | ----------------------------- |
| `onStoryChange`   | `(groupIndex, storyIndex) => void` | After story navigation        |
| `onGroupChange`   | `(groupIndex) => void`             | After group switch            |
| `onStoryViewed`   | `(groupIndex, storyIndex) => void` | When a story is viewed        |
| `onStoryComplete` | `(groupIndex, storyIndex) => void` | When a story's timer runs out |
| `onDoubleTap`     | `(groupIndex, storyIndex) => void` | On double-tap (heart)         |
| `onPause`         | `() => void`                       | On tap-and-hold               |
| `onResume`        | `() => void`                       | On release                    |

### Render Props

| Prop                 | Type                                       | Description                          |
| -------------------- | ------------------------------------------ | ------------------------------------ |
| `renderHeader`       | `(props: HeaderRenderProps) => Node`       | Custom header                        |
| `renderFooter`       | `(props: FooterRenderProps) => Node`       | Custom footer                        |
| `renderSlide`        | `(props: SlideRenderProps) => Node`        | Custom slide rendering               |
| `renderGroupPreview` | `(props: GroupPreviewRenderProps) => Node` | Custom desktop carousel card content |
| `renderNavigation`   | `(props: NavigationRenderProps) => Node`   | Custom desktop arrows                |
| `renderProgressBar`  | `(props: ProgressBarRenderProps) => Node`  | Custom segmented progress bar        |
| `renderLoading`      | `(props: LoadingRenderProps) => Node`      | Custom loading indicator             |
| `renderError`        | `(props: ErrorRenderProps) => Node`        | Custom error indicator               |

### StoriesRingList Props

| Prop       | Type                           | Description                                                          |
| ---------- | ------------------------------ | -------------------------------------------------------------------- |
| `groups`   | `StoriesGroup[]`               | Story groups                                                         |
| `viewed`   | `StoriesViewedStateController` | Rings follow it by themselves; the same controller the overlay takes |
| `onSelect` | `(groupIndex: number) => void` | Called when a ring is tapped                                         |
| `ringSize` | `number`                       | Ring diameter (px)                                                   |

### Types

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  aspectRatio?: number; // media width / height
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

## Remembering what was seen

`createStoriesViewedStateController` persists which stories were watched, so the
rings dim and a group reopens where the reader left it:

```tsx
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
} from '@reelkit/react-stories-player';

// The controller reads the groups through a getter, so a growing feed stays
// current: a ref for a plain prop, or a signal.
const groupsRef = useRef(groups);
groupsRef.current = groups;

const [viewed] = useState(() =>
  createStoriesViewedStateController({
    storageKey: 'stories-seen',
    groups: () => groupsRef.current,
  }),
);

<StoriesRingList groups={groups} viewed={viewed} onSelect={openGroup} />
<StoriesOverlay isOpen={open} groups={groups} viewed={viewed} onClose={close} />;
```

It writes to `localStorage` by default; pass a `storage` adapter
(`createSessionStorageAdapter()`, `createMemoryStorageAdapter()`) to keep it per
tab or in memory. `ttlMs` forgets a group some time after it was last watched,
and `maxTracks` caps how many groups are remembered at all.

## URL-driven stories

`StoriesUrlOverlay` takes the same props except `isOpen` — the address bar owns
both axes, so a link names the group and the story inside it:

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

## Sub-components

Exported for composing your own layout: `StoriesRing`, `CanvasProgressBar`,
`StoryHeader`, `HeartAnimation`, `ImageStorySlide`, `VideoStorySlide`, plus
`SoundProvider` and `useSoundState` re-exported from `@reelkit/react`.

## Keyboard Shortcuts

| Key          | Action         |
| ------------ | -------------- |
| `ArrowLeft`  | Previous story |
| `ArrowRight` | Next story     |
| `Escape`     | Close overlay  |

## CSS Classes

| Class                           | Description                               |
| ------------------------------- | ----------------------------------------- |
| `.rk-stories-overlay`           | Overlay background                        |
| `.rk-stories-container`         | Player container                          |
| `.rk-stories-slide-wrapper`     | Slide wrapper                             |
| `.rk-stories-story`             | Single story root                         |
| `.rk-stories-ui-layer`          | UI overlay (header, progress)             |
| `.rk-stories-header`            | Header bar                                |
| `.rk-stories-header-avatar`     | Author avatar                             |
| `.rk-stories-header-name`       | Author name                               |
| `.rk-stories-header-time`       | Timestamp                                 |
| `.rk-stories-header-btn`        | Header action button                      |
| `.rk-stories-header-spinner`    | Loading spinner                           |
| `.rk-stories-nav-btn`           | Desktop navigation arrow                  |
| `.rk-stories-heart`             | Double-tap heart animation                |
| `.rk-stories-error`             | Error state                               |
| `.rk-stories-image`             | Image story element                       |
| `.rk-stories-video`             | Video story container                     |
| `.rk-stories-video-poster`      | Video poster image                        |
| `.rk-stories-video-element`     | Video element                             |
| `.rk-stories-progress-bar`      | Canvas progress bar wrapper               |
| `.rk-stories-ring`              | Story ring                                |
| `.rk-stories-ring--active`      | Ring with stories left to watch           |
| `.rk-stories-ring-avatar`       | Ring avatar image                         |
| `.rk-stories-ring-list`         | Ring list container                       |
| `.rk-stories-ring-list-item`    | Ring list item                            |
| `.rk-stories-ring-list-name`    | Ring author name                          |
| `.rk-stories-swipe-wrapper`     | Swipe-to-close wrapper                    |
| `.rk-stories-overlay--carousel` | Overlay with the desktop carousel showing |
| `.rk-stories-overlay--sliding`  | Carousel slide running                    |
| `.rk-stories-carousel`          | Layer of preview cards                    |
| `.rk-stories-card`              | One preview card (`--center`, `--hidden`) |
| `.rk-stories-card-button`       | Default card content                      |
| `.rk-stories-card-image`        | Card preview frame                        |
| `.rk-stories-card-scrim`        | Card dimming layer                        |
| `.rk-stories-card-info`         | Card ring, name and time                  |
| `.rk-stories-card-name`         | Card author name                          |
| `.rk-stories-card-time`         | Card time-ago text                        |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-stories-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-stories-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/stories-player#theming) for the full token table.

## Documentation

Docs, demos, and customization examples at **[reelkit.dev/docs/stories-player](https://reelkit.dev/docs/stories-player)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

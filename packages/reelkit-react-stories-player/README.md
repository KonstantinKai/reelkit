# @reelkit/react-stories-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-stories-player"><img src="https://img.shields.io/npm/v/@reelkit/react-stories-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-5.6%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-90%25-brightgreen" alt="Coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Instagram-style stories player for React. Full-screen overlay with tap-to-advance navigation, 3D cube transition between users, auto-advance timer, segmented progress bar, and double-tap heart animation. ~5.6 kB gzip.

## Installation

```bash
npm install @reelkit/react-stories-player @reelkit/react
```

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
      { id: 's2', mediaType: 'video', src: '/story2.mp4', poster: '/poster.jpg' },
    ],
  },
  {
    author: { id: 'u2', name: 'Bob', avatar: '/bob.jpg' },
    stories: [
      { id: 's3', mediaType: 'image', src: '/story3.jpg' },
    ],
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

  return (
    <>
      <StoriesRingList
        groups={groups}
        onSelect={(i) => { setGroupIndex(i); setIsOpen(true); }}
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

## API Reference

### StoriesOverlay Props

| Prop                      | Type                              | Default  | Description                      |
| ------------------------- | --------------------------------- | -------- | -------------------------------- |
| `isOpen`                  | `boolean`                         | required | Controls overlay visibility      |
| `onClose`                 | `() => void`                      | required | Called when overlay closes        |
| `groups`                  | `StoriesGroup<T>[]`               | required | Story groups to display          |
| `initialGroupIndex`       | `number`                          | `0`      | Starting group index             |
| `initialStoryIndex`       | `number`                          | `0`      | Starting story index             |
| `groupTransition`         | `TransitionTransformFn`           | cube     | Transition between groups        |
| `defaultImageDuration`    | `number`                          | `5000`   | Image auto-advance duration (ms) |
| `tapZoneSplit`            | `number`                          | `0.3`    | Left zone ratio (0-1)            |
| `hideUIOnPause`           | `boolean`                         | `true`   | Hide header/progress on hold     |
| `enableKeyboard`          | `boolean`                         | `true`   | Enable keyboard navigation       |
| `innerTransitionDuration` | `number`                          | `200`    | Story crossfade duration (ms)    |
| `minSegmentWidth`         | `number`                          | `4`      | Min progress segment width (px)  |

### Callbacks

| Prop              | Type                                          | Description                 |
| ----------------- | --------------------------------------------- | --------------------------- |
| `onStoryChange`   | `(groupIndex, storyIndex) => void`            | After story navigation      |
| `onGroupChange`   | `(groupIndex) => void`                        | After group switch          |
| `onStoryViewed`   | `(groupIndex, storyIndex) => void`            | When a story is viewed      |
| `onDoubleTap`     | `(groupIndex, storyIndex) => void`            | On double-tap (heart)       |
| `onPause`         | `() => void`                                  | On tap-and-hold             |
| `onResume`        | `() => void`                                  | On release                  |

### Render Props

| Prop           | Type                                | Description               |
| -------------- | ----------------------------------- | ------------------------- |
| `renderHeader` | `(props: HeaderRenderProps) => Node` | Custom header             |
| `renderFooter` | `(props: FooterRenderProps) => Node` | Custom footer             |
| `renderSlide`  | `(props: SlideRenderProps) => Node`  | Custom slide rendering    |

### StoriesRingList Props

| Prop         | Type                           | Description                  |
| ------------ | ------------------------------ | ---------------------------- |
| `groups`     | `StoriesGroup[]`               | Story groups                 |
| `viewedState`| `Map<string, number>`          | author.id → viewed count     |
| `onSelect`   | `(groupIndex: number) => void` | Called when a ring is tapped |
| `ringSize`   | `number`                       | Ring diameter (px)           |

### Types

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
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

## Keyboard Shortcuts

| Key          | Action           |
| ------------ | ---------------- |
| `ArrowLeft`  | Previous story   |
| `ArrowRight` | Next story       |
| `Escape`     | Close overlay    |

## CSS Classes

| Class                        | Description                |
| ---------------------------- | -------------------------- |
| `.rk-stories-overlay`        | Overlay background         |
| `.rk-stories-container`      | Player container           |
| `.rk-stories-slide-wrapper`  | Slide wrapper              |
| `.rk-stories-ui-layer`       | UI overlay (header, progress) |
| `.rk-stories-header`         | Header bar                 |
| `.rk-stories-header-avatar`  | Author avatar              |
| `.rk-stories-header-name`    | Author name                |
| `.rk-stories-header-time`    | Timestamp                  |
| `.rk-stories-header-btn`     | Header action button       |
| `.rk-stories-header-spinner` | Loading spinner            |
| `.rk-stories-nav-btn`        | Desktop navigation arrow   |
| `.rk-stories-heart`          | Double-tap heart animation |
| `.rk-stories-error`          | Error state                |
| `.rk-stories-video-element`  | Video element              |
| `.rk-stories-ring`           | Story ring                 |
| `.rk-stories-ring--active`   | Ring with unviewed stories |
| `.rk-stories-ring-avatar`    | Ring avatar image          |
| `.rk-stories-ring-list`      | Ring list container        |
| `.rk-stories-ring-list-item` | Ring list item             |
| `.rk-stories-ring-list-name` | Ring author name           |
| `.rk-stories-swipe-wrapper`  | Swipe-to-close wrapper     |

## Documentation

Docs, demos, and customization examples at **[reelkit.dev/docs/stories-player](https://reelkit.dev/docs/stories-player)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

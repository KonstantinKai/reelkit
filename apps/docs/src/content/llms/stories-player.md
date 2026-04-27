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
import { StoriesPlayerOverlay } from '@reelkit/react-stories-player';
import type { StoriesGroup, StoryItem } from '@reelkit/stories-core';
import '@reelkit/react-stories-player/styles.css';
```

## Quick Start

```tsx
import { useState } from 'react';
import { StoriesPlayerOverlay } from '@reelkit/react-stories-player';
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

      <StoriesPlayerOverlay
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

## StoriesPlayerOverlay Props

| Prop                      | Type                                   | Default            | Description                                            |
| ------------------------- | -------------------------------------- | ------------------ | ------------------------------------------------------ |
| `isOpen`                  | `boolean`                              | required           | Overlay visibility. True = body scroll locked.         |
| `groups`                  | `StoriesGroup<T>[]`                    | required           | Story groups to display                                |
| `onClose`                 | `() => void`                           | required           | Close overlay callback                                 |
| `ariaLabel`               | `string`                               | `'Stories player'` | Dialog region accessible label                         |
| `initialGroupIndex`       | `number`                               | `0`                | Zero-based initial group index                         |
| `initialStoryIndex`       | `number`                               | `0`                | Zero-based initial story index in group                |
| `groupTransition`         | `TransitionTransformFn`                | `cubeTransition`   | Outer (group) slider transition                        |
| `defaultImageDuration`    | `number`                               | `5000`             | Default image auto-advance duration (ms)               |
| `tapZoneSplit`            | `number`                               | `0.3`              | Tap zone split ratio (0–1). Left = prev, right = next. |
| `hideUIOnPause`           | `boolean`                              | `true`             | Hide story UI (header, footer) on long-press pause     |
| `enableKeyboard`          | `boolean`                              | `true`             | Enable keyboard nav (arrows, Escape)                   |
| `innerTransitionDuration` | `number`                               | `200`              | Inner (story) transition duration (ms)                 |
| `minSegmentWidth`         | `number`                               | `8`                | Min progress bar segment width (px)                    |
| `apiRef`                  | `MutableRefObject<StoriesApi \| null>` | -                  | Ref for imperative StoriesApi                          |

### Slot renderers

| Prop                | Type                                              | Description                                              |
| ------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `renderHeader`      | `(props: HeaderRenderProps<T>) => ReactNode`      | Custom header. Gets author, story, pause/mute state.     |
| `renderFooter`      | `(props: FooterRenderProps<T>) => ReactNode`      | Custom footer. Gets author + story info.                 |
| `renderSlide`       | `(props: SlideRenderProps<T>) => ReactNode`       | Custom slide. Replaces default image/video slides.       |
| `renderNavigation`  | `(props: NavigationRenderProps) => ReactNode`     | Custom desktop nav. Replaces default prev/next chevrons. |
| `renderProgressBar` | `(props: ProgressBarRenderProps<T>) => ReactNode` | Custom progress bar. Replaces default canvas bar.        |
| `renderLoading`     | `(props: LoadingRenderProps<T>) => ReactNode`     | Custom loading UI. Default = header spinner.             |
| `renderError`       | `(props: ErrorRenderProps<T>) => ReactNode`       | Custom error UI. Default = error icon overlay.           |

## Callbacks

| Prop              | Type                               | Description          |
| ----------------- | ---------------------------------- | -------------------- |
| `onClose`         | `() => void`                       | Overlay should close |
| `onStoryChange`   | `(groupIndex, storyIndex) => void` | Active story changed |
| `onGroupChange`   | `(groupIndex) => void`             | Active group changed |
| `onStoryViewed`   | `(groupIndex, storyIndex) => void` | Story became visible |
| `onStoryComplete` | `(groupIndex, storyIndex) => void` | Story timer done     |
| `onDoubleTap`     | `(groupIndex, storyIndex) => void` | Double-tap gesture   |
| `onPause`         | `() => void`                       | Player paused        |
| `onResume`        | `() => void`                       | Player resumed       |

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

## Keyboard Shortcuts

| Key          | Action         |
| ------------ | -------------- |
| `ArrowLeft`  | Previous story |
| `ArrowRight` | Next story     |
| `Escape`     | Close player   |
| `Space`      | Pause / resume |

## Tap Zones (mobile)

- Left 30% → prev story
- Right 70% → next story
- Long press → pause (UI hidden if `hideUIOnPause`)
- Release long press → resume
- Double-tap → fires `onDoubleTap`

## CSS Theming Tokens

Common tokens (full list at `/docs/stories-player`):

| Token                         | Default                                         | Controls                    |
| ----------------------------- | ----------------------------------------------- | --------------------------- |
| `--rk-stories-overlay-bg`     | `#000`                                          | Full-screen backdrop color  |
| `--rk-stories-overlay-z`      | `9999`                                          | Overlay z-index             |
| `--rk-stories-progress-track` | `rgba(255, 255, 255, 0.3)`                      | Progress segment background |
| `--rk-stories-progress-fill`  | `#fff`                                          | Active progress fill color  |
| `--rk-stories-header-bg`      | `linear-gradient(rgba(0,0,0,0.4), transparent)` | Header gradient scrim       |
| `--rk-stories-button-bg`      | `rgba(0, 0, 0, 0.5)`                            | Button background           |
| `--rk-stories-button-fg`      | `#fff`                                          | Button icon color           |

## CSS Classes

- `.rk-stories-overlay` — root full-screen container
- `.rk-stories-progress` — top progress bar canvas wrapper
- `.rk-stories-header` — author + close header
- `.rk-stories-author` — author row (avatar + name)
- `.rk-stories-footer` — bottom interaction footer
- `.rk-stories-slide` — story slide wrapper
- `.rk-stories-tap-prev`, `.rk-stories-tap-next` — invisible tap zones
- `.rk-stories-nav-prev`, `.rk-stories-nav-next` — desktop nav arrows

## Custom Slot Examples

### renderHeader

```tsx
<StoriesPlayerOverlay
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
<StoriesPlayerOverlay
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

<StoriesPlayerOverlay
  apiRef={apiRef}
  groups={groups}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>;

// Skip an entire group
apiRef.current?.nextGroup();
```

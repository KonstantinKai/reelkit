# @reelkit/stories-core

<p>
  <a href="https://www.npmjs.com/package/@reelkit/stories-core"><img src="https://img.shields.io/npm/v/@reelkit/stories-core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/stories--core%20gzip-2.0%20kB-6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Framework-agnostic stories state machine for ReelKit. Story and group navigation (tap to advance within a group, swipe to switch between users), auto-advance timer with pause/resume, tap zone detection, and segmented progress bar with sliding window for 50+ stories. ~1.7 kB gzip.

## Installation

```bash
npm install @reelkit/stories-core @reelkit/core
```

## Quick Start

```ts
import {
  createStoriesController,
  getTapAction,
  getSegments,
} from '@reelkit/stories-core';

const controller = createStoriesController({
  groupCount: 5,
  storyCounts: [3, 4, 2, 5, 3],
});

// Navigate stories
controller.nextStory();
controller.prevStory();

// Switch between users
controller.nextGroup();
controller.prevGroup();

// Read state via signals
console.log(controller.state.activeGroupIndex.value); // 0
console.log(controller.state.activeStoryIndex.value); // 1

// Tap zone detection
getTapAction(50, 400); // 'prev' (left 30%)
getTapAction(300, 400); // 'next' (right 70%)

// Progress bar segments
const segments = getSegments(5, 2, 0.6);
// [completed, completed, active(60%), upcoming, upcoming]
```

## Features

- Stories controller with story and group navigation and boundary detection
- Timer controller with `requestAnimationFrame` progress and pause/resume
- Tap zone calculator (configurable left/right split ratio)
- Segmented progress bar with sliding window overflow
- Zero dependencies beyond `@reelkit/core`
- Pure functions, fully tree-shakeable

## API Reference

### createStoriesController

| Config                 | Type       | Default  | Description               |
| ---------------------- | ---------- | -------- | ------------------------- |
| `groupCount`           | `number`   | required | Number of story groups    |
| `storyCounts`          | `number[]` | required | Stories per group         |
| `initialGroupIndex`    | `number`   | `0`      | Starting group index      |
| `initialStoryIndex`    | `number`   | `0`      | Starting story index      |
| `defaultImageDuration` | `number`   | `5000`   | Default auto-advance (ms) |
| `tapZoneSplit`         | `number`   | `0.3`    | Left zone ratio (0-1)     |

### StoriesController

| Method / Property        | Type              | Description                   |
| ------------------------ | ----------------- | ----------------------------- |
| `state.activeGroupIndex` | `Signal<number>`  | Current group index           |
| `state.activeStoryIndex` | `Signal<number>`  | Current story index           |
| `state.isPaused`         | `Signal<boolean>` | Paused state                  |
| `nextStory()`            | `void`            | Advance to next story         |
| `prevStory()`            | `void`            | Go to previous story          |
| `nextGroup()`            | `void`            | Switch to next user group     |
| `prevGroup()`            | `void`            | Switch to previous user group |
| `goToGroup(index)`       | `void`            | Jump to specific group        |
| `pause()`                | `void`            | Pause timer and auto-advance  |
| `resume()`               | `void`            | Resume timer                  |
| `dispose()`              | `void`            | Clean up subscriptions        |

### Events

| Event           | Type                               | Description                           |
| --------------- | ---------------------------------- | ------------------------------------- |
| `onStoryChange` | `(groupIndex, storyIndex) => void` | Fired after story navigation          |
| `onGroupChange` | `(groupIndex) => void`             | Fired after group switch              |
| `onStoryViewed` | `(groupIndex, storyIndex) => void` | Fired when a story is viewed          |
| `onComplete`    | `() => void`                       | Last story of last group finished     |
| `onClose`       | `() => void`                       | Close requested (boundary navigation) |

### getTapAction

```ts
function getTapAction(
  tapX: number,
  containerWidth: number,
  splitRatio?: number, // default: 0.3
): 'prev' | 'next';
```

### getSegments

```ts
function getSegments(
  totalStories: number,
  activeIndex: number,
  timerProgress: number, // 0-1
): SegmentState[];
```

### getVisibleWindow

```ts
function getVisibleWindow(
  totalStories: number,
  activeIndex: number,
  timerProgress: number,
  containerWidth: number,
  minSegmentWidth?: number, // default: 4
  gap?: number,
): VisibleWindow;
```

## Types

```ts
type TapAction = 'prev' | 'next';

type SegmentStatus = 'completed' | 'active' | 'upcoming';

interface SegmentState {
  status: SegmentStatus;
  fillPercentage: number; // 0-100
}

interface VisibleWindow {
  startIndex: number;
  endIndex: number;
  segments: SegmentState[];
}
```

## Documentation

API reference and guides at **[reelkit.dev](https://reelkit.dev)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

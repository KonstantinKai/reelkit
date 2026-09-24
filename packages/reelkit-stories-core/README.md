# @reelkit/stories-core

<p>
  <a href="https://www.npmjs.com/package/@reelkit/stories-core"><img src="https://img.shields.io/npm/v/@reelkit/stories-core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-3.3%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-97%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Framework-agnostic stories state machine for ReelKit. Story and group navigation (tap to advance within a group, swipe to switch between users), auto-advance timer with pause/resume, tap zone detection, and segmented progress bar with sliding window for 50+ stories. ~3.3 kB gzip.

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
- Canvas progress renderer — one element for a group of any length
- Viewed-state controller with resume, expiry and a cap on what is remembered
- Zero dependencies beyond `@reelkit/core`
- Pure functions, fully tree-shakeable

## API Reference

### createStoriesController

| Config                 | Type                     | Default  | Description                                      |
| ---------------------- | ------------------------ | -------- | ------------------------------------------------ |
| `groupCount`           | `number`                 | required | Number of story groups                           |
| `storyCounts`          | `number[]`               | required | Stories per group                                |
| `initialGroupIndex`    | `number`                 | `0`      | Starting group index                             |
| `initialStoryIndex`    | `number`                 | `0`      | Starting story index                             |
| `defaultImageDuration` | `number`                 | `5000`   | Default auto-advance (ms)                        |
| `resumeStoryIndex`     | `(groupIndex) => number` | —        | Where a group opens when nothing was watched yet |

### StoriesController

| Method / Property                           | Type              | Description                                                                |
| ------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `state.activeGroupIndex`                    | `Signal<number>`  | Current group index                                                        |
| `state.activeStoryIndex`                    | `Signal<number>`  | Current story index                                                        |
| `state.isPaused`                            | `Signal<boolean>` | Paused state                                                               |
| `nextStory()`                               | `void`            | Advance to next story                                                      |
| `prevStory()`                               | `void`            | Go to previous story                                                       |
| `nextGroup()`                               | `void`            | Switch to next group, opening it where `getLastStoryIndex` says            |
| `prevGroup()`                               | `void`            | Switch to previous group, opening it where `getLastStoryIndex` says        |
| `goToGroup(index)`                          | `void`            | Jump to specific group                                                     |
| `getLastStoryIndex(groupIndex)`             | `number`          | Where a group opens: the story left this session, else `resumeStoryIndex`  |
| `reportInitialView()`                       | `void`            | Report the opening story as viewed, once; call after mounting              |
| `updateConfig({ groupCount, storyCounts })` | `void`            | Replace the counts when the feed changes while open; fires no event        |
| `pause()`                                   | `void`            | Pause timer and auto-advance                                               |
| `resume()`                                  | `void`            | Resume timer                                                               |
| `onStoryTimerComplete()`                    | `void`            | Call when the story timer finishes; fires `onStoryComplete`, then advances |

### Events

| Event           | Type                               | Description                           |
| --------------- | ---------------------------------- | ------------------------------------- |
| `onStoryChange` | `(groupIndex, storyIndex) => void` | Fired after story navigation          |
| `onGroupChange` | `(groupIndex) => void`             | Fired after group switch              |
| `onStoryViewed` | `(groupIndex, storyIndex) => void` | Fired when a story is viewed          |
| `onComplete`    | `() => void`                       | Last story of last group finished     |
| `onClose`       | `() => void`                       | Close requested (boundary navigation) |

### createTimerController

Drives auto-advance: a requestAnimationFrame timer whose progress is a signal, so
a progress bar can follow it without a re-render per frame.

```ts
function createTimerController(config: {
  duration: number;
  onComplete?: () => void;
}): {
  readonly progress: Signal<number>; // 0-1
  readonly isRunning: Signal<boolean>;
  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  dispose: () => void;
};
```

### createCanvasProgressRenderer

Draws the segmented progress bar onto a canvas, so a 200-story group costs one
element instead of 200.

```ts
function createCanvasProgressRenderer(config?: {
  gap?: number;
  barHeight?: number;
  minSegmentWidth?: number;
  bgColor?: string;
  fillColor?: string;
}): {
  readonly width: number;
  attach: (canvas: HTMLCanvasElement) => void;
  draw: (totalStories: number, activeIndex: number, progress: number) => void;
  dispose: () => void;
};
```

### createStoriesViewedStateController

Remembers which stories were watched, so rings dim and a group reopens where the
reader left it. Storage-agnostic — `localStorage` by default.

```ts
function createStoriesViewedStateController(config: {
  storageKey: string; // for example 'stories-seen'
  groups: () => StoriesGroup[]; // getter, called whenever the counts are needed
  storage?: StorageAdapter; // default: localStorage
  key?: UrlKey; // how a position is spelled in storage
  ttlMs?: number; // forget a group this long after it was last recorded
  maxTracks?: number; // cap how many groups stay remembered
}): StoriesViewedStateController;
```

Pass the returned controller to the player and to the ring list — both follow it
by themselves.

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

Guide and API reference at **[reelkit.dev/docs/stories-core](https://reelkit.dev/docs/stories-core)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

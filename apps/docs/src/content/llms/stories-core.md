---
title: Stories Core
url: https://reelkit.dev/docs/stories-core
section: Core
order: 3
desc: Engine behind @reelkit/react-stories-player. Pure TypeScript, no framework deps. Use to build stories players for Angular, Vue, or vanilla JS.
---

# Stories Core

Engine behind `@reelkit/react-stories-player`. Pure TypeScript, zero framework deps. Use to build stories players for Angular, Vue, vanilla JS.

## Features

- Framework-Agnostic — pure TypeScript, zero DOM framework deps
- Two-Level Navigation — groups + stories within each group
- RAF Timer — `requestAnimationFrame` auto-advance with pause/resume
- Canvas Progress — Retina-ready segmented progress bar with sliding window
- Tap Zones — configurable left/right tap detection
- Reactive Signals — built on `@reelkit/core` signal primitives

## Installation

```bash
npm i @reelkit/stories-core
```

## Stories Controller

`createStoriesController(config, events?)` manage navigation across groups + stories. Track pause/resume, remember last viewed story per group, fire callbacks on each transition.

### Config (StoriesControllerConfig)

| Property               | Type       | Default  | Description                                           |
| ---------------------- | ---------- | -------- | ----------------------------------------------------- |
| `groupCount`           | `number`   | required | Total number of story groups                          |
| `storyCounts`          | `number[]` | required | Number of stories in each group                       |
| `initialGroupIndex`    | `number`   | `0`      | Initial group index                                   |
| `initialStoryIndex`    | `number`   | `0`      | Initial story index within group                      |
| `defaultImageDuration` | `number`   | `5000`   | Default auto-advance duration for image stories in ms |

### Events (StoriesControllerEvents)

| Event             | Type                               | Description                                           |
| ----------------- | ---------------------------------- | ----------------------------------------------------- |
| `onStoryChange`   | `(groupIndex, storyIndex) => void` | Fired when active story changes                       |
| `onGroupChange`   | `(groupIndex) => void`             | Fired when active group changes                       |
| `onStoryViewed`   | `(groupIndex, storyIndex) => void` | Fired when story becomes visible                      |
| `onStoryComplete` | `(groupIndex, storyIndex) => void` | Fired when story's timer completes (before advancing) |
| `onComplete`      | `() => void`                       | Fired when last story of last group finishes          |
| `onClose`         | `() => void`                       | Fired when overlay should close                       |

### State (reactive signals)

| Signal                   | Type              | Description                               |
| ------------------------ | ----------------- | ----------------------------------------- |
| `state.activeGroupIndex` | `Signal<number>`  | Currently active group index              |
| `state.activeStoryIndex` | `Signal<number>`  | Currently active story index within group |
| `state.isPaused`         | `Signal<boolean>` | Whether auto-advance is paused            |

### Methods

| Method                          | Type                 | Description                                                     |
| ------------------------------- | -------------------- | --------------------------------------------------------------- |
| `nextStory()`                   | `() => void`         | Advance within group; crosses boundary to next group            |
| `prevStory()`                   | `() => void`         | Go back within group; crosses boundary to prev group            |
| `nextGroup()`                   | `() => void`         | Switch to next group, resuming at last viewed story             |
| `prevGroup()`                   | `() => void`         | Switch to previous group, resuming at last viewed story         |
| `goToGroup(index)`              | `(number) => void`   | Jump to specific group by index                                 |
| `pause()`                       | `() => void`         | Pause auto-advance                                              |
| `resume()`                      | `() => void`         | Resume auto-advance                                             |
| `onStoryTimerComplete()`        | `() => void`         | Called when timer finishes; fires onStoryComplete then advances |
| `getLastStoryIndex(groupIndex)` | `(number) => number` | Last viewed story index for group (0 if never visited)          |
| `dispose()`                     | `() => void`         | Clean up resources                                              |

### Example

```typescript
import {
  createStoriesController,
  createTimerController,
} from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const groups = [{ stories: ['s1', 's2', 's3'] }, { stories: ['s4', 's5'] }];

const controller = createStoriesController(
  {
    groupCount: groups.length,
    storyCounts: groups.map((g) => g.stories.length),
    defaultImageDuration: 5000,
  },
  {
    onStoryChange(groupIndex, storyIndex) {
      console.log('Story changed:', groupIndex, storyIndex);
    },
    onComplete() {
      console.log('All stories viewed');
    },
    onClose() {
      console.log('Overlay closed');
    },
  },
);

// Wire up a timer for auto-advance
const timer = createTimerController({
  duration: 5000,
  onComplete: () => controller.onStoryTimerComplete(),
});

// React to story changes and restart the timer
const dispose = reaction(
  () => [controller.state.activeGroupIndex, controller.state.activeStoryIndex],
  () => timer.start(),
);

// Start playback
timer.start();

// Navigation
controller.nextStory();
controller.pause();
controller.resume();

// Cleanup
dispose();
timer.dispose();
controller.dispose();
```

## Timer Controller

`createTimerController(config)` drive auto-advance with `requestAnimationFrame` loop. Progress signal (0 to 1) feed progress bar. Pause + resume preserve exact position.

### Config (TimerControllerConfig)

| Property     | Type         | Default     | Description                      |
| ------------ | ------------ | ----------- | -------------------------------- |
| `duration`   | `number`     | required    | Default duration in milliseconds |
| `onComplete` | `() => void` | `undefined` | Called when timer reaches 100%   |

### State

| Signal      | Type              | Description                        |
| ----------- | ----------------- | ---------------------------------- |
| `progress`  | `Signal<number>`  | Progress signal (0 to 1)           |
| `isRunning` | `Signal<boolean>` | Whether timer is currently running |

### Methods

| Method             | Type                | Description                                              |
| ------------------ | ------------------- | -------------------------------------------------------- |
| `start(duration?)` | `(number?) => void` | Start (or restart) timer with optional duration override |
| `pause()`          | `() => void`        | Freeze progress at current position                      |
| `resume()`         | `() => void`        | Continue from frozen position                            |
| `reset()`          | `() => void`        | Reset progress to 0 and stop                             |
| `dispose()`        | `() => void`        | Clean up resources                                       |

### Example

```typescript
import { createTimerController } from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const timer = createTimerController({
  duration: 5000,
  onComplete: () => console.log('Timer finished!'),
});

// Observe progress (0 to 1)
const dispose = reaction(
  () => [timer.progress],
  () => {
    console.log('Progress:', timer.progress.value);
  },
);

// Start with default duration
timer.start();

// Or override duration for a specific story
timer.start(8000);

// Pause/resume preserves exact position
timer.pause();
timer.resume();

// Reset to 0
timer.reset();

// Cleanup
dispose();
timer.dispose();
```

## Canvas Progress Renderer

`createCanvasProgressRenderer(config?)` draw segmented progress bars on canvas. Scale for Retina displays, measure container via ResizeObserver, use sliding window when segments don't fit.

### Config (CanvasProgressRendererConfig)

| Property          | Type     | Default                   | Description                                          |
| ----------------- | -------- | ------------------------- | ---------------------------------------------------- |
| `gap`             | `number` | `2`                       | Gap in pixels between segments                       |
| `barHeight`       | `number` | `2`                       | Bar height in pixels                                 |
| `minSegmentWidth` | `number` | `8`                       | Minimum segment width before sliding window kicks in |
| `bgColor`         | `string` | `'rgba(255,255,255,0.3)'` | Background color of unfilled segments                |
| `fillColor`       | `string` | `'#ffffff'`               | Fill color of completed/active segments              |

### Methods

| Member                                      | Type                               | Description                                               |
| ------------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `attach(canvas)`                            | `(HTMLCanvasElement) => void`      | Attach to canvas element; starts ResizeObserver on parent |
| `draw(totalStories, activeIndex, progress)` | `(number, number, number) => void` | Draw progress bar for given state                         |
| `width`                                     | `number (readonly)`                | Current measured width in CSS pixels                      |
| `dispose()`                                 | `() => void`                       | Clean up ResizeObserver and internal state                |

### Example

```typescript
import { createCanvasProgressRenderer } from '@reelkit/stories-core';

const renderer = createCanvasProgressRenderer({
  gap: 2,
  barHeight: 2,
  fillColor: '#ffffff',
  bgColor: 'rgba(255, 255, 255, 0.3)',
});

// Attach to a canvas element
const canvas = document.querySelector('canvas')!;
renderer.attach(canvas);

// Draw on each animation frame
let frameId: number;

function loop() {
  const totalStories = 5;
  const activeIndex = 2;
  const progress = timer.progress.value; // 0-1

  renderer.draw(totalStories, activeIndex, progress);
  frameId = requestAnimationFrame(loop);
}

frameId = requestAnimationFrame(loop);

// Cleanup
cancelAnimationFrame(frameId);
renderer.dispose();
```

## Utility Functions

Pure functions for tap zone detection + progress bar math.

| Function                                                                                        | Type                                            | Description                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `getTapAction(tapX, containerWidth, splitRatio?)`                                               | `(number, number, number?) => 'prev' \| 'next'` | Determines whether tap triggers 'prev' or 'next' based on position. Default splitRatio is 0.3. |
| `getSegments(totalStories, activeIndex, progress)`                                              | `(number, number, number) => SegmentState[]`    | Computes status and fill percentage of each segment in progress bar                            |
| `getVisibleWindow(totalStories, activeIndex, progress, containerWidth, minSegmentWidth?, gap?)` | `(...) => VisibleWindow`                        | Computes visible sliding window of segments when total count exceeds container capacity        |

## Types

All type definitions exported from `@reelkit/stories-core`.

```typescript
type MediaType = 'image' | 'video';

interface StoryItem {
  id: string;
  mediaType: MediaType;
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

type TapAction = 'prev' | 'next';
```

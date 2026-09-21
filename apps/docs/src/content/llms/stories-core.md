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

`createStoriesController(config, events?)` return `StoriesController`: manage navigation across groups + stories. Track pause/resume, remember last viewed story per group, fire callbacks on each transition.

### Config (StoriesControllerConfig)

| Property               | Type                             | Default                                         | Description                                                                                                                             |
| ---------------------- | -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `groupCount`           | `number`                         | required                                        | Total number of story groups                                                                                                            |
| `storyCounts`          | `number[]`                       | required                                        | Number of stories in each group                                                                                                         |
| `initialGroupIndex`    | `number`                         | `0`                                             | Initial group index                                                                                                                     |
| `initialStoryIndex`    | `number`                         | `resumeStoryIndex(initialGroupIndex)`, else `0` | Initial story index within group. Naming one wins over anything remembered; leave it out and the opening group resumes like every other |
| `defaultImageDuration` | `number`                         | `5000`                                          | Default auto-advance duration for image stories in ms                                                                                   |
| `resumeStoryIndex`     | `(groupIndex: number) => number` | —                                               | Story an unvisited group opens on; bounded to a story the group has                                                                     |

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

| Method                                      | Type                 | Description                                                                                                                                                                                                                  |
| ------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nextStory()`                               | `() => void`         | Advance within group; crosses boundary to next group                                                                                                                                                                         |
| `prevStory()`                               | `() => void`         | Go back within group; crosses boundary to prev group                                                                                                                                                                         |
| `nextGroup()`                               | `() => void`         | Switch to next group, resuming at last viewed story                                                                                                                                                                          |
| `prevGroup()`                               | `() => void`         | Switch to previous group, resuming at last viewed story                                                                                                                                                                      |
| `goToGroup(index)`                          | `(number) => void`   | Jump to specific group by index                                                                                                                                                                                              |
| `pause()`                                   | `() => void`         | Pause auto-advance                                                                                                                                                                                                           |
| `resume()`                                  | `() => void`         | Resume auto-advance                                                                                                                                                                                                          |
| `onStoryTimerComplete()`                    | `() => void`         | Called when timer finishes; fires onStoryComplete then advances                                                                                                                                                              |
| `getLastStoryIndex(groupIndex)`             | `(number) => number` | Where a group opens: the story left on this session, else `resumeStoryIndex`                                                                                                                                                 |
| `reportInitialView()`                       | `() => void`         | Reports the story the player opened on as viewed, once. Call after mounting, not while rendering                                                                                                                             |
| `updateConfig({ groupCount, storyCounts })` | `(config) => void`   | Replaces the group and story counts when the feed changes while the player is open, so groups paged in later can be reached. Fires no event, keeps where each group was left, pulls positions back inside a feed that shrank |

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

## Viewed Controller

`createStoriesViewedStateController(config)` is everything a feed needs to remember what was seen, from one call: ring counts, where each group resumes, and the recorder, over storage that survives a reload. It imports no framework, so React, Vue and Angular use it the same way: create it once where the feed lives and hand it to the ring list and the player (`viewed={viewed}`), which attach it and follow it themselves. It composes core's `createViewedStateController` + `urlStableIdTwoAxisKey` + `twoAxisViewedTracking`; use those directly when this does not fit. An entry names the furthest story reached, not a tally of views: a group's place survives the feed being reordered, while removing a story from the middle of a group shortens its count and lights its ring again.

### Config (StoriesViewedStateControllerConfig)

| Property     | Type                          | Default      | Description                                                                                                                                    |
| ------------ | ----------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `storageKey` | `string`                      | required     | Storage key the entries are written under                                                                                                      |
| `groups`     | `() => StoriesGroup<T>[]`     | required     | Reads the current groups. A getter, called every time. Keep it current: a getter stuck on the first array miscounts every group loaded later   |
| `key`        | `UrlKey<Id, TwoAxisPosition>` | stable ids   | How a position is spelled in storage (`<author.id>.<story.id>` by default). Pass the URL controller's key so an entry reads like a shared link |
| `storage`    | `StorageAdapter`              | localStorage | Where the entries are kept; a custom adapter is also how a seen store of your own plugs in                                                     |
| `ttlMs`      | `number`                      | never        | How long a group's entry stays remembered after it was last recorded; each group expires on its own clock                                      |
| `maxTracks`  | `number`                      | all kept     | How many groups to keep; past it, the group recorded longest ago is dropped on the next write                                                  |

`storageKey`, `key` and `storage` are read once, at creation. To switch storage, create another controller (React: remount the owner with a `key`).

### StoriesViewedStateController

| Member                               | Type                                     | Description                                                                                                                                     |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewedState`                        | `Subscribable<Map<string, number>>`      | Stories seen per author id, as a signal. Empty before `attach()`                                                                                |
| `controller`                         | `ViewedStateController<TwoAxisPosition>` | The store underneath                                                                                                                            |
| `resumeStoryIndex(groupIndex)`       | `(number) => number`                     | First unseen story, or `0` once the group has been watched to the end                                                                           |
| `markViewed(groupIndex, storyIndex)` | `(number, number) => void`               | Records a story as seen; the player calls it for every story shown                                                                              |
| `forget()`                           | `() => void`                             | Forgets everything seen, here and in storage                                                                                                    |
| `attach()`                           | `() => Dispose`                          | Reads storage and follows other tabs. Counted: several components can attach and unmount in any order. The player components call it themselves |

Nothing is read before `attach()`, so server render and hydration agree. A player mounted only at the moment it opens chooses its opening story before its own effects run; call `viewed.attach()` yourself in that case.

```ts
import { createStoriesViewedStateController } from '@reelkit/stories-core';

const viewed = createStoriesViewedStateController({
  storageKey: 'stories-seen',
  groups: () => groups,
});

const detach = viewed.attach(); // the player components do this themselves

viewed.viewedState.value; // Map { 'user_42' => 2 }, and a signal to follow
viewed.resumeStoryIndex(0); // 2 — the first story not yet seen
viewed.markViewed(0, 2); // furthest point wins; a rewatch never rewinds
viewed.forget();

detach();
```

## Utility Functions

Pure functions for tap zone detection + progress bar math.

| Function                                                                                        | Type                                            | Description                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `getTapAction(tapX, containerWidth, splitRatio?)`                                               | `(number, number, number?) => 'prev' \| 'next'` | Determines whether tap triggers 'prev' or 'next' based on position. Default splitRatio is 0.3. |
| `getSegments(totalStories, activeIndex, progress)`                                              | `(number, number, number) => SegmentState[]`    | Computes status and fill percentage of each segment in progress bar                            |
| `getVisibleWindow(totalStories, activeIndex, progress, containerWidth, minSegmentWidth?, gap?)` | `(...) => VisibleWindow`                        | Computes visible sliding window of segments when total count exceeds container capacity        |

## Layout Helpers

Pure functions shared by every binding's player — React, Vue, Angular size + lay out identically. Apps need them only when building own player.

Sizing:

| Function                       | Type                     | Notes                                                                                                                                             |
| ------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getStoriesSize()`             | `() => [number, number]` | phone fills screen; desktop fills window height −2×16px at 9:16, narrows when canvas + both arrows would not fit. No window → `[0, 0]` (SSR safe) |
| `isMobileWidth(viewportWidth)` | `(number) => boolean`    | ≤768 = phone, matches stylesheet                                                                                                                  |
| `parseDurationMs(value)`       | `(string) => number`     | longest time in computed `transition-duration` list, ms; non-time → 0                                                                             |

Desktop carousel geometry (offset relative to active group: negative left, positive right, 0 = active story):

| Function                                       | Type                                         | Notes                                                                                                          |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `getCardSize(activeSize)`                      | `([number, number]) => [number, number]`     | 0.4 of active height, 9:16                                                                                     |
| `getCarouselSlot(offset, activeSize)`          | `(number, [number, number]) => CarouselSlot` | `{ x, width, height }` relative window center; first card clears arrow, each further one adds card width + gap |
| `getCardOffsets(activeGroupIndex, groupCount)` | `(number, number) => number[]`               | offsets drawn at rest, ≤2 per side, active excluded                                                            |
| `isCardShown(offset)`                          | `(number) => boolean`                        | drawn vs faded                                                                                                 |
| `getSlotOffset(offset)`                        | `(number) => number`                         | clamped one place past shown → card slides in from beside last visible                                         |
| `getSlideGroupIndexes(from, to, groupCount)`   | `(number, number, number) => number[]`       | cards around both ends of a slide, group order; groups passed over left out                                    |

Presentation:

| Function                       | Type                                            | Notes                                                                                                                                                                                                                       |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getRingPresentation(options)` | `(RingPresentationOptions) => RingPresentation` | `{ avatarSize, className, style }` from `totalStories`, `viewedCount`, `size`; unviewed → rotating conic gradient, fully viewed → flat `viewedColor`, empty group → none. Sizes carry `px`, so style works in any framework |
| `formatTimeAgo(date)`          | `(string \| Date) => string`                    | `now`, `5m`, `3h`, `2d`, `2w`                                                                                                                                                                                               |

Types exported alongside: `CarouselSlot`, `RingPresentation`, `RingPresentationOptions`.

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

interface CarouselSlot {
  x: number;
  width: number;
  height: number;
}

interface RingPresentationOptions {
  totalStories: number;
  viewedCount: number;
  size: number; // px
  gradientColors?: string[];
  viewedColor?: string;
}

interface RingPresentation {
  avatarSize: number;
  className: string;
  style: Record<string, string>;
}
```

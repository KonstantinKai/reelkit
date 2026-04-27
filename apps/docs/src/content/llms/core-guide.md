---
title: Core Guide
url: https://reelkit.dev/docs/core/guide
section: Core
order: 1
desc: The @reelkit/core package provides framework-agnostic slider logic. Use it to build custom integrations or understand the underlying architecture.
---

# Core Guide

`@reelkit/core` = framework-agnostic slider logic. Build custom integrations or understand architecture.

## Architecture Overview

Core use **controller pattern** with factory functions. No classes — all plain objects from closures. Zero deps. Core coordinates:

- **SliderController** — central state + navigation
- **GestureController** — touch/pointer drag
- **KeyboardController** — arrow keys + Escape
- **WheelController** — mouse wheel, debounced

## createSliderController

Make new slider controller instance. Manages all slider state + behavior.

```typescript
import { createSliderController } from '@reelkit/core';

const controller = createSliderController(
  {
    count: 10,
    direction: 'vertical',
    enableWheel: true,
    transitionDuration: 300,
  },
  {
    onAfterChange: (index) => console.log('Changed to:', index),
  },
);

// Attach to DOM element
controller.attach(element);
controller.observe();
```

## Controller Methods

### Navigation

```typescript
// Go to specific index
controller.goTo(5); // instant
controller.goTo(5, true); // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();
```

### Lifecycle

```typescript
// Connect to DOM element
controller.attach(element);

// Start gesture, keyboard, and wheel observation
controller.observe();

// Stop gesture, keyboard, and wheel observation
controller.unobserve();

// Detach DOM listeners (reversible — use for React effect cleanup)
controller.detach();

// Permanent teardown (use for Angular onDestroy)
controller.dispose();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);
```

### State Updates

```typescript
// Update configuration
controller.updateConfig({
  count: 20,
  loop: true,
});
```

## Virtualization

Core render only **3 slides to DOM** at any time (current, previous, next). Range extractor pick which indices in rendered window:

```typescript
import { defaultRangeExtractor } from '@reelkit/core';

// Default: renders current ± 1 (3 DOM nodes)
const indexes = defaultRangeExtractor(currentIndex, count);

// Custom: skip hidden slides by shifting to next valid index
const hiddenSlides = new Set([2, 5]);

const skipHiddenExtractor = (current: number, count: number) => {
  const result: number[] = [];
  // Collect prev, current, next — skip hidden, shift forward
  for (let i = current - 1, added = 0; added < 3 && i < count; i++) {
    if (i >= 0 && !hiddenSlides.has(i)) {
      result.push(i);
      added++;
    }
  }
  return result;
};
```

Result always clamped max 3 indices. If extractor return more, core keep 3 centered on current slide.

## Signals

Core use lightweight signal system for reactivity:

```typescript
import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Observe changes (returns a disposer function)
const dispose = count.observe(() => console.log(count.value));

// Update value
count.value = 5;

// Create computed signal (requires a deps factory)
const doubled = createComputed(
  () => count.value * 2,
  () => [count],
);

// Run side effects on signal changes
const disposeReaction = reaction(
  () => [count],
  () => console.log('Count changed:', count.value),
);

// Cleanup
dispose();
disposeReaction();
```

## Controller State

Reach reactive state via `controller.state`:

```typescript
const { index, axisValue, indexes } = controller.state;

// Observe index changes (returns a disposer function)
const disposeIndex = index.observe(() => {
  console.log('Current index:', index.value);
});

// Observe visible indexes for virtualization
const disposeIndexes = indexes.observe(() => {
  console.log('Visible:', indexes.value);
});

// Cleanup when done
disposeIndex();
disposeIndexes();
```

## Timeline Controller

Build custom scrub bar for any `<video>` element. Controller expose reactive signals for duration, current time, buffered ranges, scrubbing state. Wire pointer + keyboard onto any DOM element in one call.

```typescript
import { createTimelineController } from '@reelkit/core';

const timeline = createTimelineController({
  onScrubStart: () => video.pause(),
  onScrubEnd: () => video.play(),
});

timeline.attach(video);
const dispose = timeline.bindInteractions(trackEl);

// Render: read signals and update DOM
timeline.progress.observe(() => {
  fillEl.style.width = `${timeline.progress.value * 100}%`;
});

// Cleanup
dispose();
timeline.detach();
```

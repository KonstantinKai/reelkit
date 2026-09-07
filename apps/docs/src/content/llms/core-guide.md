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

## URL State

Put an overlay's open state in the address bar: the visible slide gets a link that can be shared, deep-linked, and closed with the back button. The core owns the model; the bindings wrap it in a hook (React/Vue `useOverlayUrlState`, Angular `createOverlayUrlState`) and a URL-driven overlay component.

### How it works

`createUrlStateController` mirrors one query parameter into a signal and writes changes back. Opening pushes **one** history entry; every navigation **replaces** it — a hundred swipes add none, so one back step always closes. A `UrlAdapter` is the pluggable read/write seam: the default drives `history.pushState`, and a routed app passes a router-backed adapter so the router's own location never goes stale.

```typescript
import { createUrlStateController, urlIndexKey } from '@reelkit/core';

const controller = createUrlStateController({
  param: 'photo',
  ...urlIndexKey(() => items.length),
});

const detach = controller.attach(); // begin mirroring the URL
controller.position.observe(() => {
  // null → closed; a number → open at that slide
  render(controller.position.value);
});

// Write back: opening pushes once, navigating replaces, closing clears
controller.set(3);
controller.set(null);
```

### Codec and locator — two jobs

A key is a matched `{ codec, locator }` pair. Spelling an identity into the URL and finding where it currently sits are separate concerns, so they are separate objects:

- **codec — the wire.** `encode` spells an identity into the parameter text; `decode` parses it back, and rejects a malformed value so the parameter self-heals out of the URL.
- **locator — the lookup.** `locate` finds where a decoded identity sits in the live collection (or `null` if it is gone); `identify` reads a position back to its identity for writes; optional `locateAsync` pages a windowed or infinite feed on a miss.

Keeping them separate lets you pair any wire with any lookup — a stable id codec with a paging locator, for instance.

### Index vs stable-id keys

Two built-in keys build that pair for you; they differ only in what the URL names:

- `urlIndexKey(() => count)` addresses by **position** (`?photo=3`). Simplest, but a bookmark opens a different item once the list is reordered.
- `urlStableIdKey({ items })` addresses by each item's stable `id` (`?photo=post_42`), scanning the live list — the bookmark still names that item after a reorder, or drops cleanly when it is gone. `hashCodec: base64UrlCodec` base64url-obscures the id (reversible, not a cryptographic hash).

**Paging a windowed feed?** Both built-in keys take an optional `locateAsync` — `urlIndexKey(() => count, locateAsync)` and `urlStableIdKey({ items, locateAsync })`. The synchronous lookup answers for what has loaded; a miss pages the rest in, so a shared link past the window still opens — no hand-rolled codec or locator.

Two axes? `urlIndexTwoAxisKey` carries `?p=<outer>.<inner>` for a post plus an inner media index. Full options live on the [Core API reference](/docs/core/api#url-state).

## Viewed State

Remember how far a viewer got through a gallery, across reloads and across tabs — a ring that shows what has been seen, a gallery that reopens where it was left. Same model as URL state, pointed at storage instead of the address bar, so the two share a key.

### How it works

`createViewedStateController` stores an entry as the exact text a `?photo=` link would carry, and reads it back through the same `decode` → `locate` cycle. Nothing trusts a stored position. Spread one key into both surfaces and a bookmark and a stored entry are the same string.

```typescript
import {
  createUrlStateController,
  createViewedStateController,
  urlStableIdTwoAxisKey,
  twoAxisViewedTracking,
} from '@reelkit/core';

const key = urlStableIdTwoAxisKey({ outerItems, innerItems });

const url = createUrlStateController({ param: 'story', ...key });
const seen = createViewedStateController({
  storageKey: 'stories-seen',
  ...key,
  ...twoAxisViewedTracking,
});

seen.attach(); // reads storage, follows other tabs
seen.record({ outer: 2, inner: 1 }); // furthest point wins, a rewatch never rewinds
seen.resolve('user_42'); // → { outer: 2, inner: 1 } | null
```

### Durability follows the key

The store adds no repair of its own, so which key you spread decides what survives: an id-addressed key keeps a place across the collection being reordered, a position-addressed one does not. A stored entry names the furthest point reached rather than a tally of views, so removing an item from the middle shortens the count — the same self-healing a shared link gets.

Reading is synchronous only. An entry whose items have not loaded yet reads as absent and stays in storage untouched, so a windowed feed never eats its own history.

### Storage and expiry

`localStorage` backs the store by default; `createSessionStorageAdapter()` forgets on tab close, and a `StorageAdapter` of your own puts it anywhere synchronous. Nothing is read until `attach()`, so a server render and the first client render agree.

Entries are kept until forgotten explicitly. Pass `ttlMs` to expire them instead — per track, on a sliding clock, so somewhere still being watched never goes stale beside somewhere abandoned. It changes what is written, each entry becoming a `[wire, timestamp]` pair, but reading copes with either shape whatever the option says, so an entry stored before you turned it on counts as fresh rather than being deleted. `maxTracks` bounds count instead of age: past it, the least recently recorded track is dropped on the next write, and recording a track, even a position already behind, moves it to the back of the line. Full options live on the [Core API reference](/docs/core/api#viewed-state).

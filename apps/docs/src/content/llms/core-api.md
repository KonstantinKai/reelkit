---
title: Core API Reference
url: https://reelkit.dev/docs/core/api
section: Core
order: 2
desc: Complete reference for @reelkit/core configuration, callbacks, methods, state, signals, transitions, content loading, sound, timeline, fullscreen, DOM utilities, focus management, and video utilities.
---

# Core API Reference

Reference for `@reelkit/core` config, callbacks, methods, state, signals, transitions, content loading, sound, timeline, fullscreen, DOM utils, focus management, video utils.

## SliderController API

The framework-agnostic core. One factory builds a controller from a config and optional events: **Config Options** are the config, **Callbacks** the events, **Methods** what the returned controller exposes.

### Factory Function

| Export                   | Type                                                                | Description                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createSliderController` | `(config: SliderConfig, events?: SliderEvents) => SliderController` | Build a slider controller. `config` is required (options below); `events` is optional (callbacks below). Returns the controller whose methods drive it. |

### Config Options

| Property              | Type                               | Default                 | Description                                                          |
| --------------------- | ---------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `count`               | `number`                           | required                | Total items                                                          |
| `initialIndex`        | `number`                           | `0`                     | Start index                                                          |
| `direction`           | `'vertical' \| 'horizontal'`       | `'vertical'`            | Scroll direction                                                     |
| `enableGestures`      | `boolean`                          | `true`                  | Enable touch/mouse drag nav. False = no gesture controller attached. |
| `enableNavKeys`       | `boolean`                          | `true`                  | Enable arrow key nav                                                 |
| `enableWheel`         | `boolean`                          | `false`                 | Enable mouse wheel                                                   |
| `wheelDebounceMs`     | `number`                           | `200`                   | Wheel debounce ms                                                    |
| `loop`                | `boolean`                          | `false`                 | Loop nav                                                             |
| `transitionDuration`  | `number`                           | `300`                   | Animation ms                                                         |
| `swipeDistanceFactor` | `number`                           | `0.12`                  | Swipe threshold (0-1)                                                |
| `rangeExtractor`      | `(index, count, loop) => number[]` | `defaultRangeExtractor` | Custom fn picks rendered indexes                                     |

### Callbacks

| Callback         | Type                                     | Description                                           |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| `onBeforeChange` | `(index, nextIndex, rangeIndex) => void` | Before slide change                                   |
| `onAfterChange`  | `(index, rangeIndex) => void`            | After slide change                                    |
| `onDragStart`    | `(index) => void`                        | Drag start                                            |
| `onDragEnd`      | `(index) => void`                        | Drag end                                              |
| `onDragCanceled` | `(index) => void`                        | Drag canceled                                         |
| `onTap`          | `(event: GestureCommonEvent) => void`    | Single tap (delayed by double-tap window)             |
| `onDoubleTap`    | `(event: GestureCommonEvent) => void`    | Double tap                                            |
| `onLongPress`    | `(event: GestureCommonEvent) => void`    | Long press                                            |
| `onLongPressEnd` | `(event: GestureEvent) => void`          | Pointer release after long press                      |
| `onNavKeyPress`  | `(increment: -1 \| 1) => void`           | Custom arrow key handler. Replaces default prev/next. |

### Methods

| Method                  | Type                                  | Description                                                                                               |
| ----------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `attach(element)`       | `(HTMLElement) => void`               | Connect controller to DOM for gestures                                                                    |
| `detach()`              | `() => void`                          | Detach DOM listeners (gestures, keyboard, wheel). Safe re-attach via observe(). For React effect cleanup. |
| `dispose()`             | `() => void`                          | Permanent teardown: detach all controllers + clean signal observers. For Angular onDestroy.               |
| `observe()`             | `() => void`                          | Start gesture/keyboard/wheel observation. Respects enableGestures, enableNavKeys, enableWheel flags.      |
| `unobserve()`           | `() => void`                          | Stop gesture/keyboard/wheel observation                                                                   |
| `next()`                | `() => Promise<void>`                 | Next slide                                                                                                |
| `prev()`                | `() => Promise<void>`                 | Prev slide                                                                                                |
| `goTo(index, animate?)` | `(number, boolean?) => Promise<void>` | Go to slide                                                                                               |
| `adjust(duration?)`     | `(number?) => void`                   | Recalc slide positions                                                                                    |
| `setPrimarySize(size)`  | `(number) => void`                    | Update container size                                                                                     |
| `updateConfig(config)`  | `(Partial<SliderConfig>) => void`     | Update config                                                                                             |
| `updateEvents(events)`  | `(Partial<SliderEvents>) => void`     | Replace event handlers (omitted ones preserved)                                                           |
| `getRangeIndex()`       | `() => number`                        | Position of active index in visible range array                                                           |

## State Properties

| Property    | Type                       | Description                        |
| ----------- | -------------------------- | ---------------------------------- |
| `index`     | `Signal<number>`           | Current slide index                |
| `axisValue` | `Signal<AnimatedValue>`    | Current axis position (animated)   |
| `indexes`   | `ComputedSignal<number[]>` | Visible indexes for virtualization |

## Range Extractor

| Export                  | Type                               | Description                                   |
| ----------------------- | ---------------------------------- | --------------------------------------------- |
| `defaultRangeExtractor` | `(index, count, loop) => number[]` | Default: renders 3 items around current index |

## Signal API

Lightweight reactive primitives used throughout core.

### Signal Interface

| Member              | Type                                   | Description                                               |
| ------------------- | -------------------------------------- | --------------------------------------------------------- |
| `value`             | `T`                                    | Get/set current value. Set notifies observers if changed. |
| `observe(callback)` | `(callback: () => void) => () => void` | Register listener on value change. Returns disposer.      |

### Factory Functions

| Export           | Type                                                                | Description                                                                        |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `createSignal`   | `<T>(initial: T) => Signal<T>`                                      | Mutable reactive signal                                                            |
| `createComputed` | `<T>(fn: () => T, deps: () => Subscribable[]) => ComputedSignal<T>` | Derived computed signal. 2nd arg = deps factory returning tracked signals.         |
| `reaction`       | `(deps: () => Subscribable[], effect: () => void) => () => void`    | Run side effect on dep change; returns disposer. Read signal values inside effect. |
| `batch`          | `(fn: () => void) => void`                                          | Group signal updates into one notification pass; nests                             |

## Transitions

Built-in transition fns compute per-slide CSS transforms during animated nav. Pass as `transitionTransformFn` prop to framework component.

| Export                  | Type                                             | Description                                                                       |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `TransitionTransformFn` | type                                             | Signature for custom transitions                                                  |
| `getSlideProgress`      | `(axisValue, slideIndex, primarySize) => number` | Normalized offset (-1 to 1) for slide vs viewport. Use inside custom transitions. |
| `slideTransition`       | `TransitionTransformFn`                          | Default slide (translateX/Y)                                                      |
| `fadeTransition`        | `TransitionTransformFn`                          | Crossfade opacity                                                                 |
| `flipTransition`        | `TransitionTransformFn`                          | 3D card-flip                                                                      |
| `cubeTransition`        | `TransitionTransformFn`                          | 3D cube rotation                                                                  |
| `zoomTransition`        | `TransitionTransformFn`                          | Scale/zoom                                                                        |

## Content Loading

Utils for per-slide loading/error state + media preload. Loading controller use index guard reject stale callbacks from old slides. Preloader use LRU cache (default 200 loaded, 100 errored) so revisit broken URL show error instant, no retry.

| Export                           | Type                                                                        | Description                                                                       |
| -------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `createContentLoadingController` | `() => ContentLoadingController`                                            | Per-slide loading/error tracking                                                  |
| `createContentPreloader`         | `(config: ContentPreloaderConfig) => ContentPreloader`                      | LRU-cached media preloader with error caching                                     |
| `observeMediaLoading`            | `(video: HTMLVideoElement, callbacks: MediaLoadingCallbacks) => () => void` | Observe video loading state (playing, canplaythrough, waiting). Returns disposer. |

### ContentLoadingController

| Member           | Type                      | Description                              |
| ---------------- | ------------------------- | ---------------------------------------- |
| `isLoading`      | `Signal<boolean>`         | Active slide loading?                    |
| `isError`        | `Signal<boolean>`         | Active slide errored?                    |
| `setActiveIndex` | `(index: number) => void` | Update active index, reset loading/error |
| `onReady`        | `(index: number) => void` | Mark ready (ignored if index ≠ active)   |
| `onWaiting`      | `(index: number) => void` | Mark loading (ignored if index ≠ active) |
| `onError`        | `(index: number) => void` | Mark errored (ignored if index ≠ active) |

### ContentPreloader

| Member        | Type                                               | Description                                 |
| ------------- | -------------------------------------------------- | ------------------------------------------- |
| `preload`     | `(src: string, type?: 'image' \| 'video') => void` | Start preload                               |
| `isLoaded`    | `(src: string) => boolean`                         | URL in loaded LRU (max 200)?                |
| `isErrored`   | `(src: string) => boolean`                         | URL in error LRU (max 100)?                 |
| `markLoaded`  | `(src: string) => void`                            | Manual mark loaded                          |
| `markErrored` | `(src: string) => void`                            | Manual mark errored                         |
| `onLoaded`    | `(src: string, cb: () => void) => () => void`      | Subscribe load completion; returns disposer |

## Sound

Shared mute/unmute state for media playback. Sound controller give reactive muted signal — sync to video elements, toggle from custom controls.

| Export                  | Type                           | Description                                   |
| ----------------------- | ------------------------------ | --------------------------------------------- |
| `createSoundController` | `() => SoundController`        | Shared mute state                             |
| `syncMutedToVideo`      | `(video, sound) => () => void` | Sync muted signal to video. Returns disposer. |

## Timeline

Playback timeline controller for video scrub. Track duration, currentTime, bufferedRanges, isScrubbing as reactive signals. One call wire pointer + keyboard onto any DOM element — native-feel scrub bar with pointer capture, live seek, full keyboard (arrows, Home/End, PageUp/PageDown).

| Export                     | Type                                                        | Description                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createTimelineController` | `(config?: TimelineControllerConfig) => TimelineController` | Factory returning controller with `duration`, `currentTime`, `progress`, `bufferedRanges`, `isScrubbing` signals plus `attach`, `detach`, `bindInteractions`, `seek` methods. |
| `TimelineControllerConfig` | interface                                                   | `keyboardStepSeconds` (default 5), `keyboardPageFraction` (default 0.1), `onSeek`, `onScrubStart`, `onScrubEnd` callbacks.                                                    |
| `BufferedRange`            | `{ start: number; end: number }`                            | Single contiguous buffered region as 0–1 fractions of duration. Emitted sorted, non-overlapping.                                                                              |

## Fullscreen

Cross-browser fullscreen utils with Safari vendor-prefix guards. Fullscreen signal = lazy singleton tracking fullscreen state reactively.

| Export              | Type                                      | Description                         |
| ------------------- | ----------------------------------------- | ----------------------------------- |
| `fullscreenSignal`  | `Signal<boolean>`                         | Reactive signal: doc in fullscreen? |
| `requestFullscreen` | `(element: HTMLElement) => Promise<void>` | Enter fullscreen on element         |
| `exitFullscreen`    | `() => Promise<void>`                     | Exit fullscreen                     |

## DOM & Cleanup Utilities

Low-level helpers for DOM event management + deterministic cleanup. Used internally by all controllers, available for custom integrations.

| Export                 | Type                                               | Description                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observeDomEvent`      | `(target, event, handler, options?) => () => void` | Add DOM listener, returns remove disposer                                                                                                                                                                                 |
| `createDisposableList` | `() => DisposableList`                             | Composable list of disposers. `dispose()` runs all.                                                                                                                                                                       |
| `createBodyLock`       | `() => BodyLock`                                   | Ref-counted body scroll lock. Multiple consumers lock at once; scroll restored when all unlock.                                                                                                                           |
| `sharedBodyLock`       | `BodyLock`                                         | Module-level singleton. Use when multiple components share one ref counter so nested modals/overlays interleave right. Framework bindings (`@reelkit/react`, `@reelkit/vue`, `@reelkit/angular`) use this under the hood. |

## Focus Management

Framework-agnostic dialog a11y primitives. Overlay packages use them to return focus to trigger on close + trap Tab/Shift+Tab inside overlay while open. SSR-safe: each helper returns no-op disposer in non-browser env.

| Export                  | Type                                        | Description                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `captureFocusForReturn` | `() => Disposer`                            | Capture focused element, returns disposer that refocuses it. Best-effort: no-op if captured element gone from DOM.                                                                                                                          |
| `createFocusTrap`       | `(container: HTMLElement) => Disposer`      | Trap Tab/Shift+Tab inside `container`. Tab at last wraps to first; Shift+Tab at first wraps to last; focus escaping container (click outside, programmatic) pulled back. Does not move focus into container on activation — caller decides. |
| `getFocusableElements`  | `(container: HTMLElement) => HTMLElement[]` | Every keyboard-focusable descendant in DOM order, skipping disabled, hidden, `tabindex="-1"`.                                                                                                                                               |

### Usage

```typescript
import { captureFocusForReturn, createFocusTrap } from '@reelkit/core';

// When your modal opens:
const restoreFocus = captureFocusForReturn();
container.focus({ preventScroll: true });
const releaseTrap = createFocusTrap(container);

// When the modal closes:
releaseTrap();
restoreFocus();
```

## Video Utilities

Framework-agnostic utils for shared video playback across slides. Used internally by `@reelkit/react-reel-player` + `@reelkit/react-lightbox`. Available for custom framework bindings.

| Export               | Type                                                 | Description                                                                                                                                                                                                                                                                                |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `captureFrame`       | `(video: HTMLVideoElement) => string \| null`        | Capture current frame as JPEG data URL. Null on cross-origin errors.                                                                                                                                                                                                                       |
| `createSharedVideo`  | `(config: SharedVideoConfig) => SharedVideoInstance` | Scoped shared video singleton with playback position + frame capture maps. Each consumer gets isolated instance for iOS sound continuity.                                                                                                                                                  |
| `syncVideoObjectFit` | `(video, fallbackIsVertical) => Disposer`            | Keep `video.style.objectFit` synced to real orientation. Apply fallback (from declared aspect ratio) immediately, then on `loadedmetadata` read actual `videoWidth` / `videoHeight` and switch to `'cover'` for portrait, `'contain'` for landscape. Resilient to wrong declared metadata. |

## URL State

| Export                     | Type                                                                                        | Description                                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createUrlStateController` | `({ param, adapter?, codec?, locator? }) => UrlStateController`                             | Mirrors one query param into `value: Signal<string \| null>` and, given a `codec` or `locator`, a derived `index: Signal<number \| null>`. `set(v)` writes; `set(null)` closes. `attach()` follows the URL.                                                                                                                                               |
| `createHistoryAdapter`     | `() => UrlAdapter`                                                                          | Default adapter over the History API. Globals touched lazily — safe to import during SSR/prerender.                                                                                                                                                                                                                                                       |
| `indexCodec`               | `UrlCodec<number>`                                                                          | Reads `?photo=3` as slide 3. The default codec — pass it to opt into index derivation without writing your own.                                                                                                                                                                                                                                           |
| `createIndexLocator`       | `(countGetter: () => number) => UrlLocator<number>`                                         | Default index locator: maps a slide position to itself, bounded by the live count the getter returns. An out-of-range index resolves to `null` so a stale `?photo=99` self-heals out of the URL — it rejects, never coerces to the nearest slide. A getter, not a number, so the bound reads the current size at lookup time (a paginated gallery grows). |
| `indexKey`                 | `(countGetter: () => number) => UrlKey<number>`                                             | The matched `{ codec: indexCodec, locator: createIndexLocator(countGetter) }` pair for an index-addressed gallery. Spread it — `{ param, ...indexKey(() => count) }` — so the codec cannot drift from the locator.                                                                                                                                        |
| `UrlCodec<Id>`             | `{ decode(raw) => Id \| null; encode(id) => string }`                                       | WIRE format: param text ↔ a stable identity. Collection-blind. `decode` returning `null` = malformed text.                                                                                                                                                                                                                                               |
| `UrlLocator<Id>`           | `{ locate(id) => number \| null; locateAsync?(id) => Promise<...>; identify(index) => id }` | LOOKUP: where the identity sits in the collection. `locate` sync, `locateAsync` its async fallback, `identify` for writes.                                                                                                                                                                                                                                |
| `UrlKey<Id>`               | `{ codec: UrlCodec<Id>; locator: UrlLocator<Id> }`                                          | The matched codec + locator pair for one parameter. They share `Id` and always travel together, so building them as a pair is what keeps them from disagreeing.                                                                                                                                                                                           |
| `UrlAdapter`               | `{ read, subscribe, push, replace, getState, goBack }`                                      | Injection point for a router. Routed apps must supply one, or the router's location goes stale.                                                                                                                                                                                                                                                           |
| `UrlStateOptions<Id>`      | `{ param: string; adapter?: UrlAdapter; codec?: UrlCodec<Id>; locator?: UrlLocator<Id> }`   | The options `createUrlStateController` takes — exported so a consumer can type a config assembled separately before handing it over.                                                                                                                                                                                                                      |

First write of an absent param **pushes** one entry; later writes **replace** it. Closing an entry it pushed steps back; closing a param that arrived with the page removes it in place (never navigates off-site).

### Deriving an index

Two axes, each one responsibility. `codec` is the **wire** — param text ↔ a stable identity, collection-blind. `locator` is the **lookup** — where that identity sits in the collection. The controller runs `decode` then `locate`, applies the open/close latch, self-heals a param that names no slide, and discards a stale async answer — once, for every binding. Without a `codec` or `locator` it reports `value` only and leaves `index` at `null`.

```ts
// Integer default: the identity IS the index, so no locator.
const photo = createUrlStateController({ param: 'photo', codec: indexCodec });
photo.attach();
photo.index.value; // 3 for ?photo=3, null for ?photo=bogus (param is dropped)
```

An identity codec keeps a bookmark pointing at the entity across a reorder:

```ts
const photo = createUrlStateController({
  param: 'photo',
  codec: { decode: atob, encode: btoa }, // wire: base64 ↔ id
  locator: {
    locate: (id) => feed.findIndex((e) => e.id === id), // lookup: id → index
    identify: (index) => feed[index].id,
  },
});
```

While something is open, `index` holds the index it opened at and stops following the URL — the slider owns the index from there and the URL trails it.

### Async lookup

For a paginated list, add `locateAsync` to the locator — the fallback called only when the sync `locate` misses. Load the pages you need, then return the index the identity turned out to have.

```ts
const photo = createUrlStateController({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => feed.findIndex((e) => e.id === id),
    identify: (index) => feed[index].id,
    locateAsync: async (id) => {
      await fetchUntilFound(id); // your pagination
      return feed.findIndex((e) => e.id === id); // null when exhausted
    },
  },
});
```

While `locateAsync` is pending the param **survives** and nothing is written — a deep link into an unloaded page is not cleared mid-fetch. `null` or a rejection drops the param and stays closed. An answer arriving after the URL moved on, after a close, or after `dispose` is discarded. Whatever it returns is authoritative — the index of data it just fetched, taken as-is. There is no timeout: settle when pagination is exhausted, or the overlay stays closed with the param intact.

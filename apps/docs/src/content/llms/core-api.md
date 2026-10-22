---
title: Core API Reference
url: https://reelkit.dev/docs/core/api
section: Core
order: 2
desc: Complete reference for @reelkit/core configuration, callbacks, methods, state, signals, transitions, content loading, sound, timeline, fullscreen, DOM utilities, size detection, autoplay timers, file download, focus management, and video utilities.
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

| Property              | Type              | Default                 | Description                                                          |
| --------------------- | ----------------- | ----------------------- | -------------------------------------------------------------------- |
| `count`               | `number`          | required                | Total items                                                          |
| `initialIndex`        | `number`          | `0`                     | Start index                                                          |
| `direction`           | `SliderDirection` | `'vertical'`            | Scroll direction, `'vertical' \| 'horizontal'`                       |
| `enableGestures`      | `boolean`         | `true`                  | Enable touch/mouse drag nav. False = no gesture controller attached. |
| `enableNavKeys`       | `boolean`         | `true`                  | Enable arrow key nav                                                 |
| `enableWheel`         | `boolean`         | `false`                 | Enable mouse wheel                                                   |
| `wheelDebounceMs`     | `number`          | `200`                   | Wheel debounce ms                                                    |
| `loop`                | `boolean`         | `false`                 | Loop nav                                                             |
| `transitionDuration`  | `number`          | `300`                   | Animation ms                                                         |
| `swipeDistanceFactor` | `number`          | `0.12`                  | Swipe threshold (0-1)                                                |
| `rangeExtractor`      | `RangeExtractor`  | `defaultRangeExtractor` | Custom fn picks rendered indexes                                     |

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

Controller `state` field = `SliderState`, the three signals below. Type a value receiving it with `SliderState`.

| Property    | Type                       | Description                        |
| ----------- | -------------------------- | ---------------------------------- |
| `index`     | `Signal<number>`           | Current slide index                |
| `axisValue` | `Signal<AnimatedValue>`    | Current axis position (animated)   |
| `indexes`   | `ComputedSignal<number[]>` | Visible indexes for virtualization |

## Range Extractor

| Export                  | Type                                 | Description                                                   |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `defaultRangeExtractor` | `RangeExtractor`                     | Default: renders 3 items around current index                 |
| `RangeExtractor`        | `(current, count, loop) => number[]` | Range extractor signature. Type own `rangeExtractor` with it. |

## Signal API

Lightweight reactive primitives used throughout core.

### Signal Interface

| Member              | Type                                   | Description                                               |
| ------------------- | -------------------------------------- | --------------------------------------------------------- |
| `value`             | `T`                                    | Get/set current value. Set notifies observers if changed. |
| `observe(callback)` | `(callback: () => void) => () => void` | Register listener on value change. Returns disposer.      |

### Factory Functions

| Export           | Type                                                                | Description                                                                                     |
| ---------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `createSignal`   | `<T>(initial: T) => Signal<T>`                                      | Mutable reactive signal                                                                         |
| `createComputed` | `<T>(fn: () => T, deps: () => Subscribable[]) => ComputedSignal<T>` | Derived computed signal. 2nd arg = deps factory returning tracked signals.                      |
| `reaction`       | `(deps: () => Subscribable[], effect: () => void) => () => void`    | Run side effect on dep change; returns disposer. Read signal values inside effect.              |
| `batch`          | `(fn: () => void) => void`                                          | Group signal updates into one notification pass; nests                                          |
| `Listener`       | `() => void`                                                        | Callback `observe` takes. Type a separately declared observer with it.                          |
| `Dispose`        | `() => void`                                                        | What `observe` + `reaction` return: call to stop listening. Type a stored subscription with it. |

## Transitions

Built-in transition fns compute per-slide CSS transforms during animated nav. Pass as `transitionTransformFn` prop to framework component.

| Export                  | Type                                                  | Description                                                                           |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `TransitionTransformFn` | type                                                  | Signature for custom transitions                                                      |
| `getSlideProgress`      | `(axisValue, slideIndex, primarySize) => number`      | Normalized offset (-1 to 1) for slide vs viewport. Use inside custom transitions.     |
| `slideTransition`       | `TransitionTransformFn`                               | Default slide (translateX/Y)                                                          |
| `fadeTransition`        | `TransitionTransformFn`                               | Crossfade opacity                                                                     |
| `flipTransition`        | `TransitionTransformFn`                               | 3D card-flip                                                                          |
| `cubeTransition`        | `TransitionTransformFn`                               | 3D cube rotation                                                                      |
| `zoomTransition`        | `TransitionTransformFn`                               | Scale/zoom                                                                            |
| `SlideTransformStyle`   | `{ transform?; transformOrigin?; opacity?; zIndex? }` | What a `TransitionTransformFn` returns per slide. Return it from a custom transition. |

## Input Controllers

Slider controller builds these three itself from `enableGestures`, `enableNavKeys`, `enableWheel`. Create one directly for own integration, or for gestures / arrow keys / wheel on an element that is not a slider.

### Gesture Controller

| Export                       | Type                                                                                                                                                                                                                                | Description                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createGestureController`    | `(config?: GestureControllerConfig, events?: GestureControllerEvents) => GestureController`                                                                                                                                         | Detects tap, double tap, long press, drag on an element; locks each drag to its dominant axis.                                                                                                          |
| `GestureController`          | `{ attach; detach; observe; unobserve; updateEvents }`                                                                                                                                                                              | Returned by `createGestureController`. `attach(element)` binds, `observe()` adds listeners, `unobserve()` removes them (keeps element), `detach()` removes all; `updateEvents(events)` merges handlers. |
| `GestureControllerConfig`    | `{ useTouchEventsOnly?; longPressDurationMs?; doubleTapWindowMs? }`                                                                                                                                                                 | Options: ignore mouse (default `false`), long-press time (default `800` ms), double-tap window (default `200` ms).                                                                                      |
| `GestureControllerEvents`    | `{ onTap?; onDoubleTap?; onTapDown?; onTapUp?; onLongPress?; onLongPressEnd?; onHorizontalDragStart?; onHorizontalDragUpdate?; onHorizontalDragEnd?; onVerticalDragStart?; onVerticalDragUpdate?; onVerticalDragEnd?; onDragEnd? }` | Callbacks. Drag routed to horizontal or vertical handlers by dominant axis; `onDragEnd` fires for both.                                                                                                 |
| `GestureAxisDragUpdateEvent` | `GestureEvent & { delta; distance; primaryDelta; primaryDistance; cancel }`                                                                                                                                                         | Payload of `onHorizontalDragUpdate` / `onVerticalDragUpdate`: move since last update, total distance, same along dominant axis, `cancel()` snaps back.                                                  |
| `GestureAxisDragEndEvent`    | update event minus `cancel`, plus `{ velocity; primaryVelocity }`                                                                                                                                                                   | Payload of `onHorizontalDragEnd` / `onVerticalDragEnd`, release speed in px/s.                                                                                                                          |
| `GestureDragEndEvent`        | `GestureAxisDragEndEvent` minus `primary` fields                                                                                                                                                                                    | Payload of `onDragEnd`, axis-agnostic.                                                                                                                                                                  |
| `Offset`                     | `[x: number, y: number]`                                                                                                                                                                                                            | Pixel pair for every position, delta, distance, velocity in gesture events.                                                                                                                             |
| `EventKind`                  | `'touch' \| 'mouse'`                                                                                                                                                                                                                | Input source, `kind` field of `GestureCommonEvent`.                                                                                                                                                     |
| `DragAxis`                   | `'horizontal' \| 'vertical' \| null`                                                                                                                                                                                                | Dominant drag axis; `null` until first movement decides.                                                                                                                                                |

### Keyboard Controller

| Export                     | Type                                                                                         | Description                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `createKeyboardController` | `(config: KeyboardControllerConfig, events: KeyboardControllerEvents) => KeyboardController` | Arrow key presses → `NavKey` callbacks.                                                                           |
| `KeyboardController`       | `{ attach; detach }`                                                                         | Returned by `createKeyboardController`. `attach(target?)` listens `keydown` (default `window`), `detach()` stops. |
| `KeyboardControllerConfig` | `{ filter?; throttleMs? }`                                                                   | Options: keys to react to (default all four), min time between presses (default `0`, no throttle).                |
| `KeyboardControllerEvents` | `{ onKeyPress: (key: NavKey, event: KeyboardEvent) => void }`                                | Callback per accepted key press.                                                                                  |
| `NavKey`                   | `'up' \| 'right' \| 'down' \| 'left'`                                                        | Arrow key pressed, as reported + filtered.                                                                        |

### Wheel Controller

| Export                  | Type                                                                                | Description                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `createWheelController` | `(config: WheelControllerConfig, events: WheelControllerEvents) => WheelController` | Mouse wheel → one direction callback per gesture; collapses the burst one scroll produces.                                            |
| `WheelController`       | `{ attach; detach }`                                                                | Returned by `createWheelController`. `attach(target?)` listens `wheel` (default `window`), `detach()` stops + drops pending callback. |
| `WheelControllerConfig` | `{ debounceMs?; deltaThreshold? }`                                                  | Options: quiet time ending a gesture (default `200` ms), smallest delta counted (default `10` px).                                    |
| `WheelControllerEvents` | `{ onWheel: (direction: WheelDirection, event: WheelEvent) => void }`               | Callback once per scroll gesture.                                                                                                     |
| `WheelDirection`        | `'up' \| 'down' \| 'left' \| 'right'`                                               | Wheel gesture direction.                                                                                                              |

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

## Utilities

Small helpers the controllers are built from. Framework bindings re-export them → custom slide, transition, integration can use same ones.

| Export             | Type                                                          | Description                                                                                                                                  |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `first`            | `<T>(arr: readonly T[]) => T`                                 | First element, e.g. x of an `Offset`, width of a size.                                                                                       |
| `last`             | `<T>(arr: readonly T[]) => T`                                 | Last element, e.g. y of an `Offset`, height of a size.                                                                                       |
| `generate`         | `<G>(count, generator: (i) => G) => G[]`                      | Array of `count` items from index, e.g. `generate(10, (i) => i)` for demo data.                                                              |
| `abs`              | `(value: number) => number`                                   | Absolute value.                                                                                                                              |
| `isNegative`       | `(value: number) => boolean`                                  | Below zero? e.g. backward vs forward drag.                                                                                                   |
| `clamp`            | `(value, min, max) => number`                                 | Keep number within `min`..`max`, inclusive.                                                                                                  |
| `lerp`             | `(t, a, b) => number`                                         | Linear interpolation: `a` at `t = 0`, `b` at `t = 1`. Map slide progress to a value in custom transitions.                                   |
| `extractRange`     | `(count, start, end?, overscan?, loop?) => number[]`          | Indexes `start`..`end` (default `start`) + `overscan` each side (default `1`), wrapped when `loop`. Build a custom `RangeExtractor` with it. |
| `noop`             | `() => void`                                                  | Does nothing; default callback.                                                                                                              |
| `createDeferred`   | `<T = void>() => Deferred<T>`                                 | Promise + its `resolve`, bridging callback API to `await`.                                                                                   |
| `Deferred`         | `{ promise: Promise<T>; resolve: (value?: T) => void }`       | Returned by `createDeferred`.                                                                                                                |
| `createLruCache`   | `<V>(maxSize, onEvict?: (value, key) => void) => LruCache<V>` | `Map` keeping `maxSize` most recently set entries, dropping oldest. `onEvict` per dropped entry, e.g. `URL.revokeObjectURL`.                 |
| `LruCache`         | `Map<string, V>`                                              | Returned by `createLruCache`. Real `Map`; only `set` differs.                                                                                |
| `animate`          | `(options: AnimationOptions) => () => void`                   | Animate number `from` → `to`, ease-in-out, `onUpdate` per frame. Returns cancel fn.                                                          |
| `AnimationOptions` | `{ from; to; duration; onUpdate; onComplete? }`               | Options of `animate`: start, end, duration ms, per-frame callback, optional finish callback.                                                 |

## Size Detection

How every binding + overlay measures container + window. `Reel` uses `observeElementSize` when no `size` passed; reel player, lightbox, stories player size from window. SSR-safe: no window / `ResizeObserver` → getters return `[0, 0]` / `false`, observers return no-op disposer.

| Export                | Type                                                                         | Description                                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observeElementSize`  | `(element: Element, callback: (size: [number, number]) => void) => Disposer` | Reports padding box (`clientWidth` × `clientHeight`) on change. Skips size with a zero side + size equal to last reported.                                                        |
| `getViewportSize`     | `() => [number, number]`                                                     | Window size `[innerWidth, innerHeight]`.                                                                                                                                          |
| `observeViewportSize` | `(callback: (size: [number, number]) => void) => Disposer`                   | Window size on every `resize` event, unchanged size included (device emulation can switch to touch at same dims). Compare yourself if only change matters.                        |
| `isMobileWidth`       | `(viewportWidth: number) => boolean`                                         | Phone layout: 768px and narrower. Every overlay + stylesheet switch at this width.                                                                                                |
| `fitAspectRatio`      | `(viewport: [number, number], aspectRatio?: number) => [number, number]`     | Overlay size for window. Phone width → whole window; else full height at `aspectRatio`, narrowed to window width when too wide. Missing, zero, negative, non-finite ratio → 9/16. |
| `isTouchDevice`       | `() => boolean`                                                              | Device takes touch input (`ontouchstart` / `maxTouchPoints`). Capability, not screen size.                                                                                        |

## Autoplay

Timers for anything that advances on its own. Behaviour + wiring: [Autoplay guide](/docs/core/guide#autoplay).

| Export                      | Type                                                         | Description                                                    |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `createTimerController`     | `(config: TimerControllerConfig) => TimerController`         | Count one duration 0 → 1, call back when done. Drives stories. |
| `createSlideshowController` | `(config: SlideshowControllerConfig) => SlideshowController` | State machine behind auto-advancing gallery. Drives lightbox.  |

### createTimerController

| `TimerControllerConfig` | Type         | Description                                        |
| ----------------------- | ------------ | -------------------------------------------------- |
| `duration`              | `number`     | Default duration ms, used when `start()` gets none |
| `onComplete`            | `() => void` | Called when progress reaches 1                     |

| `TimerController`  | Type                | Description                                       |
| ------------------ | ------------------- | ------------------------------------------------- |
| `progress`         | `Signal<number>`    | 0 → 1; drives progress bar                        |
| `isRunning`        | `Signal<boolean>`   | Counting or not                                   |
| `start(duration?)` | `(number?) => void` | Start over from 0, optional duration for this run |
| `pause()`          | `() => void`        | Freeze at current progress                        |
| `resume()`         | `() => void`        | Continue from frozen progress                     |
| `reset()`          | `() => void`        | Back to 0, stopped                                |
| `dispose()`        | `() => void`        | Cancel pending frame                              |

### createSlideshowController

| `SlideshowControllerConfig` | Type         | Description                                      |
| --------------------------- | ------------ | ------------------------------------------------ |
| `interval`                  | `number`     | Image time ms, counted once loaded               |
| `onAdvance`                 | `() => void` | Active slide done. Go next, or `pause()` on last |

| `SlideshowController`              | Type                           | Description                                                                                            |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `isPlaying`                        | `Signal<boolean>`              | Switched on. Holds don't change it                                                                     |
| `progress`                         | `Signal<number>`               | Active image's interval 0 → 1                                                                          |
| `play()` / `pause()` / `toggle()`  | `() => void`                   | Switch on/off; active slide keeps progress                                                             |
| `setInterval(ms)`                  | `(number) => void`             | New interval from next image                                                                           |
| `setSlide(kind)`                   | `(SlideshowSlideKind) => void` | New active slide: restart, wait for `ready()` / `ended()`. `SlideshowSlideKind` = `'image' \| 'video'` |
| `ready()`                          | `() => void`                   | Active image loaded or failed; interval starts                                                         |
| `ended()`                          | `() => void`                   | Active video ended; advance now or once nothing holds                                                  |
| `hold(reason)` / `release(reason)` | `(string) => void`             | Stop clock for reason (`'hover'`, `'drag'`). Holds stack                                               |
| `dispose()`                        | `() => void`                   | Stop clock + visibility listener                                                                       |

## Download

Save file from URL, cross-origin included. Fallback: [Download guide](/docs/core/guide#download).

| Export         | Type                                                | Description                                                                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `downloadFile` | `(url: string, filename?: string) => Promise<void>` | Save file under `filename` (default: last URL path segment). Fetch → blob → save, since `download` attr ignored on cross-origin link. Fetch fails / error status (cross-origin w/o CORS usual) → URL opens in new tab. Never rejects; no-op without window. |

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

| Export                     | Type                                                                                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createUrlStateController` | `({ param, adapter?, codec?, locator? }) => UrlStateController`                                           | Mirrors one query param into `value: Signal<string \| null>` and, given a `codec` or `locator`, a derived `position: Signal<Pos \| null>`. `set(v)` writes and, while closed, opens at once without waiting for the adapter to report the write back; `set(null)` closes, and `UrlChange` says when that steps back versus clears in place. `attach()` follows the URL.                                                                                                              |
| `createHistoryAdapter`     | `() => UrlAdapter`                                                                                        | Default adapter over the History API. Globals touched lazily — safe to import during SSR/prerender.                                                                                                                                                                                                                                                                                                                                                                                  |
| `indexCodec`               | `UrlCodec<number>`                                                                                        | Reads `?photo=3` as slide 3. The default codec — pass it to opt into index derivation without writing your own.                                                                                                                                                                                                                                                                                                                                                                      |
| `createIndexLocator`       | `(countGetter: () => number) => UrlLocator<number>`                                                       | Default index locator: maps a slide position to itself, bounded by the live count the getter returns. An out-of-range index resolves to `null` so a stale `?photo=99` self-heals out of the URL — it rejects, never coerces to the nearest slide. A getter, not a number, so the bound reads the current size at lookup time (a paginated gallery grows).                                                                                                                            |
| `urlIndexKey`              | `(countGetter: () => number, locateAsync?: (index: number) => Promise<number \| null>) => UrlKey<number>` | The matched `{ codec: indexCodec, locator: createIndexLocator(countGetter) }` pair for an index-addressed gallery. Spread it — `{ param, ...urlIndexKey(() => count) }` — so the codec cannot drift from the locator. Pass a second `locateAsync` arg to window a paginated feed: page up to the wanted index on a miss, then return it (re-bounded against the grown count).                                                                                                        |
| `urlIndexTwoAxisKey`       | `(opts) => UrlKey<TwoAxisIdentity, TwoAxisPosition>`                                                      | Like `urlIndexKey` but for a two-axis player: one strictly-dotted `?p=<outer>.<inner>` parameter resolving to a `TwoAxisPosition` `{ outer, inner }`. Options (`UrlIndexTwoAxisKeyOptions`): `outerCount`, `innerCounts`, optional `outerCodec`/`outerLocator` for the outer axis, and `innerCodec`/`innerLocate`/`innerIdentify` to address the inner axis by id too. Each axis defaults to a plain index bound. Powers the URL-driven stories player.                              |
| `createStableIdCodec`      | `(hashCodec?: UrlCodec<string>) => UrlCodec<string>`                                                      | The stable-id **wire**, exported for composing — the param text is the item's `id`, written raw or transformed by `hashCodec` (pass `base64UrlCodec` for reversible base64url). The stable-id analog of `indexCodec`: pair it with a locator of your own instead of taking the whole `urlStableIdKey`.                                                                                                                                                                               |
| `base64UrlCodec`           | `UrlCodec<string>`                                                                                        | The ready-made hash mechanism for a stable-id key: reversible base64url (URL-safe alphabet, no padding, UTF-8) — NOT a cryptographic hash. Pass it as `hashCodec` to obscure the id in the URL, or implement your own `UrlCodec<string>` to plug in a different scheme.                                                                                                                                                                                                              |
| `createStableIdLocator`    | `(items: () => T[], locateAsync?: (id: string) => Promise<number \| null>) => UrlLocator<string, number>` | The stable-id **lookup**, exported for composing — scans `items()` for a matching `id`; a gone id resolves to `null` and self-heals. Optional `locateAsync` windows a paginated feed. The stable-id analog of `createIndexLocator`.                                                                                                                                                                                                                                                  |
| `urlStableIdKey`           | `(opts) => UrlKey<string, number>`                                                                        | Addresses a gallery by each item's stable `id` — `?photo=<id>` — instead of its position, so a bookmark survives the list being reordered. Options (`UrlStableIdKeyOptions`): `items` (a live getter), optional `hashCodec` (pass `base64UrlCodec`) to transform the id on the wire, optional `locateAsync` to window a paginated feed (fetch until the id is present on a miss, then return its index). Prefer over `urlIndexKey` whenever the list can change under a shared link. |
| `urlStableIdTwoAxisKey`    | `(opts) => UrlKey<TwoAxisIdentity<string>, TwoAxisPosition>`                                              | The two-axis analog: the outer axis by stable id, the inner by a local index — `?story=user_42.3`. Supply `innerItems` instead of `innerCounts` to address the inner by id too (`?story=user_42.photo_7`); `hashCodec` (e.g. `base64UrlCodec`) transforms both ids. Options: `UrlStableIdTwoAxisKeyOptions` (index inner) or `UrlStableIdTwoAxisIdInnerOptions` (id inner); item types satisfy `Identified` (`{ id: string }`).                                                      |
| `UrlCodec<Id>`             | `{ decode(raw) => Id \| null; encode(id) => string }`                                                     | WIRE format: param text ↔ a stable identity. Collection-blind. `decode` returning `null` = malformed text.                                                                                                                                                                                                                                                                                                                                                                          |
| `UrlLocator<Id>`           | `{ locate(id) => number \| null; locateAsync?(id) => Promise<...>; identify(index) => id }`               | LOOKUP: where the identity sits in the collection. `locate` sync, `locateAsync` its async fallback, `identify` for writes.                                                                                                                                                                                                                                                                                                                                                           |
| `UrlKey<Id>`               | `{ codec: UrlCodec<Id>; locator: UrlLocator<Id> }`                                                        | The matched codec + locator pair for one parameter. They share `Id` and always travel together, so building them as a pair is what keeps them from disagreeing.                                                                                                                                                                                                                                                                                                                      |
| `UrlAdapter`               | `{ read, subscribe, push, replace, getState, goBack }`                                                    | Injection point for a router. Routed apps must supply one, or the router's location goes stale. The `subscribe` listener accepts an optional `UrlChange`; calling it with nothing is always valid and means the adapter cannot say how the entry came to be current.                                                                                                                                                                                                                 |
| `UrlChange`                | `{ kind?: 'push' \| 'replace' \| 'pop' }`                                                                 | What an adapter knows about the navigation that just landed. Report `push` only for a navigation the router itself made on the same page — the one case where closing may pop the entry. With no evidence the entry is never claimed and closing clears the parameter in place, leaving a duplicate of the page in history rather than risking a step off the site.                                                                                                                  |
| `UrlStateOptions<Id>`      | `{ param: string; adapter?: UrlAdapter; codec?: UrlCodec<Id>; locator?: UrlLocator<Id> }`                 | The options `createUrlStateController` takes — exported so a consumer can type a config assembled separately before handing it over.                                                                                                                                                                                                                                                                                                                                                 |

First write of an absent param **pushes** one entry; later writes **replace** it. Closing an entry it pushed steps back; closing a param that arrived with the page removes it in place (never navigates off-site).

### Deriving an index

Two axes, each one responsibility. `codec` is the **wire** — param text ↔ a stable identity, collection-blind. `locator` is the **lookup** — where that identity sits in the collection. The controller runs `decode` then `locate`, applies the open/close latch, self-heals a param that names no slide, and discards a stale async answer — once, for every binding. Without a `codec` or `locator` it reports `value` only and leaves `position` at `null`.

```ts
// Integer default: the identity IS the index, so no locator.
const photo = createUrlStateController({ param: 'photo', codec: indexCodec });
photo.attach();
photo.position.value; // 3 for ?photo=3, null for ?photo=bogus (param is dropped)
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

While something is open, `position` holds the position it opened at and stops following the URL — the slider owns the position from there and the URL trails it.

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

## Viewed State

Persist how far a viewer got, keyed the same way the address bar is: an entry is the parameter text itself, read back through the same `codec` and `locator`. Concepts and examples live in the [Core Guide](https://reelkit.dev/docs/core/guide#viewed-state).

| Export                        | Type                                                                                 | Description                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createViewedStateController` | `(options) => ViewedStateController<Pos>`                                            | Options: `storageKey`, the `codec`/`locator` pair, optional `storage`, `trackOf` (one entry per group), `progressOf`. Reads nothing until `attach()`.                                                                                                                                                                     |
| `twoAxisViewedTracking`       | `{ trackOf, progressOf }`                                                            | Tracking pair for a two-axis player: one entry per outer slot, inner index as progress                                                                                                                                                                                                                                    |
| `createLocalStorageAdapter`   | `() => StorageAdapter`                                                               | Default backing. Also `createSessionStorageAdapter`, `createMemoryStorageAdapter`. Each absorbs its own failures.                                                                                                                                                                                                         |
| `ViewedStateController<Pos>`  | `{ entries; resolve(track); record(position); forget(track?); attach() }`            | `entries` is a signal of track → stored text; `resolve` runs the full key cycle per call                                                                                                                                                                                                                                  |
| `StorageAdapter`              | `{ read(key); write(key, value); subscribe?(key, listener) }`                        | Injection point for a storage layer. No `subscribe` = no cross-tab synchronisation.                                                                                                                                                                                                                                       |
| `ViewedStateOptions<Id, Pos>` | `{ storageKey; codec; locator; storage?; trackOf?; progressOf; ttlMs?; maxTracks? }` | The options `createViewedStateController` takes, exported for typing a config assembled separately. `progressOf` is optional only for a plain index position; any other position must supply it, and the type says so. `maxTracks` keeps at most that many tracks, dropping the least recently recorded on the next write |

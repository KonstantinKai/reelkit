---
title: Vue API Reference
url: https://reelkit.dev/docs/vue/api
section: Vue
order: 2
desc: Complete reference for @reelkit/vue components, props, emits, exposed methods, ReelIndicator, useSwipeToClose, useOverlayUrlState, and provide/inject context shape.
---

# Vue API Reference

Reference for `@reelkit/vue` components, props, emits, exposed methods.

## Reel Props

Type: `ReelProps`

| Prop                  | Type                               | Default                     | Description                                                                                                          |
| --------------------- | ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `count`               | `number`                           | required                    | Total slide count                                                                                                    |
| `direction`           | `'vertical' \| 'horizontal'`       | `'vertical'`                | Scroll direction                                                                                                     |
| `size`                | `[number, number] \| undefined`    | `undefined`                 | Width, height. Omit → auto-measure via ResizeObserver                                                                |
| `initialIndex`        | `number`                           | `0`                         | Start slide index                                                                                                    |
| `loop`                | `boolean`                          | `false`                     | Infinite loop                                                                                                        |
| `transition`          | `TransitionTransformFn`            | `slideTransition`           | Transition fn. Built-in: `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`   |
| `transitionDuration`  | `number`                           | `300`                       | Animation duration ms                                                                                                |
| `swipeDistanceFactor` | `number`                           | `0.12`                      | Swipe threshold (0-1)                                                                                                |
| `enableGestures`      | `boolean`                          | `true`                      | Touch/mouse drag nav                                                                                                 |
| `enableNavKeys`       | `boolean`                          | `true`                      | Keyboard arrow nav                                                                                                   |
| `enableWheel`         | `boolean`                          | `false`                     | Mouse wheel nav                                                                                                      |
| `wheelDebounceMs`     | `number`                           | `200`                       | Wheel debounce ms                                                                                                    |
| `rangeExtractor`      | `(index, count) => number[]`       | `defaultRangeExtractor`     | Custom fn pick rendered indexes                                                                                      |
| `keyExtractor`        | `(index, indexInRange) => string`  | `index => index.toString()` | Custom key fn (useful w/ loop)                                                                                       |
| `ariaLabel`           | `string`                           | `undefined`                 | Accessible label for carousel region                                                                                 |
| `reelStyle`           | `Record<string, string \| number>` | `undefined`                 | Inline styles on root                                                                                                |
| `reelClass`           | `string \| Array \| Object`        | `undefined`                 | CSS class(es) on root                                                                                                |
| `onNavKeyPress`       | `(increment: -1 \| 1) => void`     | `undefined`                 | Replace default ArrowUp/ArrowDown nav. Provided → implement own nav (e.g. `reelRef.value.next()`). Omit for default. |

## Reel Emits

| Event               | Payload                            | Description                 |
| ------------------- | ---------------------------------- | --------------------------- |
| `beforeChange`      | `(index, nextIndex, indexInRange)` | Before slide transition     |
| `afterChange`       | `(index, indexInRange)`            | After slide transition done |
| `slideDragStart`    | `(index)`                          | Drag gesture start          |
| `slideDragEnd`      | `(index)`                          | Drag gesture end (released) |
| `slideDragCanceled` | `(index)`                          | Drag canceled (snap-back)   |
| `tap`               | `(event: GestureCommonEvent)`      | Single tap                  |
| `doubleTap`         | `(event: GestureCommonEvent)`      | Double tap                  |
| `longPress`         | `(event: GestureCommonEvent)`      | Long press start            |
| `longPressEnd`      | `(event: GestureEvent)`            | Long press end              |

## Reel Exposed Methods (via template ref)

| Method                  | Type                                  | Description                                  |
| ----------------------- | ------------------------------------- | -------------------------------------------- |
| `next()`                | `() => void`                          | Next slide                                   |
| `prev()`                | `() => void`                          | Prev slide                                   |
| `goTo(index, animate?)` | `(number, boolean?) => Promise<void>` | Nav to slide index                           |
| `adjust()`              | `() => void`                          | Recalc slide positions (after layout change) |
| `observe()`             | `() => void`                          | Start gesture/keyboard/wheel listeners       |
| `unobserve()`           | `() => void`                          | Stop gesture/keyboard/wheel listeners        |

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<ReelExpose | null>(null);
</script>

<template>
  <Reel ref="reelRef" :count="10" :size="[400, 600]">
    <template #item="{ index, size }">…</template>
  </Reel>
  <button @click="reelRef?.next()">Next</button>
</template>
```

## ReelIndicator Props

Type: `ReelIndicatorProps`

| Prop             | Type                         | Default                      | Description                                                                                    |
| ---------------- | ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `count`          | `number \| undefined`        | auto                         | Total items. Auto-connect from parent Reel context when nested; pass explicit when standalone  |
| `active`         | `number \| undefined`        | auto                         | Active index. Auto-connect from parent Reel context when nested; pass explicit when standalone |
| `direction`      | `'vertical' \| 'horizontal'` | `'vertical'`                 | Indicator orientation                                                                          |
| `radius`         | `number`                     | `3`                          | Dot radius px                                                                                  |
| `visible`        | `number`                     | `5`                          | Max normal-sized dots visible                                                                  |
| `gap`            | `number`                     | `4`                          | Dot spacing px                                                                                 |
| `activeColor`    | `string`                     | `'#fff'`                     | Active dot color                                                                               |
| `inactiveColor`  | `string`                     | `'rgba(255, 255, 255, 0.5)'` | Inactive dot color                                                                             |
| `edgeScale`      | `number`                     | `0.5`                        | Scale for edge overflow dots                                                                   |
| `onDotClick`     | `(index: number) => void`    | `undefined`                  | Custom click handler. Omit inside Reel → defaults to nav to clicked dot                        |
| `indicatorClass` | `string \| Array \| Object`  | `undefined`                  | CSS class(es) on tablist root                                                                  |
| `indicatorStyle` | `CSSProperties`              | `undefined`                  | Inline styles merged into tablist root                                                         |

## ReelIndicator Emits

| Event      | Payload           | Description                     |
| ---------- | ----------------- | ------------------------------- |
| `dotClick` | `(index: number)` | Dot clicked; provides dot index |

## useSwipeToClose Props (composable)

For overlay packages dismissed via vertical swipe. The `<SwipeToClose>` component wraps its default slot in a touch-aware container that can be swiped to dismiss.

Type: `SwipeToCloseProps` (`direction` is a `SwipeToCloseDirection`)

| Prop        | Type             | Default  | Description                                                                           |
| ----------- | ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `direction` | `'up' \| 'down'` | required | Swipe direction triggers close. `'up'` = lightbox dismiss, `'down'` = stories dismiss |
| `enabled`   | `boolean`        | `true`   | Swipe-to-close active                                                                 |
| `threshold` | `number`         | `0.2`    | Fraction viewport height needed to trigger close (0-1)                                |

## useSwipeToClose Emits

| Event   | Payload | Description                               |
| ------- | ------- | ----------------------------------------- |
| `close` | `()`    | Swipe exceeds threshold + close anim done |

## useOverlayUrlState (composable)

Builds a URL-state controller for an overlay, which you hand to a `*UrlOverlay` as its `:controller` prop.

Walkthrough + examples: [URL State in the Vue guide](/docs/vue/guide#url-state).

Type: `OverlayUrlStateOptions`

| Option    | Type                                                                                        | Default     | Description                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `param`   | `string`                                                                                    | required    | Query parameter carrying the active slide, e.g. `photo`.                                                                                                                                                                                                                                                                                                                        |
| `adapter` | `UrlAdapter`                                                                                | History API | Navigation system to read/write through. Pass a router-backed adapter in a routed app so the router's location does not go stale.                                                                                                                                                                                                                                               |
| `codec`   | `{ decode(raw) => Id \| null; encode(id) => string }`                                       | required    | Wire format: param text ↔ a stable identity. Travels with `locator` as a matched pair sharing the same `Id` — spread `...indexKey(() => props.images.length)` for the default `?photo=3` index gallery, or supply your own (base64, slug) so a bookmark survives reordering.                                                                                                   |
| `locator` | `{ locate(id) => number \| null; locateAsync?(id) => Promise<...>; identify(index) => id }` | required    | Maps the identity to a position and owns its own validity: `locate` (sync), `locateAsync` (async fallback for a paginated gallery), `identify` (writes). For a plain index gallery spread `...indexKey(() => props.images.length)` — it supplies this locator plus the matching codec and bounds `?photo=3` against the live count so a stale `?photo=99` heals out of the URL. |

## Provide/Inject Context (`RK_REEL_KEY`)

`RK_REEL_KEY` is an `InjectionKey<ReelContextValue>` that `<Reel>` provides to its descendants. Used internally by `<ReelIndicator>` for auto-connect. Call `useReelContext()` in custom components that need slider context.

Type: `ReelContextValue`

| Property | Type                                                  | Description                  |
| -------- | ----------------------------------------------------- | ---------------------------- |
| `index`  | `Signal<number>`                                      | Reactive current slide index |
| `count`  | `Signal<number>`                                      | Reactive total item count    |
| `goTo`   | `(index: number, animate?: boolean) => Promise<void>` | Programmatic nav to slide    |

```vue
<script setup lang="ts">
import { useReelContext } from '@reelkit/vue';

const ctx = useReelContext();
// ctx?.index.value, ctx?.count.value, ctx?.goTo(5, true)
</script>

<template>
  <span>{{ ctx?.index.value }}</span>
</template>
```

## Composables

- `useReelContext()` — injects the `ReelContextValue` provided by an ancestor `<Reel>` via `RK_REEL_KEY`.
- `useBodyLock(locked)` — locks document body scroll while `locked` is `true`. Accepts `Ref<boolean> | boolean`. Reference-counted so concurrent callers lock/unlock independently; unlocks automatically on unmount.
- `useFullscreen(options)` — manages the Fullscreen API with cross-browser support; exits fullscreen automatically on unmount. Takes `UseFullscreenOptions` (`elementRef`) and returns `UseFullscreenReturn`: `isFullscreen` (`Signal<boolean>`), `request()`, `exit()`, `toggle()`.
- `useSoundState()` — reads the current `SoundController` from context. Must be called inside a `<SoundProvider>`; throws when called outside.

## SoundProvider

`<SoundProvider>` creates a `SoundController` instance and provides it to descendants via `RK_SOUND_KEY`. Renders its default slot transparently.

```vue
<script setup lang="ts">
import { Reel, SoundProvider } from '@reelkit/vue';

const items = [];
</script>

<template>
  <SoundProvider>
    <Reel :count="items.length">
      <template #item="{ index }">
        <VideoSlide :index="index" />
      </template>
      <MuteButton />
    </Reel>
  </SoundProvider>
</template>
```

## Helpers re-exported from core

`@reelkit/vue` re-exports core helpers for SSR-safe use in Vue:

- `Signal`, `ComputedSignal`, `createSignal`, `createComputed`, `reaction`, `batch`
- `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`
- `defaultRangeExtractor`
- `createDefaultKeyExtractorForLoop` — key extractor that handles duplicate indexes when `loop` is enabled
- `captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`
- `hasRenderedNodes` — Vue slot helper, detect rendered children before fallback to default

## Vue Reactive Bridges

- `toVueRef(signal)` — wrap core `Signal` as Vue `Ref` (re-exported from `@reelkit/vue`). Needed when reading signals in templates so updates trigger re-render.

```vue
<script setup lang="ts">
import { toVueRef } from '@reelkit/vue';

const indexRef = toVueRef(reelRef.value!.controller.state.index);
</script>

<template>
  <span>Index: {{ indexRef }}</span>
</template>
```

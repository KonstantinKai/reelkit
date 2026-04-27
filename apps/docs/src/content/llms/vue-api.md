---
title: Vue API Reference
url: https://reelkit.dev/docs/vue/api
section: Vue
order: 2
desc: Complete reference for @reelkit/vue components, props, emits, exposed methods, ReelIndicator, useSwipeToClose, and provide/inject context shape.
---

# Vue API Reference

Reference for `@reelkit/vue` components, props, emits, exposed methods.

## Reel Props

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

For overlay packages dismissed via vertical swipe.

| Prop        | Type             | Default  | Description                                                                           |
| ----------- | ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `direction` | `'up' \| 'down'` | required | Swipe direction triggers close. `'up'` = lightbox dismiss, `'down'` = stories dismiss |
| `enabled`   | `boolean`        | `true`   | Swipe-to-close active                                                                 |
| `threshold` | `number`         | `0.2`    | Fraction viewport height needed to trigger close (0-1)                                |

## useSwipeToClose Emits

| Event   | Payload | Description                               |
| ------- | ------- | ----------------------------------------- |
| `close` | `()`    | Swipe exceeds threshold + close anim done |

## Provide/Inject Context (`reelContextKey`)

`<Reel>` parent provides reactive context children inject:

| Property | Type                                                  | Description                  |
| -------- | ----------------------------------------------------- | ---------------------------- |
| `index`  | `Signal<number>`                                      | Reactive current slide index |
| `count`  | `Signal<number>`                                      | Reactive total item count    |
| `goTo`   | `(index: number, animate?: boolean) => Promise<void>` | Programmatic nav to slide    |

```vue
<script setup lang="ts">
import { inject } from 'vue';
import { reelContextKey } from '@reelkit/vue';

const ctx = inject(reelContextKey);
// ctx?.index.value, ctx?.count.value, ctx?.goTo(5)
</script>
```

## Helpers re-exported from core

`@reelkit/vue` re-exports core helpers for SSR-safe use in Vue:

- `Signal`, `ComputedSignal`, `createSignal`, `createComputed`, `reaction`, `batch`
- `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`
- `defaultRangeExtractor`
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

# @reelkit/vue

<p>
  <a href="https://www.npmjs.com/package/@reelkit/vue"><img src="https://img.shields.io/npm/v/@reelkit/vue?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-5.1%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-92%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://vue-demo.reelkit.dev/?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/slider.gif" width="240" alt="A bare vertical slider of 10,000 items on a phone: two swipes up move the counter from 1 to 3, a swipe sideways pages the slider nested in item 3, typing 5000 and tapping Go jumps straight to item 5,000, and a jump back returns to item 1." /></a>
</p>

Vue 3 bindings for `@reelkit/core`. Drop in a `<Reel>` component, give it a slide count and an item slot — it handles virtualization, gestures, and keyboard/wheel input. ~5.1 kB gzip.

**[Live Demo](https://vue-demo.reelkit.dev/?utm_source=npm)** · **[Open in StackBlitz](https://stackblitz.com/github/KonstantinKai/reelkit-vue-starter)**

## Installation

```bash
npm install @reelkit/vue
```

## Quick Start

```vue
<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';
</script>

<template>
  <Reel :count="100" direction="vertical" enable-wheel>
    <template #item="{ index, size }">
      <div :style="{ width: `${size[0]}px`, height: `${size[1]}px` }">
        Slide {{ index + 1 }}
      </div>
    </template>

    <!-- Auto-connects to parent Reel via context -->
    <ReelIndicator />
  </Reel>
</template>
```

## Features

- `<Reel>` — virtualized slider, keeps only 3 slides in the DOM
- `<ReelIndicator>` — dot indicators that auto-connect to the parent `<Reel>` via provide/inject
- Measures its own size via ResizeObserver — no width/height props needed
- Swipe with momentum and snap, keyboard arrows, mouse wheel
- Loop mode for infinite circular scrolling
- Tree-shakeable transitions (slide, cube, fade, flip, zoom)
- Overlay building blocks — `SwipeToClose`, `SoundProvider`, `useFullscreen`, `useBodyLock`, `useOverlayUrlState`
- Full WAI-ARIA carousel accessibility
- Typed with TypeScript, no `@types` package needed

## API

### Reel Props

| Prop                  | Type                         | Default      | Description                   |
| --------------------- | ---------------------------- | ------------ | ----------------------------- |
| `count`               | `number`                     | required     | Number of slides              |
| `direction`           | `'horizontal' \| 'vertical'` | `'vertical'` | Slide direction               |
| `initialIndex`        | `number`                     | `0`          | Starting slide index          |
| `loop`                | `boolean`                    | `false`      | Enable infinite loop          |
| `swipeDistanceFactor` | `number`                     | `0.12`       | Swipe threshold (0-1)         |
| `transitionDuration`  | `number`                     | `300`        | Animation duration in ms      |
| `enableNavKeys`       | `boolean`                    | `true`       | Enable keyboard navigation    |
| `enableWheel`         | `boolean`                    | `false`      | Enable mouse wheel navigation |
| `wheelDebounceMs`     | `number`                     | `200`        | Wheel debounce duration       |
| `enableGestures`      | `boolean`                    | `true`       | Enable touch/mouse gestures   |
| `transition`          | `TransitionTransformFn`      | slide        | Transition effect function    |
| `size`                | `[number, number]`           | auto         | Explicit `[width, height]`    |

### Reel Events

| Event          | Payload                     | Description         |
| -------------- | --------------------------- | ------------------- |
| `afterChange`  | `index, indexInRange`       | After slide change  |
| `beforeChange` | `index, nextIndex, inRange` | Before slide change |
| `tap`          | `GestureCommonEvent`        | Single tap          |
| `doubleTap`    | `GestureCommonEvent`        | Double tap          |
| `longPress`    | `GestureCommonEvent`        | Long press detected |
| `longPressEnd` | `GestureEvent`              | Long press released |

### ReelIndicator Props

| Prop         | Type                         | Default      | Description                  |
| ------------ | ---------------------------- | ------------ | ---------------------------- |
| `count`      | `number`                     | context      | Total number of slides       |
| `active`     | `number`                     | context      | Currently active slide index |
| `direction`  | `'horizontal' \| 'vertical'` | `'vertical'` | Dot axis                     |
| `radius`     | `number`                     | `3`          | Dot radius in pixels         |
| `visible`    | `number`                     | `5`          | Number of visible dots       |
| `gap`        | `number`                     | `4`          | Space between dots           |
| `onDotClick` | `(index) => void`            | -            | Callback when dot is clicked |

### Composables

| Composable           | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `useBodyLock`        | Lock body scroll for overlays                                               |
| `useFullscreen`      | Fullscreen API with cross-browser support                                   |
| `useSoundState`      | Access sound controller from `SoundProvider`                                |
| `useReelContext`     | Access parent Reel's index, count, and goTo                                 |
| `useOverlayUrlState` | Keeps the open overlay and its slide in the URL, so a link reopens the view |

`toVueRef` wraps a core `Signal` as a Vue ref — reading `signal.value` straight
in a template compiles to a static snapshot that never updates.

### Components

| Component       | Description                             |
| --------------- | --------------------------------------- |
| `SwipeToClose`  | Swipe-to-dismiss wrapper for overlays   |
| `SoundProvider` | Provides shared sound mute/unmute state |

## Documentation

Guide at **[reelkit.dev/docs/vue/guide](https://reelkit.dev/docs/vue/guide?framework=vue)**, full API reference at **[reelkit.dev/docs/vue/api](https://reelkit.dev/docs/vue/api?framework=vue)**.

## Contributing

Issues and pull requests are welcome. The [contributing guide](https://github.com/KonstantinKai/reelkit/blob/main/CONTRIBUTING.md) covers setting up the workspace, making a change, and what a pull request needs.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

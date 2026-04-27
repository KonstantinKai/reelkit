---
title: Vue Lightbox
url: https://reelkit.dev/docs/vue-lightbox
section: Vue
order: 4
desc: Full-screen image gallery lightbox overlay for Vue 3. LightboxItem schema, props, emits, scoped slots, transitions, swipe-to-close, theming shared with React lightbox.
---

# Vue Lightbox

Full-screen image gallery lightbox overlay Vue 3. CSS classes + theming tokens identical `@reelkit/react-lightbox` (prefix `--rk-lightbox-*`, classes `.rk-lightbox-*`).

## Install

```bash
npm install @reelkit/vue-lightbox
```

```ts
import { RkLightboxOverlay } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { RkLightboxOverlay } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const isOpen = ref(false);
const initialIndex = ref(0);

const items = [
  {
    src: '/img1.jpg',
    title: 'Mountain',
    description: 'River through forest',
    width: 1600,
    height: 1000,
  },
  { src: '/img2.jpg', title: 'Snow', width: 1000, height: 1600 },
];
</script>

<template>
  <button
    v-for="(item, i) in items"
    :key="i"
    @click="
      initialIndex = i;
      isOpen = true;
    "
  >
    <img :src="item.src" />
  </button>

  <RkLightboxOverlay
    v-model:is-open="isOpen"
    :items="items"
    :initial-index="initialIndex"
    transition="slide"
  />
</template>
```

## LightboxItem Schema

| Field         | Type                 | Required | Description                  |
| ------------- | -------------------- | -------- | ---------------------------- |
| `src`         | `string`             | yes      | URL of image or video        |
| `type`        | `'image' \| 'video'` | no       | Item type. Default `'image'` |
| `poster`      | `string`             | no       | Thumbnail for video items    |
| `title`       | `string`             | no       | Title in info overlay        |
| `description` | `string`             | no       | Description below title      |
| `width`       | `number`             | no       | Intrinsic image width px     |
| `height`      | `number`             | no       | Intrinsic image height px    |

## RkLightboxOverlay Props

| Prop                    | Type                                       | Default           | Description                                                                            |
| ----------------------- | ------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------- |
| `isOpen`                | `boolean`                                  | required          | Controls visibility; false = overlay removed from DOM. Bindable via `v-model:is-open`. |
| `items`                 | `LightboxItem[]`                           | required          | Items array (images or videos)                                                         |
| `initialIndex`          | `number`                                   | `0`               | Zero-based index of initial item                                                       |
| `transition`            | `'slide' \| 'fade' \| 'flip' \| 'zoom-in'` | `'slide'`         | Built-in transition alias. Maps to `TransitionTransformFn` internally.                 |
| `transitionFn`          | `TransitionTransformFn`                    | `undefined`       | Custom transition fn. Overrides alias.                                                 |
| `showInfo`              | `boolean`                                  | `true`            | Render title/description info overlay                                                  |
| `showControls`          | `boolean`                                  | `true`            | Render top controls bar (close, counter, fullscreen)                                   |
| `showNavigation`        | `boolean`                                  | `true`            | Render prev/next nav arrows (desktop only)                                             |
| `transitionDuration`    | `number`                                   | `300`             | Slide animation duration ms                                                            |
| `swipeDistanceFactor`   | `number`                                   | `0.12`            | Min swipe distance fraction (0–1) trigger slide change                                 |
| `swipeToCloseDirection` | `'up' \| 'down'`                           | `'up'`            | Swipe-to-close gesture direction mobile                                                |
| `loop`                  | `boolean`                                  | `false`           | Slider wraps last → first                                                              |
| `enableNavKeys`         | `boolean`                                  | `true`            | Keyboard arrow-key nav                                                                 |
| `enableWheel`           | `boolean`                                  | `true`            | Mouse-wheel nav                                                                        |
| `wheelDebounceMs`       | `number`                                   | `200`             | Wheel debounce ms                                                                      |
| `ariaLabel`             | `string`                                   | `'Image gallery'` | Accessible label dialog region                                                         |

## Emits

| Event            | Payload       | Description                          |
| ---------------- | ------------- | ------------------------------------ |
| `close`          | `void`        | User closes lightbox                 |
| `slide-change`   | `number`      | New active slide index after change  |
| `api-ready`      | `LightboxApi` | Slider ready, exposes imperative API |
| `update:is-open` | `boolean`     | On close; enables `v-model:is-open`  |

## Scoped Slots

| Slot         | Scope                 | Description                                           |
| ------------ | --------------------- | ----------------------------------------------------- |
| `slide`      | `SlideSlotScope`      | Replace slide content (required for video)            |
| `controls`   | `ControlsSlotScope`   | Replace top controls bar (close, counter, fullscreen) |
| `navigation` | `NavigationSlotScope` | Replace prev/next nav arrows                          |
| `info`       | `InfoSlotScope`       | Replace bottom title/description gradient overlay     |
| `loading`    | `LoadingSlotScope`    | Custom loading indicator                              |
| `error`      | `ErrorSlotScope`      | Custom error indicator                                |

### Slot Scope Types

| Name                  | Fields                                                                           |
| --------------------- | -------------------------------------------------------------------------------- |
| `SlideSlotScope`      | `{ item, index, size: [number, number], isActive, onReady, onWaiting, onError }` |
| `ControlsSlotScope`   | `{ item, activeIndex, count, isFullscreen, onClose, onToggleFullscreen }`        |
| `NavigationSlotScope` | `{ item, activeIndex, count, onPrev, onNext }`                                   |
| `InfoSlotScope`       | `{ item, index }`                                                                |
| `LoadingSlotScope`    | `{ item, activeIndex }`                                                          |
| `ErrorSlotScope`      | `{ item, activeIndex }`                                                          |

## Keyboard Shortcuts

| Key          | Action                                        |
| ------------ | --------------------------------------------- |
| `ArrowLeft`  | Previous image                                |
| `ArrowRight` | Next image                                    |
| `Escape`     | Close lightbox (or exit fullscreen if active) |

## CSS Theming

Tokens + classes shared w/ `@reelkit/react-lightbox`. See [Lightbox](/docs/lightbox) full reference. Token prefix `--rk-lightbox-*`, class prefix `.rk-lightbox-*`.

## Custom Slot Examples

### `#controls`

```vue
<template>
  <RkLightboxOverlay v-model:is-open="isOpen" :items="items">
    <template
      #controls="{
        activeIndex,
        count,
        isFullscreen,
        onClose,
        onToggleFullscreen,
      }"
    >
      <button @click="onClose">×</button>
      <span>{{ activeIndex + 1 }} / {{ count }}</span>
      <button @click="onToggleFullscreen">
        {{ isFullscreen ? '⤡' : '⤢' }}
      </button>
    </template>
  </RkLightboxOverlay>
</template>
```

### `#slide` for video items

```vue
<template>
  <RkLightboxOverlay v-model:is-open="isOpen" :items="items">
    <template #slide="{ item, size, isActive, onReady, onError }">
      <video
        v-if="item.type === 'video'"
        :src="item.src"
        :poster="item.poster"
        :width="size[0]"
        :height="size[1]"
        :autoplay="isActive"
        muted
        playsinline
        @canplay="onReady"
        @error="onError"
      />
      <img v-else :src="item.src" @load="onReady" @error="onError" />
    </template>
  </RkLightboxOverlay>
</template>
```

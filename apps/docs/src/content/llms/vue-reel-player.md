---
title: Vue Reel Player
url: https://reelkit.dev/docs/vue-reel-player
section: Vue
order: 3
desc: Full-screen TikTok/Reels-style video reel player overlay for Vue 3. ContentItem schema, props, emits, scoped slots, theming tokens, CSS classes shared with React reel-player.
---

# Vue Reel Player

Full-screen TikTok/Reels-style video reel player overlay Vue 3. CSS classes + theming tokens identical `@reelkit/react-reel-player` (prefix `--rk-reel-*`, classes `.rk-reel-*`).

## Install

```bash
npm install @reelkit/vue-reel-player
```

```ts
import { RkReelPlayerOverlay } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { RkReelPlayerOverlay } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

const isOpen = ref(false);
const initialIndex = ref(0);

const content = [
  {
    id: '1',
    media: [
      {
        id: 'v1',
        type: 'video',
        src: '/v1.mp4',
        poster: '/p1.jpg',
        aspectRatio: 16 / 9,
      },
    ],
    author: { name: 'Alex', avatar: '/a1.jpg' },
    likes: 1234,
    description: 'Sunset',
  },
];
</script>

<template>
  <button
    v-for="(item, i) in content"
    :key="item.id"
    @click="
      initialIndex = i;
      isOpen = true;
    "
  >
    <img :src="item.media[0].poster ?? item.media[0].src" />
  </button>

  <RkReelPlayerOverlay
    v-model:is-open="isOpen"
    :content="content"
    :initial-index="initialIndex"
  />
</template>
```

## ContentItem Schema

```ts
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio?: number; // < 1 vertical (cover), ≥ 1 horizontal (contain)
}

interface ContentItem {
  id: string;
  media: MediaItem[];
  author?: { name: string; avatar?: string };
  likes?: number;
  description?: string;
}
```

## RkReelPlayerOverlay Props

| Prop                         | Type                            | Default          | Description                                                          |
| ---------------------------- | ------------------------------- | ---------------- | -------------------------------------------------------------------- |
| `isOpen`                     | `boolean`                       | required         | Controls overlay visibility; false = overlay removed from DOM        |
| `content`                    | `T[] (extends BaseContentItem)` | required         | Array of content items to display                                    |
| `ariaLabel`                  | `string`                        | `'Video player'` | Accessible label for dialog region                                   |
| `aspectRatio`                | `number`                        | `9 / 16`         | Width/height ratio for desktop container. Mobile uses full viewport. |
| `enableNavKeys`              | `boolean`                       | `true`           | Enable keyboard arrow-key navigation                                 |
| `enableWheel`                | `boolean`                       | `true`           | Enable mouse-wheel navigation                                        |
| `initialIndex`               | `number`                        | `0`              | Zero-based index of initial visible item                             |
| `loop`                       | `boolean`                       | `false`          | Enable infinite loop between slides                                  |
| `swipeDistanceFactor`        | `number`                        | `0.12`           | Min swipe distance fraction to trigger slide change                  |
| `timeline`                   | `'auto' \| 'always' \| 'never'` | `'auto'`         | Gating strategy for built-in playback timeline bar                   |
| `timelineMinDurationSeconds` | `number`                        | `30`             | Min video duration (seconds) for `timeline='auto'` to render bar     |
| `transitionDuration`         | `number`                        | `300`            | Slide animation duration ms                                          |
| `wheelDebounceMs`            | `number`                        | `200`            | Debounce duration for wheel events ms                                |

## Emits

| Event            | Payload   | Description                                     |
| ---------------- | --------- | ----------------------------------------------- |
| `api-ready`      | `ReelApi` | Fires once slider ready, exposes imperative API |
| `close`          | `void`    | Fires when player closes                        |
| `slide-change`   | `number`  | Fires with new active slide index after change  |
| `update:is-open` | `boolean` | Fires on close; enables `v-model:is-open`       |

## Scoped Slots

| Slot               | Scope                                                                                                          | Description                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `controls`         | `{ item, soundState, activeIndex, content, onClose }`                                                          | Custom global controls bar (close, sound, share, etc.)                                   |
| `error`            | `{ item, activeIndex, innerActiveIndex }`                                                                      | Custom error indicator (replaces default icon)                                           |
| `loading`          | `{ item, activeIndex, innerActiveIndex }`                                                                      | Custom loading indicator (replaces default wave loader)                                  |
| `navigation`       | `{ item, activeIndex, count, onPrev, onNext }`                                                                 | Custom prev/next navigation arrows (desktop)                                             |
| `nestedNavigation` | `{ media, activeIndex, count, onPrev, onNext }`                                                                | Custom arrows for inner horizontal slider                                                |
| `nestedSlide`      | `{ item, media, index, size, isActive, isInnerActive, slideKey, defaultContent, onReady, onWaiting, onError }` | Custom slide content inside inner horizontal slider                                      |
| `slide`            | `{ item, index, size, isActive, slideKey, defaultContent, onReady, onWaiting, onError }`                       | Fully custom slide content (falls back to default if omitted)                            |
| `slideOverlay`     | `{ item, index, isActive }`                                                                                    | Per-slide overlay (author info, likes, description, etc.)                                |
| `timeline`         | `{ item, activeIndex, timelineState, defaultContent }`                                                         | Custom playback timeline bar. Use `defaultContent()` to wrap built-in `<TimelineBar />`. |

## Keyboard Shortcuts

| Key          | Action                            |
| ------------ | --------------------------------- |
| `ArrowUp`    | Previous slide                    |
| `ArrowDown`  | Next slide                        |
| `ArrowLeft`  | Previous media (in nested slider) |
| `ArrowRight` | Next media (in nested slider)     |
| `Escape`     | Close player                      |

## CSS Theming

CSS custom properties + classes shared with `@reelkit/react-reel-player`. See [Reel Player](/docs/reel-player) for full token + class list. Quick reference:

- Tokens — `--rk-reel-overlay-bg`, `--rk-reel-button-bg`, `--rk-reel-timeline-fill`, etc.
- Classes — `.rk-reel-overlay`, `.rk-reel-button`, `.rk-reel-slide-overlay`, `.rk-reel-timeline`, etc.

## Custom Slot Examples

### `#controls`

```vue
<template>
  <RkReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #controls="{ soundState, onClose }">
      <button @click="onClose">×</button>
      <button @click="soundState.toggle()">
        {{ soundState.isMuted ? '🔇' : '🔊' }}
      </button>
    </template>
  </RkReelPlayerOverlay>
</template>
```

### `#timeline` (wrap built-in bar)

```vue
<template>
  <RkReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #timeline="{ defaultContent }">
      <div class="rk-reel-timeline my-custom-wrapper">
        <component :is="defaultContent()" />
      </div>
    </template>
  </RkReelPlayerOverlay>
</template>
```

### Generic ContentItem

```vue
<script setup lang="ts" generic="T extends ContentItem">
import type { ContentItem } from '@reelkit/vue-reel-player';
defineProps<{ content: T[] }>();
</script>
```

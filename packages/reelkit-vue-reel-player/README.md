# @reelkit/vue-reel-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/vue-reel-player"><img src="https://img.shields.io/npm/v/@reelkit/vue-reel-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-5.9%20kB-6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Instagram Reels / TikTok-style video player for Vue 3. Opens as a full-screen overlay with vertical swipe navigation. Handles video autoplay, sound continuity on iOS, and multi-media posts. ~5.9 kB gzip.

**[Live Demo](https://vue-demo.reelkit.dev/reel-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/vue-reel-player @reelkit/vue lucide-vue-next
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

const isOpen = ref(false);
const content: ContentItem[] = [
  {
    id: '1',
    media: [
      {
        id: 'v1',
        type: 'video',
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
];
</script>

<template>
  <button @click="isOpen = true">Open Player</button>
  <ReelPlayerOverlay
    :is-open="isOpen"
    :content="content"
    @close="isOpen = false"
  />
</template>
```

## Features

- Vertical swipe navigation (touch, mouse, keyboard, wheel)
- Video autoplay with sound toggle
- Multi-media posts with horizontal nested slider
- Instagram-style indicator dots
- Keyboard navigation (Arrow keys, Escape)
- Desktop navigation arrows
- iOS sound continuity via shared `<video>` element
- Video position memory across slide changes

## Scoped Slots

All of the player's UI is customizable via scoped slots:

| Slot               | Scope                                                      |
| ------------------ | ---------------------------------------------------------- |
| `slide`            | `item, index, size, isActive, slideKey, defaultContent, …` |
| `slideOverlay`     | `item, index, isActive`                                    |
| `controls`         | `item, soundState, activeIndex, content, onClose`          |
| `navigation`       | `item, activeIndex, count, onPrev, onNext`                 |
| `nestedSlide`      | `item, media, index, size, isActive, isInnerActive, …`     |
| `nestedNavigation` | `media, activeIndex, count, onPrev, onNext`                |
| `loading`          | `item, activeIndex`                                        |
| `error`            | `item, activeIndex`                                        |

## Props

| Prop                  | Type            | Default  | Description                   |
| --------------------- | --------------- | -------- | ----------------------------- |
| `isOpen`              | `boolean`       | required | Controls overlay visibility   |
| `content`             | `ContentItem[]` | required | Content items to display      |
| `initialIndex`        | `number`        | `0`      | Starting slide index          |
| `aspectRatio`         | `number`        | `9/16`   | Desktop container ratio       |
| `loop`                | `boolean`       | `false`  | Enable infinite loop          |
| `enableNavKeys`       | `boolean`       | `true`   | Enable keyboard navigation    |
| `enableWheel`         | `boolean`       | `true`   | Enable mouse wheel navigation |
| `wheelDebounceMs`     | `number`        | `200`    | Wheel debounce duration (ms)  |
| `transitionDuration`  | `number`        | `300`    | Transition duration (ms)      |
| `swipeDistanceFactor` | `number`        | `0.12`   | Swipe threshold (0-1)         |

## Events

| Event            | Payload   | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `close`          | `void`    | Emitted when player closes                   |
| `slide-change`   | `number`  | Emitted after slide change                   |
| `api-ready`      | `ReelApi` | Emitted with imperative API                  |
| `update:is-open` | `boolean` | Emitted on close — enables `v-model:is-open` |

### `v-model:is-open`

Use it to drive the overlay with a single binding instead of pairing
`:is-open` + `@close`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);
</script>

<template>
  <button @click="open = true">Open</button>
  <ReelPlayerOverlay v-model:is-open="open" :content="content" />
</template>
```

The legacy `:is-open` + `@close` pattern still works.

## Custom content types

`ReelPlayerOverlay` is generic over your content item shape. Extend
`BaseContentItem` to use any data type, and import the slot-scope types
to keep slot bindings strongly typed:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  type BaseContentItem,
  type SlideOverlaySlotScope,
} from '@reelkit/vue-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  category: 'video' | 'photo';
}

const open = ref(false);
const items: MyItem[] = [
  /* ... */
];
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="open" :content="items">
    <template #slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>">
      <div class="my-overlay">
        <h2>{{ item.title }}</h2>
        <span>{{ item.category }}</span>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>
```

The same pattern works for every other slot — import the matching scope
type (`SlideSlotScope`, `ControlsSlotScope`, `NavigationSlotScope`,
`NestedSlideSlotScope`, `LoadingSlotScope`) and annotate the
destructure.

## Keyboard Shortcuts

| Key          | Action                  |
| ------------ | ----------------------- |
| `ArrowUp`    | Previous slide          |
| `ArrowDown`  | Next slide              |
| `ArrowLeft`  | Previous media (nested) |
| `ArrowRight` | Next media (nested)     |
| `Escape`     | Close player            |

## Documentation

Docs and interactive demos at **[reelkit.dev/docs/vue-reel-player](https://reelkit.dev/docs/vue-reel-player)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

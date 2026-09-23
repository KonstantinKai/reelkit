# @reelkit/vue-lightbox

<p>
  <a href="https://www.npmjs.com/package/@reelkit/vue-lightbox"><img src="https://img.shields.io/npm/v/@reelkit/vue-lightbox?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-4.2%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-72%25-yellow" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Full-screen image and video gallery lightbox for Vue 3. Horizontal swipe navigation, fullscreen toggle, opt-in video support, and four built-in transitions. ~4.2 kB gzip.

**[Live Demo](https://vue-demo.reelkit.dev/lightbox?utm_source=npm)**

## Installation

```bash
npm install @reelkit/vue-lightbox @reelkit/vue lucide-vue-next
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const open = ref(false);
const items: LightboxItem[] = [
  {
    src: 'https://example.com/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
];
</script>

<template>
  <button @click="open = true">Open Gallery</button>
  <LightboxOverlay v-model:is-open="open" :items="items" />
</template>
```

## Features

- Horizontal swipe navigation (touch, mouse, keyboard, wheel)
- Tree-shakable transitions — `slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition` (import only what you use)
- Fullscreen toggle with two-step Escape (exit fullscreen → close)
- Swipe-up-to-close on mobile
- Opt-in video support via `useVideoSlideRenderer`
- Desktop prev/next arrows with boundary hiding
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap + return
- Themeable via `--rk-lightbox-*` CSS custom properties
- Shareable URLs — `LightboxUrlOverlay` opens itself from the address bar

## Scoped Slots

| Slot         | Scope                                                                 |
| ------------ | --------------------------------------------------------------------- |
| `slide`      | `item, index, size, isActive, onReady, onWaiting, onError`            |
| `controls`   | `item, activeIndex, count, isFullscreen, onClose, onToggleFullscreen` |
| `navigation` | `item, activeIndex, count, onPrev, onNext`                            |
| `info`       | `item, index`                                                         |
| `loading`    | `item, activeIndex`                                                   |
| `error`      | `item, activeIndex`                                                   |

## Props

| Prop                    | Type                    | Default           | Description                              |
| ----------------------- | ----------------------- | ----------------- | ---------------------------------------- |
| `isOpen`                | `boolean`               | required          | Controls overlay visibility              |
| `items`                 | `LightboxItem[]`        | required          | Images/videos to display                 |
| `initialIndex`          | `number`                | `0`               | Starting slide index                     |
| `ariaLabel`             | `string`                | `'Image gallery'` | Dialog `aria-label`                      |
| `transitionFn`          | `TransitionTransformFn` | `slideTransition` | Slide transition fn (built-in or custom) |
| `swipeToCloseDirection` | `SwipeToCloseDirection` | `'up'`            | Which way a swipe dismisses the lightbox |
| `loop`                  | `boolean`               | `false`           | Enable infinite loop                     |
| `enableNavKeys`         | `boolean`               | `true`            | Arrow-key navigation                     |
| `enableWheel`           | `boolean`               | `true`            | Wheel navigation                         |
| `wheelDebounceMs`       | `number`                | `200`             | Wheel debounce duration (ms)             |
| `transitionDuration`    | `number`                | `300`             | Animation duration (ms)                  |
| `swipeDistanceFactor`   | `number`                | `0.12`            | Swipe threshold (0-1)                    |
| `showInfo`              | `boolean`               | `true`            | Show title/description overlay           |
| `showControls`          | `boolean`               | `true`            | Show controls bar                        |
| `showNavigation`        | `boolean`               | `true`            | Show prev/next arrows on desktop         |

## Events

| Event            | Payload       | Description                                  |
| ---------------- | ------------- | -------------------------------------------- |
| `close`          | `void`        | Emitted when the overlay closes              |
| `slide-change`   | `number`      | Emitted after the active slide changes       |
| `api-ready`      | `LightboxApi` | Emitted with the imperative lightbox API     |
| `update:is-open` | `boolean`     | Emitted on close — enables `v-model:is-open` |

## Video support (opt-in)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const open = ref(false);
const items: LightboxItem[] = [
  { src: '/image.jpg' },
  { type: 'video', src: '/clip.mp4', poster: '/clip.jpg' },
];
const { renderSlide, renderControls, SoundProvider } =
  useVideoSlideRenderer(items);
</script>

<template>
  <SoundProvider>
    <LightboxOverlay v-model:is-open="open" :items="items">
      <template #slide="scope">
        <component :is="renderSlide(scope)" />
      </template>
      <template #controls="scope">
        <component :is="renderControls(scope)" />
      </template>
    </LightboxOverlay>
  </SoundProvider>
</template>
```

## URL-driven lightbox

`LightboxUrlOverlay` takes the same props except `isOpen` — the address bar owns
the open state, so a shared link opens the gallery on the right image:

```vue
<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey } from '@reelkit/vue';
import '@reelkit/vue-lightbox/styles.css';

const props = defineProps<{ images: LightboxItem[] }>();

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => props.images.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink
    v-for="(img, i) in props.images"
    :key="img.src"
    :to="`?photo=${i}`"
  >
    <img :src="img.src" />
  </RouterLink>

  <LightboxUrlOverlay :controller="photo" :items="props.images" />
</template>
```

In a vue-router application pass `adapter: useVueRouterUrlAdapter()` from
`@reelkit/vue/vue-router-url-adapter`, otherwise the router's own location goes
stale. Swap `urlIndexKey` for `urlStableIdKey({ items: () => props.images })` to
key the URL by image id.

## Sub-components

For composing your own controls or slides: `CloseButton`, `Counter`,
`FullscreenButton`, `SoundButton`, `LightboxNavigation`, `ImageSlide`,
`LightboxVideoSlide`.

## Keyboard Shortcuts

| Key          | Action                                               |
| ------------ | ---------------------------------------------------- |
| `ArrowLeft`  | Previous slide                                       |
| `ArrowRight` | Next slide                                           |
| `Escape`     | Exit fullscreen (if active), then close the lightbox |

## Documentation

Docs, runnable StackBlitz examples, and customization guides at **[reelkit.dev/docs/vue-lightbox](https://reelkit.dev/docs/vue-lightbox?framework=vue)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

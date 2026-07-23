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
import { ReelPlayerOverlay } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay } from '@reelkit/vue-reel-player';
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

  <ReelPlayerOverlay
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

interface TimelineBarProps {
  class?: string;
  style?: CSSProperties;
}
```

## ReelPlayerOverlay Props

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

## ReelPlayerUrlOverlay Props

Type: `ReelPlayerUrlOverlayProps`

Takes every `ReelPlayerOverlay` prop except `is-open`, replaced by a `controller`. Emits `close`, `slide-change`, `api-ready` — but no `update:is-open`. `initial-index` is ignored — the controller's index picks the slide, so a value passed alongside it is overwritten on every open.

| Prop         | Type                 | Default  | Description                                                                                                                                                                      |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `useOverlayUrlState`. Its `index` decides whether the overlay is open and which slide it shows; the overlay writes back through it on slide change and on close. |

## Emits

| Event            | Payload         | Description                                     |
| ---------------- | --------------- | ----------------------------------------------- |
| `api-ready`      | `ReelPlayerApi` | Fires once slider ready, exposes imperative API |
| `close`          | `void`          | Fires when player closes                        |
| `slide-change`   | `number`        | Fires with new active slide index after change  |
| `update:is-open` | `boolean`       | Fires on close; enables `v-model:is-open`       |

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

## URL State

`ReelPlayerUrlOverlay` puts the open state in the address bar: build a controller with `useOverlayUrlState` from `@reelkit/vue` and pass it as `controller`. The player opens when the parameter names a slide and closes when it clears — links are shareable and the back button closes it. Opening pushes one history entry and every slide change replaces it, so paging a feed adds no entries and one back step always leaves. The parameter addresses the vertical feed index only; a multi-media post's inner image is not carried in the URL. It is a separate component from `ReelPlayerOverlay`, so each carries exactly one open-state driver.

A routed app passes a router-backed adapter — `useVueRouterUrlAdapter` from `@reelkit/vue/vue-router-url-adapter` — so the router stays the single source of navigation truth.

```vue
<script setup lang="ts">
import {
  ReelPlayerUrlOverlay,
  type ContentItem,
} from '@reelkit/vue-reel-player';
import { useOverlayUrlState, indexKey } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-reel-player/styles.css';

const props = defineProps<{ content: ContentItem[] }>();

const reel = useOverlayUrlState({
  param: 'reel',
  adapter: useVueRouterUrlAdapter(),
  ...indexKey(() => props.content.length),
});
</script>

<template>
  <RouterLink
    v-for="(post, i) in props.content"
    :key="post.id"
    :to="`?reel=${i}`"
  >
    <img :src="post.media[0].src" />
  </RouterLink>

  <ReelPlayerUrlOverlay :controller="reel" :content="props.content" />
</template>
```

Full `useOverlayUrlState` options (`param`, `adapter`, `codec`, `locator`): see the [Vue API reference](/docs/vue/api#useoverlayurlstate).

- Opening pushes **one** history entry. Swiping the feed **replaces** it — N swipes add 0 entries, so one back step always leaves the player. Back closes; it does not step slides.
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay.
- Deep link `?reel=3` opens the player at that slide on load.
- A param naming no slide (stale bookmark, hand-edited) is dropped from the URL instead of leaving the address bar asserting a slide that cannot open.
- The param addresses the **vertical** slide only. Which image a multi-media post is showing is not carried in the URL.

**Stable links.** The index is positional — a bookmarked `?reel=3` opens a different post once the feed is reordered, which for a feed is the normal case rather than the exception. Key by identity instead. Two separate jobs: `codec` spells the identity into the URL (wire), `locator` finds where that identity sits (lookup).

```ts
const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
  },
});
```

**Infinite feeds.** `locate` is synchronous, so it can only answer for posts already loaded — a shared link to post 400 of a feed that has loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have.

```ts
const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      content.value = loaded; // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
```

While `locateAsync` is pending the player stays closed and the param is left alone — the deep link survives the fetch. `null` or a rejection drops the param. An answer that arrives after the URL moved on, after a close, or after unmount is discarded, so a slow fetch cannot open a slide nobody asked for. Nothing is rendered while pending; the page already owns that loading state, so render your own skeleton. There is no timeout — settle with `null` when pagination is exhausted or the overlay stays closed indefinitely.

## Sub-Components

Drop these into custom `#controls`, `#slide`, or `#slideOverlay` templates. Pass dimensions + callbacks through from the slot scope so autoplay, poster capture, and sound sync keep working.

| Component           | Description                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ReelPlayerOverlay` | The full-screen player overlay itself. Mounts a `SoundProvider` and a `TimelineProvider` for its descendants.                                                                                    |
| `CloseButton`       | Standalone circular close button with default reel-player styling. Use inside `#controls`.                                                                                                       |
| `SoundButton`       | Mute/unmute toggle. Render inside a `SoundProvider` (`ReelPlayerOverlay` provides one). Hidden when the active slide has no video.                                                               |
| `TimelineProvider`  | Provides the timeline state read by `TimelineBar` and the `#timeline` slot. Mounted automatically inside `ReelPlayerOverlay`.                                                                    |
| `TimelineBar`       | Default playback scrub bar. Reads the nearest `TimelineProvider` and renders track, buffered ranges, progress fill, and scrub pill. Theme via `--rk-reel-timeline-*` or replace via `#timeline`. |
| `SlideOverlay`      | Default gradient overlay showing author, description, and likes. Renders when content carries those fields. Replace or hide via `#slideOverlay`.                                                 |
| `ImageSlide`        | Image slide with lazy loading and `object-fit: cover` by default. Compose inside `#slide` to customise image rendering while keeping built-in behaviour.                                         |
| `VideoSlide`        | Video slide backed by a shared `<video>` element. Handles iOS sound continuity, poster frames, and position memory. Render inside a `SoundProvider`.                                             |

```vue
<script setup lang="ts">
import {
  CloseButton,
  ImageSlide,
  SoundButton,
  VideoSlide,
} from '@reelkit/vue-reel-player';
</script>

<template>
  <SoundButton />
  <CloseButton :on-click="onClose" />
  <ImageSlide :src="media.src" :size="size" />
  <VideoSlide
    :src="media.src"
    :poster="media.poster"
    :size="size"
    :is-active="isActive"
    :slide-key="slideKey"
  />
</template>
```

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
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #controls="{ soundState, onClose }">
      <button @click="onClose">×</button>
      <button @click="soundState.toggle()">
        {{ soundState.isMuted ? '🔇' : '🔊' }}
      </button>
    </template>
  </ReelPlayerOverlay>
</template>
```

### `#timeline` (wrap built-in bar)

```vue
<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #timeline="{ defaultContent }">
      <div class="rk-reel-timeline my-custom-wrapper">
        <component :is="defaultContent()" />
      </div>
    </template>
  </ReelPlayerOverlay>
</template>
```

### Generic ContentItem

```vue
<script setup lang="ts" generic="T extends ContentItem">
import type { ContentItem } from '@reelkit/vue-reel-player';
defineProps<{ content: T[] }>();
</script>
```

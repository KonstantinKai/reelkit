---
title: Vue Lightbox
url: https://reelkit.dev/docs/vue-lightbox
section: Vue
order: 4
desc: Full-screen image gallery lightbox overlay for Vue 3. LightboxItem schema, props, emits, scoped slots, tree-shakable transitionFn, swipe-to-close, theming shared with React lightbox.
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
import {
  RkLightboxOverlay,
  lightboxFadeTransition,
} from '@reelkit/vue-lightbox';
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
    :transition-fn="lightboxFadeTransition"
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

## Video Support

Video slides are opt-in so the default bundle stays free of audio/video wiring. Call `useVideoSlideRenderer(items)` and forward the returned `VideoSlideRenderer` / `VideoControlsRenderer` into the overlay's `#slide` and `#controls` slots. Wrap the overlay in the returned `SoundProvider` so the built-in sound toggle has a context.

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
  { src: '/image-01.jpg', title: 'Image' },
  { type: 'video', src: '/clip.mp4', poster: '/clip.jpg', title: 'Clip' },
];

const { VideoSlideRenderer, VideoControlsRenderer, SoundProvider } =
  useVideoSlideRenderer(items);
</script>

<template>
  <SoundProvider>
    <LightboxOverlay v-model:is-open="open" :items="items">
      <template #slide="scope">
        <VideoSlideRenderer v-bind="scope" />
      </template>
      <template #controls="scope">
        <VideoControlsRenderer v-bind="scope" />
      </template>
    </LightboxOverlay>
  </SoundProvider>
</template>
```

The shared `<video>` element powering video slides uses the same pattern as the vue reel-player — playback continues across slide changes on iOS without requiring a per-slide user gesture.

## URL State (shareable links, back button)

`LightboxUrlOverlay` puts the open state in the URL — it opens when the parameter names a slide and closes when it goes away, so links are shareable and the back button closes **when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the button or Escape to remove the parameter in place. Separate component from `LightboxOverlay`: each carries one open-state driver (the `is-open` model or the url `controller`), never both. Build the controller with the `useOverlayUrlState` composable from `@reelkit/vue` and pass it as `:controller`.

> **Built-in keys.** Spread `urlIndexKey` (by position) or `urlStableIdKey` (by a stable `id`) into the controller — both re-exported from `@reelkit/vue`. See the [URL State guide](/docs/core/guide#url-state) and [Core API](/docs/core/api#url-state).

```vue
<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
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

- Opening pushes **one** history entry; paging replaces it. A shared `?photo=3` opens at that slide; a parameter naming no slide is dropped from the URL.
- **Routed app:** pass `adapter` to `useOverlayUrlState` so the router's own location does not go stale and drop the parameter on its next navigation.
  **Stable links.** The index is positional — a bookmark opens a different image once the list is reordered. `urlStableIdKey` keys by each item's stable `id`, scanning the live list — one call covers the common case:

```vue
<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>
```

Pass `hashCodec: base64UrlCodec` to base64url-encode the id in the URL — reversible obfuscation, not a cryptographic hash.

Key by a different field (a `slug`), or page an infinite feed with `locateAsync`, and build the `codec` (wire: param text ↔ identity) + `locator` (lookup: identity → position) yourself.

**Infinite / paginated galleries.** `locate` is synchronous, so it only answers for items already loaded — a shared link to image 400 of a feed that has loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have.

> **Shortcut.** Keying by the item's `id`? Skip the hand-rolled codec and locator — pass `locateAsync` straight to `urlStableIdKey({ items, locateAsync })` (it fetches on a miss, then returns the index). The fuller version below is for keying by another field, or for full control.

```vue
<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => items.value.findIndex((x) => x.id === id),
    identify: (index) => items.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      items.value = loaded; // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="items" />
</template>
```

While it is pending the lightbox stays closed and the parameter is left alone, so the deep link survives the fetch. `null` or a rejection drops the parameter. An answer arriving after the URL moved on, after a close, or after unmount is discarded. Whatever it returns is authoritative — the lightbox takes it as-is rather than re-reading `items`, which Vue has not re-rendered yet.

Full `useOverlayUrlState` options (`param`, `adapter`, `codec`, `locator`): see the [Vue API reference](/docs/vue/api#useoverlayurlstate).

## RkLightboxOverlay Props

Type: `LightboxOverlayProps`

| Prop                    | Type                    | Default           | Description                                                                                                                                                              |
| ----------------------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isOpen`                | `boolean`               | required          | Controls visibility; false = overlay removed from DOM. Bindable via `v-model:is-open`.                                                                                   |
| `items`                 | `LightboxItem[]`        | required          | Items array (images or videos)                                                                                                                                           |
| `initialIndex`          | `number`                | `0`               | Zero-based index of initial item                                                                                                                                         |
| `transitionFn`          | `TransitionTransformFn` | `slideTransition` | Slide transition fn. Import from `@reelkit/vue-lightbox` (`slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition`) or pass a custom one. |
| `showInfo`              | `boolean`               | `true`            | Render title/description info overlay                                                                                                                                    |
| `showControls`          | `boolean`               | `true`            | Render top controls bar (close, counter, fullscreen)                                                                                                                     |
| `showNavigation`        | `boolean`               | `true`            | Render prev/next nav arrows (desktop only)                                                                                                                               |
| `transitionDuration`    | `number`                | `300`             | Slide animation duration ms                                                                                                                                              |
| `swipeDistanceFactor`   | `number`                | `0.12`            | Min swipe distance fraction (0–1) trigger slide change                                                                                                                   |
| `swipeToCloseDirection` | `'up' \| 'down'`        | `'up'`            | Swipe-to-close gesture direction mobile                                                                                                                                  |
| `loop`                  | `boolean`               | `false`           | Slider wraps last → first                                                                                                                                                |
| `enableNavKeys`         | `boolean`               | `true`            | Keyboard arrow-key nav                                                                                                                                                   |
| `enableWheel`           | `boolean`               | `true`            | Mouse-wheel nav                                                                                                                                                          |
| `wheelDebounceMs`       | `number`                | `200`             | Wheel debounce ms                                                                                                                                                        |
| `ariaLabel`             | `string`                | `'Image gallery'` | Accessible label dialog region                                                                                                                                           |

## RkLightboxUrlOverlay Props

Takes every visual/behaviour prop above except `is-open`, replaced by a `controller`. Emits `close`, `slide-change`, `api-ready` — but no `update:is-open`. `initial-index` is ignored — the controller's position picks the slide.

Type: `LightboxUrlOverlayProps`

| Prop         | Type                 | Default  | Description                                                                                                                                                             |
| ------------ | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `useOverlayUrlState`. Its `position` decides whether the overlay is open and which slide; the overlay writes back through it on slide change and close. |

## Emits

| Event            | Payload       | Description                          |
| ---------------- | ------------- | ------------------------------------ |
| `close`          | `void`        | User closes lightbox                 |
| `slide-change`   | `number`      | New active slide index after change  |
| `api-ready`      | `LightboxApi` | Slider ready, exposes imperative API |
| `update:is-open` | `boolean`     | On close; enables `v-model:is-open`  |

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

# @reelkit/vue-reel-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/vue-reel-player"><img src="https://img.shields.io/npm/v/@reelkit/vue-reel-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-6.2%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-97%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://vue-demo.reelkit.dev/reel-player?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/reel.gif" width="240" alt="A full-screen reel player on a phone: a swipe up moves to a three-photo post, a swipe sideways shows its next photo, and a swipe down returns to the first post." /></a>
</p>

Instagram Reels / TikTok-style video player for Vue 3. Opens as a full-screen overlay with vertical swipe navigation. Handles video autoplay, sound continuity on iOS, and multi-media posts. ~6.2 kB gzip.

**[Live Demo](https://vue-demo.reelkit.dev/reel-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/vue-reel-player @reelkit/vue lucide-vue-next
```

Requires Vue 3.3 or later.

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
- Playback timeline bar over long videos, scrubbable, with buffered ranges
- Shareable URLs — `ReelPlayerUrlOverlay` opens itself from the address bar
- Themeable via `--rk-reel-*` CSS custom properties

## Scoped Slots

All of the player's UI is customizable via scoped slots:

| Slot               | Scope type              | Scope                                                      |
| ------------------ | ----------------------- | ---------------------------------------------------------- |
| `slide`            | `SlideSlotScope`        | `item, index, size, isActive, slideKey, defaultContent, …` |
| `slideOverlay`     | `SlideOverlaySlotScope` | `item, index, isActive`                                    |
| `controls`         | `ControlsSlotScope`     | `item, soundState, activeIndex, content, onClose`          |
| `navigation`       | `NavigationSlotScope`   | `item, activeIndex, count, onPrev, onNext`                 |
| `nestedSlide`      | `NestedSlideSlotScope`  | `item, media, index, size, isActive, isInnerActive, …`     |
| `nestedNavigation` | `NavigationSlotScope`   | `item, media, activeIndex, count, onPrev, onNext`          |
| `timeline`         | `TimelineSlotScope`     | `item, activeIndex, timelineState, defaultContent`         |
| `loading`          | `LoadingSlotScope`      | `item, activeIndex`                                        |
| `error`            | `LoadingSlotScope`      | `item, activeIndex`                                        |

`nestedNavigation` reuses `NavigationSlotScope`: `media` is set to the active
inner media item, and `activeIndex` and `count` count the inner carousel.

## Props

| Prop                         | Type                            | Default          | Description                                         |
| ---------------------------- | ------------------------------- | ---------------- | --------------------------------------------------- |
| `isOpen`                     | `boolean`                       | required         | Controls overlay visibility                         |
| `content`                    | `ContentItem[]`                 | required         | Content items to display                            |
| `initialIndex`               | `number`                        | `0`              | Starting slide index                                |
| `initialInnerIndex`          | `number`                        | -                | Inner media index for the first slide only          |
| `aspectRatio`                | `number`                        | `9/16`           | Desktop container ratio                             |
| `ariaLabel`                  | `string`                        | `'Video player'` | Accessible label announced when the overlay opens   |
| `timeline`                   | `'auto' \| 'always' \| 'never'` | `'auto'`         | When the built-in timeline bar renders              |
| `timelineMinDurationSeconds` | `number`                        | `30`             | Under `'auto'`, videos shorter than this get no bar |
| `loop`                       | `boolean`                       | `false`          | Enable infinite loop                                |
| `enableNavKeys`              | `boolean`                       | `true`           | Enable keyboard navigation                          |
| `enableWheel`                | `boolean`                       | `true`           | Enable mouse wheel navigation                       |
| `wheelDebounceMs`            | `number`                        | `200`            | Wheel debounce duration (ms)                        |
| `transitionDuration`         | `number`                        | `300`            | Transition duration (ms)                            |
| `swipeDistanceFactor`        | `number`                        | `0.12`           | Swipe threshold (0-1)                               |

## Events

| Event                | Payload         | Description                                                                                    |
| -------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `close`              | `void`          | Emitted when player closes                                                                     |
| `slide-change`       | `number`        | Emitted after slide change                                                                     |
| `inner-slide-change` | `outer, inner`  | Emitted when the inner media index changes; a single-media post reports `inner` `0` on arrival |
| `api-ready`          | `ReelPlayerApi` | Emitted with the imperative player API (`ReelExpose` plus `close`)                             |
| `update:is-open`     | `boolean`       | Emitted on close — enables `v-model:is-open`                                                   |

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

`ReelPlayerOverlay` and `ReelPlayerUrlOverlay` are generic over your content
item shape. Extend `BaseContentItem` to use any data type: the item type is
inferred from `content`, so passing anything else is a type error. Vue does not
carry that type into a scoped slot, so annotate the slot binding with the
exported slot-scope type to keep it strongly typed, for example
`#slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>"`:

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
`NestedSlideSlotScope`, `TimelineSlotScope`, `LoadingSlotScope`) and annotate
the destructure.

## URL-driven player

`ReelPlayerUrlOverlay` takes the same props except `isOpen` — the address bar
owns the open state, so a shared link reopens the same post — plus one of its
own:

| Prop         | Type                                                                | Default  | Description                                                                                                         |
| ------------ | ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController<number> \| UrlStateController<TwoAxisPosition>` | required | From `useOverlayUrlState`; its position opens the player and picks the slide, and the player writes back through it |

It emits the same events except `update:is-open`.

```vue
<script setup lang="ts">
import {
  ReelPlayerUrlOverlay,
  type ContentItem,
} from '@reelkit/vue-reel-player';
import { useOverlayUrlState, urlIndexKey } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-reel-player/styles.css';

const props = defineProps<{ content: ContentItem[] }>();

const reel = useOverlayUrlState({
  param: 'reel',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexKey(() => props.content.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
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

Swap `urlIndexKey` for `urlIndexTwoAxisKey` to put the inner media index in the
URL too (`?reel=3.2`), or `urlStableIdKey` to key it by post id so a bookmark
survives the feed being reordered. Drop the adapter outside vue-router — the
History API is the default.

## Sub-components

For composing your own controls or slides inside the slots:

| Component          | Props                                                                                                                                                                              | Description                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `CloseButton`      | `onClick: () => void` (required), `className` (default `'rk-reel-close-btn'`), `style: CSSProperties`                                                                              | Circular close icon, top right                                                   |
| `SoundButton`      | `disabled` (default `false`), `className` (default `'rk-reel-sound-btn'`), `style: CSSProperties`                                                                                  | Mute toggle; needs the overlay's `SoundProvider`, hidden while sound is disabled |
| `PlayerControls`   | `onClose: () => void` (required), `showSound` (default `false`), `soundDisabled` (default `false`)                                                                                 | The default controls: `CloseButton` plus an optional `SoundButton`               |
| `ImageSlide`       | `src` (required), `size: [number, number]` (required), `onReady`, `onError`                                                                                                        | Image slide, `object-fit: cover`, lazy loaded                                    |
| `VideoSlide`       | `src`, `aspectRatio`, `size`, `isActive`, `slideKey` (all required), `poster`, `isInnerActive` (default `true`), `containerStyle`, `onVideoRef`, `onReady`, `onWaiting`, `onError` | Video slide on the shared `<video>` element, keeps its playback position         |
| `SlideOverlay`     | `author: { name, avatar }`, `description`, `likes`                                                                                                                                 | Bottom gradient with author, two-line description and like count                 |
| `TimelineBar`      | `class`, `style: CSSProperties`                                                                                                                                                    | Scrubbable playback bar; reads the nearest `TimelineProvider`                    |
| `LoadingIndicator` | -                                                                                                                                                                                  | Default wave loader                                                              |
| `ErrorIndicator`   | -                                                                                                                                                                                  | Default "Content unavailable" state                                              |

`TimelineBarProps` is exported for typing a wrapper around the bar.

| Export                         | Description                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `TimelineProvider`             | Provides a `TimelineController` to its subtree; the overlay already wraps its content in one                 |
| `useTimelineState()`           | The nearest `TimelineController` (progress, buffered ranges, duration); throws outside a provider            |
| `useTimelineStateOptional()`   | Same, or `null` outside a provider                                                                           |
| `RK_TIMELINE_KEY`              | Injection key `TimelineProvider` provides under                                                              |
| `useViewportSize(aspectRatio)` | Reactive `[width, height]` that keeps the ratio on desktop and fills the viewport at 768px wide and narrower |
| `urlIndexTwoAxisKey`           | Re-exported from `@reelkit/vue`: a URL key that writes the post and its inner media index (`?reel=3.2`)      |

## Types

| Type                           | Description                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `BaseContentItem`              | `{ id: string; media: MediaItem[] }` — extend it for custom items                         |
| `ContentItem`                  | `BaseContentItem` plus `author: { name, avatar }`, `likes: number`, `description: string` |
| `MediaItem`                    | `{ id: string; type: MediaType; src: string; poster?: string; aspectRatio: number }`      |
| `MediaType`                    | `'image' \| 'video'`                                                                      |
| `TimelineMode`                 | `'auto' \| 'always' \| 'never'`                                                           |
| `ReelPlayerApi`                | `ReelExpose & { close: () => void }`                                                      |
| `ReelPlayerOverlayProps<T>`    | Props of `ReelPlayerOverlay`, with `content: T[]`                                         |
| `ReelPlayerUrlOverlayProps<T>` | Props of `ReelPlayerUrlOverlay`, with `content: T[]`                                      |

The slot-scope types are listed under [Scoped Slots](#scoped-slots).
`UrlAdapter`, `UrlCodec`, `UrlLocator` and `TwoAxisPosition` are re-exported
from `@reelkit/vue`.

## Keyboard Shortcuts

| Key          | Action                  |
| ------------ | ----------------------- |
| `ArrowUp`    | Previous slide          |
| `ArrowDown`  | Next slide              |
| `ArrowLeft`  | Previous media (nested) |
| `ArrowRight` | Next media (nested)     |
| `Escape`     | Close player            |

## CSS Classes

Classes are plain, not scoped, and the same as `@reelkit/react-reel-player`.

| Class                                | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| `.rk-reel-overlay`                   | Overlay background                             |
| `.rk-reel-container`                 | Player container                               |
| `.rk-reel-slide-wrapper`             | Slide wrapper                                  |
| `.rk-reel-button`                    | Shared circular icon button                    |
| `.rk-reel-nav-arrows`                | Desktop nav arrows container                   |
| `.rk-reel-nav-button`                | Individual nav arrow button                    |
| `.rk-reel-close-btn`                 | Close button                                   |
| `.rk-reel-sound-btn`                 | Sound toggle                                   |
| `.rk-reel-slide-overlay`             | Per-slide overlay (author, likes)              |
| `.rk-reel-slide-overlay-author`      | Author row                                     |
| `.rk-reel-slide-overlay-avatar`      | Author avatar                                  |
| `.rk-reel-slide-overlay-name`        | Author name                                    |
| `.rk-reel-slide-overlay-description` | Slide description                              |
| `.rk-reel-slide-overlay-likes`       | Like count                                     |
| `.rk-reel-nested-indicator`          | Dot pagination under multi-media slides        |
| `.rk-reel-nested-nav`                | Nested nav arrows                              |
| `.rk-reel-nested-nav-prev`           | Nested previous arrow                          |
| `.rk-reel-nested-nav-next`           | Nested next arrow                              |
| `.rk-reel-video-container`           | Video slide wrapper                            |
| `.rk-reel-video-element`             | Video element                                  |
| `.rk-reel-video-poster`              | Video poster image (`.rk-visible` while shown) |
| `.rk-reel-timeline`                  | Timeline bar wrapper                           |
| `.rk-reel-timeline-track`            | Timeline track                                 |
| `.rk-reel-timeline-buffered`         | Buffered segments                              |
| `.rk-reel-timeline-fill`             | Played progress                                |
| `.rk-reel-timeline-cursor`           | Scrub handle                                   |
| `.rk-reel-media-error`               | Error state container                          |
| `.rk-reel-media-error-text`          | Error message text                             |
| `.rk-reel-loader`                    | Wave loading overlay                           |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-reel-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-reel-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/vue-reel-player?framework=vue#theming) for the full token table.

```css
:root {
  --rk-reel-button-bg: rgba(0, 0, 0, 0.6);
  --rk-reel-button-size: 44px;
  --rk-reel-edge-padding: 20px;
}
```

## Documentation

Docs, runnable StackBlitz examples, and customization guides at **[reelkit.dev/docs/vue-reel-player](https://reelkit.dev/docs/vue-reel-player?framework=vue)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

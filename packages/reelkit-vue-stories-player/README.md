# @reelkit/vue-stories-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/vue-stories-player"><img src="https://img.shields.io/npm/v/@reelkit/vue-stories-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-7.9%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-91%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://vue-demo.reelkit.dev/stories-player?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/stories.gif" width="240" alt="An Instagram-style stories player on a phone: tapping a user's ring opens their stories, a tap moves to the next story, a swipe turns a cube to the next user, a double-tap likes the story with a heart, and closing returns to the rings." /></a>
</p>

Instagram-style stories player for Vue 3. Full-screen overlay with tap-to-advance navigation, 3D cube transition between users, auto-advance timer, segmented progress bar, and double-tap heart animation. ~7.9 kB gzip.

**[Live Demo](https://vue-demo.reelkit.dev/stories-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/vue-stories-player @reelkit/vue lucide-vue-next
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  StoriesOverlay,
  StoriesRingList,
  type StoriesGroup,
} from '@reelkit/vue-stories-player';
import '@reelkit/vue-stories-player/styles.css';

const groups: StoriesGroup[] = [
  {
    author: { id: 'u1', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', mediaType: 'image', src: '/story1.jpg' },
      {
        id: 's2',
        mediaType: 'video',
        src: '/story2.mp4',
        poster: '/poster.jpg',
      },
    ],
  },
  {
    author: { id: 'u2', name: 'Bob', avatar: '/bob.jpg' },
    stories: [{ id: 's3', mediaType: 'image', src: '/story3.jpg' }],
  },
];

const isOpen = ref(false);
const groupIndex = ref(0);

const openGroup = (index: number) => {
  groupIndex.value = index;
  isOpen.value = true;
};
</script>

<template>
  <StoriesRingList :groups="groups" @select="openGroup" />
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :initial-group-index="groupIndex"
  />
</template>
```

## Features

- Tap left/right to navigate stories within a group
- Swipe left/right with 3D cube transition between users
- Auto-advance timer with segmented progress bar
- Tap-and-hold to pause (auto-hides UI)
- Double-tap heart animation
- Video stories with autoplay and sound toggle
- Swipe down to close
- Keyboard navigation (Arrow keys, Escape)
- Story ring list with viewed/unviewed gradient
- Sliding window progress bar for 50+ stories
- Scoped slots for header, footer, slides and more
- Desktop navigation arrows
- Optional Instagram-style desktop carousel of neighbouring groups
- URL-driven overlay: a shareable link per story, back button closes

## API Reference

### StoriesOverlay Props

| Prop                      | Type                           | Default          | Description                                                                                            |
| ------------------------- | ------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `isOpen`                  | `boolean`                      | required         | Controls overlay visibility; bind with `v-model:is-open`                                               |
| `groups`                  | `StoriesGroup[]`               | required         | Story groups to display                                                                                |
| `ariaLabel`               | `string`                       | `Stories player` | Accessible label of the dialog                                                                         |
| `initialGroupIndex`       | `number`                       | `0`              | Starting group index                                                                                   |
| `initialStoryIndex`       | `number`                       | resumed or `0`   | Starting story index; wins over any resume                                                             |
| `groupTransition`         | `TransitionTransformFn`        | cube             | Transition between groups                                                                              |
| `defaultImageDuration`    | `number`                       | `5000`           | Image auto-advance duration (ms)                                                                       |
| `tapZoneSplit`            | `number`                       | `0.3`            | Left zone ratio (0-1)                                                                                  |
| `hideUiOnPause`           | `boolean`                      | `true`           | Hide the progress bar and header while paused by a long press                                          |
| `enableKeyboard`          | `boolean`                      | `true`           | Enable keyboard navigation                                                                             |
| `innerTransitionDuration` | `number`                       | `200`            | Story crossfade duration (ms)                                                                          |
| `minSegmentWidth`         | `number`                       | `8`              | Min progress segment width (px)                                                                        |
| `desktopLayout`           | `'single' \| 'carousel'`       | `'single'`       | `'carousel'`: neighbouring groups as preview cards beside the story on desktop                         |
| `chromePlacement`         | `'overlay' \| 'group'`         | `'overlay'`      | `'group'`: each group carries its own progress bar and header, turning with it like Instagram          |
| `viewed`                  | `StoriesViewedStateController` | —                | From `createStoriesViewedStateController()`: resume, recording and muted card rings for watched groups |
| `resumeStoryIndex`        | `(groupIndex) => number`       | —                | Where an unvisited group opens; wins over `viewed`                                                     |

### Events

| Event            | Payload                  | Description                                  |
| ---------------- | ------------------------ | -------------------------------------------- |
| `close`          | —                        | The viewer closed the player                 |
| `update:is-open` | `boolean`                | Emitted on close — enables `v-model:is-open` |
| `story-change`   | `groupIndex, storyIndex` | After story navigation                       |
| `group-change`   | `groupIndex`             | After group switch                           |
| `story-viewed`   | `groupIndex, storyIndex` | When a story is shown                        |
| `story-complete` | `groupIndex, storyIndex` | When a story's timer runs out                |
| `double-tap`     | `groupIndex, storyIndex` | On double-tap (heart)                        |
| `pause`          | —                        | On tap-and-hold or the pause button          |
| `resume`         | —                        | On release or the play button                |
| `api-ready`      | `StoriesApi`             | Emitted with the imperative API              |

The same `StoriesApi` (`nextStory`, `prevStory`, `nextGroup`, `prevGroup`, `goToGroup`, `pause`, `resume`) is available through a template ref.

### Scoped Slots

| Slot           | Scope                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `header`       | `author, story, storyIndex, isPaused, isMuted, isVideo, groupIndex, isActive, onToggleSound, onTogglePause, onClose`                  |
| `footer`       | `author, story, storyIndex`                                                                                                           |
| `slide`        | `story, index, groupIndex, isActive, size, activeGroupIndex, activeStoryIndex, onDurationReady, onReady, onWaiting, onError, onEnded` |
| `navigation`   | `onPrevStory, onNextStory, onPrevGroup, onNextGroup`                                                                                  |
| `progressBar`  | `totalStories, activeIndex, progress, group, groupIndex, isActive`                                                                    |
| `loading`      | `story, storyIndex, groupIndex`                                                                                                       |
| `error`        | `story, storyIndex, groupIndex`                                                                                                       |
| `groupPreview` | `group, groupIndex, story, offset, viewedCount, onOpen`                                                                               |

A slot that renders nothing falls back to the default.

### StoriesUrlOverlay

Takes every `StoriesOverlay` prop except `isOpen`, `initialGroupIndex` and `initialStoryIndex`, plus a `controller` from `useOverlayUrlState` spread with `urlIndexTwoAxisKey(...)`. The `?story=<group>.<story>` parameter opens the player, every story change updates it, and one back step closes.

### StoriesRingList Props

| Prop       | Type                           | Description                                                          |
| ---------- | ------------------------------ | -------------------------------------------------------------------- |
| `groups`   | `StoriesGroup[]`               | Story groups                                                         |
| `viewed`   | `StoriesViewedStateController` | Rings follow it by themselves; the same controller the overlay takes |
| `ringSize` | `number`                       | Ring diameter (px)                                                   |

Emits `select` with the group index when a ring is tapped.

### Types

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  /** Media aspect ratio (width / height). */
  aspectRatio?: number;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}
```

## Keyboard Shortcuts

| Key          | Action                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| `ArrowLeft`  | Previous story; on a group's first story, the previous group where it was left |
| `ArrowRight` | Next story; past a group's last story, the next group (the last group closes)  |
| `Escape`     | Close overlay                                                                  |

## Styling

Class names (`.rk-stories-*`) and theme tokens (`--rk-stories-*`) are the same as in `@reelkit/react-stories-player`, so one theme fits both. Override the tokens at `:root` (or any ancestor of `.rk-stories-overlay`) — see the [Theming docs](https://reelkit.dev/docs/vue-stories-player?framework=vue#theming) for the full token table.

## Documentation

Docs, demos, and customization examples at **[reelkit.dev/docs/vue-stories-player](https://reelkit.dev/docs/vue-stories-player?framework=vue)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)

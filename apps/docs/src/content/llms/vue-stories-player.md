---
title: Vue Stories Player
url: https://reelkit.dev/docs/vue-stories-player
section: Vue
order: 5
desc: Instagram-style stories player overlay for Vue 3. Groups schema, props, emits, scoped slots, viewed state, desktop carousel, URL state, theming tokens and CSS classes shared with the React stories player.
---

# Vue Stories Player

Instagram-style stories player overlay Vue 3. Built on `@reelkit/stories-core`, same engine React player. CSS classes + theming tokens identical `@reelkit/react-stories-player` (classes `.rk-stories-*`, tokens `--rk-stories-*`) — theme ports between bindings.

## Install

```bash
npm install @reelkit/vue-stories-player @reelkit/vue lucide-vue-next
```

```ts
import { StoriesOverlay } from '@reelkit/vue-stories-player';
import '@reelkit/vue-stories-player/styles.css';
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
    author: { id: 'alice', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', mediaType: 'image', src: '/story-1.jpg' },
      { id: 's2', mediaType: 'video', src: '/s2.mp4', poster: '/p2.jpg' },
    ],
  },
];

const isOpen = ref(false);
const groupIndex = ref(0);
</script>

<template>
  <StoriesRingList
    :groups="groups"
    @select="
      (index) => {
        groupIndex = index;
        isOpen = true;
      }
    "
  />
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :initial-group-index="groupIndex"
  />
</template>
```

## Content Schema

```ts
interface StoryItem {
  id: string;
  mediaType: 'image' | 'video'; // MediaType
  src: string;
  poster?: string; // video poster, also the carousel card preview
  duration?: number; // ms, overrides defaultImageDuration
  createdAt?: string | Date;
}

interface AuthorInfo {
  id: string; // viewed state + stable-id URLs key on it
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}
```

## StoriesOverlay Props

| Prop                        | Type                                       | Default                                               |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `is-open`                   | `boolean`                                  | required, `v-model:is-open`                           |
| `groups`                    | `StoriesGroup<T>[]`                        | required                                              |
| `aria-label`                | `string`                                   | `'Stories player'`                                    |
| `initial-group-index`       | `number`                                   | `0`                                                   |
| `initial-story-index`       | `number`                                   | resume, else `0` — explicit wins over remembered      |
| `resume-story-index`        | `(groupIndex) => number`                   | — wins over `viewed`                                  |
| `viewed`                    | `StoriesViewedStateController`             | —                                                     |
| `desktop-layout`            | `DesktopLayout` (`'single' \| 'carousel'`) | `'single'`                                            |
| `chrome-placement`          | `ChromePlacement` (`'overlay' \| 'group'`) | `'overlay'` — `'group'`: bar + header per group slide |
| `group-transition`          | `TransitionTransformFn`                    | `cubeTransition`                                      |
| `inner-transition-duration` | `number`                                   | `200`                                                 |
| `default-image-duration`    | `number`                                   | `5000`                                                |
| `tap-zone-split`            | `number`                                   | `0.3`                                                 |
| `hide-ui-on-pause`          | `boolean`                                  | `true`                                                |
| `enable-keyboard`           | `boolean`                                  | `true`                                                |
| `min-segment-width`         | `number`                                   | `8`                                                   |

Props type exported `StoriesOverlayProps`.

Groups may grow while open — replaced array or push into same array both picked up.

## Events

| Event                | Payload                                           |
| -------------------- | ------------------------------------------------- |
| `@update:is-open`    | `boolean`                                         |
| `@close`             | —                                                 |
| `@story-change`      | `groupIndex, storyIndex`                          |
| `@group-change`      | `groupIndex`                                      |
| `@story-viewed`      | `groupIndex, storyIndex` (opening story included) |
| `@story-complete`    | `groupIndex, storyIndex`                          |
| `@double-tap`        | `groupIndex, storyIndex`                          |
| `@pause` / `@resume` | —                                                 |
| `@api-ready`         | `StoriesApi`                                      |

## URL State

`StoriesUrlOverlay` — open state in address bar, one param both axes: `?story=<group>.<story>`. Props = `StoriesOverlayProps` minus `is-open` / `initial-group-index` / `initial-story-index`, plus `controller`. Props type exported `StoriesUrlOverlayProps`.

```vue
<script setup lang="ts">
import {
  StoriesUrlOverlay,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
  type StoriesGroup,
} from '@reelkit/vue-stories-player';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const props = defineProps<{ groups: StoriesGroup[] }>();

const stories = useOverlayUrlState({
  param: 'story',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexTwoAxisKey({
    outerCount: () => props.groups.length,
    innerCounts: () => props.groups.map((g) => g.stories.length),
  }),
});
</script>

<template>
  <RouterLink
    v-for="(group, i) in props.groups"
    :key="group.author.id"
    :to="`?story=${i}.0`"
    >{{ group.author.name }}</RouterLink
  >
  <StoriesUrlOverlay :controller="stories" :groups="props.groups" />
</template>
```

- Opening pushes ONE history entry; every story + group change REPLACES it. One back step always closes.
- Inner navigation carried: `?story=2.3` opens exact story.
- Back closes only when opened from within app. Shared link opened in fresh tab has no history behind it — browser-back leaves site; ✕ or Escape removes param in place.
- Param naming no group/story dropped from URL, never opens neighbour.
- Routed app: pass router adapter (`useVueRouterUrlAdapter`), else router location goes stale and next navigation drops param.
- Stable group ids: `urlStableIdTwoAxisKey`, or `outerCodec` + `outerLocator` on `urlIndexTwoAxisKey`. `base64UrlCodec` obscures id on wire (reversible, not a hash).
- Infinite feeds: `locateAsync` on `outerLocator`, called only when sync `locate` misses. Pending → player stays closed, param left alone; `null`/rejection drops param. Same pager single-axis keys take — on two-axis key it rides `outerLocator`, group axis pages while story stays local index in resolved group.

## Remembering what was seen

One `createStoriesViewedStateController` (from `@reelkit/stories-core`, re-exported here), handed to ring list AND player as `viewed`. Rings gradient until group watched to end; group reopens first unseen story. Entry keys author id + story id — survives feed reorder. Same controller works React + Angular.

```vue
<script setup lang="ts">
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/vue-stories-player';

const props = defineProps<{ groups: StoriesGroup[] }>();

const viewed = createStoriesViewedStateController({
  storageKey: 'stories-seen',
  groups: () => props.groups,
});
</script>

<template>
  <StoriesRingList :groups="props.groups" :viewed="viewed" @select="open" />
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="props.groups"
    :viewed="viewed"
  />
</template>
```

Config type `StoriesViewedStateControllerConfig`; controller type `StoriesViewedStateController`.

- Opening story counts — reported viewed after mount.
- `resume-story-index` prop wins over controller.
- URL param wins over both.
- Count = position of furthest story reached, not a tally.
- Storage pluggable: `createLocalStorageAdapter` (default), `createSessionStorageAdapter`, `createMemoryStorageAdapter`, or own `StorageAdapter`. Two tabs stay in step via storage event.
- Player mounted only at open (`v-if="open"`) reads too late → call `viewed.attach()` in `onMounted`, dispose in `onUnmounted`.
- Lower level: `createViewedStateController` + `twoAxisViewedTracking` (`ViewedStateController`, `ViewedStateOptions`).

## Desktop Carousel

`desktop-layout="carousel"` — active story center, up to 2 neighbouring groups per side as dimmed cards, click opens group, cards slide during group change.

- Phones (≤768px) always plain player; resize switches live.
- Card previews story group would open on (poster or image). No media → `#slide` slot drawn at player size, scaled, `isActive: false`, inert.
- Timer + `@story-viewed` wait for slide end.
- Card click, `goToGroup`, `nextGroup`/`prevGroup`, arrow keys past group end all slide. Touch swipe does not (player already moved).

## Progress Bar and Header per Group

`chrome-placement="group"` — every group gets its own progress bar + header inside its slide, both turn with the group (Instagram). Default `'overlay'`: one copy above the player, switching after the group changes.

- Neighbouring group shows the story it will open on, nothing played.
- Group being left keeps its progress until the turn ends; one played to the end stays full.
- `#progressBar` / `#header` rendered for every group on screen, scopes carry `groupIndex` + `isActive`; neighbour → `isActive: false`, progress signals hold still.
- `#header` sits in the swipe area: a tap moves between stories unless it hits a `button`, a link, or `role="button"`.
- Desktop carousel: player hidden while cards slide, so the choice shows once the group is open.

## Scoped Slots

Eight slots. Slot rendering nothing falls back to default.

| Slot            | Scope                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `#header`       | `{ author, story, storyIndex, isPaused, isMuted, isVideo, groupIndex, isActive, onToggleSound, onTogglePause, onClose }` — `HeaderSlotScope`                 |
| `#footer`       | `{ author, story, storyIndex }` — `FooterSlotScope`                                                                                                          |
| `#slide`        | `{ story, index, groupIndex, isActive, size, activeGroupIndex, activeStoryIndex, onDurationReady, onReady, onWaiting, onError, onEnded }` — `SlideSlotScope` |
| `#navigation`   | `{ onPrevStory, onNextStory, onPrevGroup, onNextGroup }` — `NavigationSlotScope`                                                                             |
| `#progressBar`  | `{ totalStories, activeIndex, progress, group, groupIndex, isActive }` — `ProgressBarSlotScope`                                                              |
| `#loading`      | `{ story, storyIndex, groupIndex }` — `LoadingSlotScope`                                                                                                     |
| `#error`        | `{ story, storyIndex, groupIndex }` — `ErrorSlotScope`                                                                                                       |
| `#groupPreview` | `{ group, groupIndex, story, offset, viewedCount, onOpen }` — `GroupPreviewSlotScope`                                                                        |

`activeIndex`, `progress`, `activeGroupIndex`, `activeStoryIndex` are core signals — bridge with `toVueRef` (from `@reelkit/vue`) or wrap in `Observe`, re-exported here.

### Slide slot lifecycle callbacks

| Callback          | When                                                        |
| ----------------- | ----------------------------------------------------------- |
| `onReady`         | image loaded / video playing — clears loading, starts timer |
| `onWaiting`       | video buffering mid-playback — spinner, timer pauses        |
| `onError`         | load failed — error state, URL remembered broken            |
| `onDurationReady` | real media length (ms), timer restarts with it              |
| `onEnded`         | media finished — advance                                    |

Preloader caching: built-in `ImageStorySlide` + `VideoStorySlide` preload next story in background — preloaded story appears instantly, no spinner. Failed URL remembered too: reopening broken story shows error at once, no retry.

```vue
<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <template #slide="scope">
      <VideoStorySlide
        v-if="scope.story.mediaType === 'video'"
        :src="scope.story.src"
        :poster="scope.story.poster"
        :group-index="scope.groupIndex"
        :story-index="scope.index"
        :active-group-index="scope.activeGroupIndex"
        :active-story-index="scope.activeStoryIndex"
        :on-duration-ready="scope.onDurationReady"
        :on-playing="scope.onReady"
        :on-waiting="scope.onWaiting"
        :on-ended="scope.onEnded"
        :on-error="scope.onError"
      />
      <ImageStorySlide
        v-else
        :src="scope.story.src"
        :on-load="scope.onReady"
        :on-error="scope.onError"
      />
    </template>
  </StoriesOverlay>
</template>
```

## Transitions

`group-transition` — `cubeTransition` (default), `flipTransition`, `fadeTransition`, `zoomTransition`, `slideTransition` from `@reelkit/vue`. Ignored while carousel showing (slides instead).

## StoriesApi

Template ref on overlay, or `@api-ready` payload. Calls while closed = no-op.

```ts
interface StoriesApi {
  nextStory(): void;
  prevStory(): void;
  nextGroup(): void;
  prevGroup(): void;
  goToGroup(index: number): void;
  pause(): void;
  resume(): void;
}
```

## Double-tap

Heart animation built in; `@double-tap` gives `groupIndex, storyIndex` — persist like yourself. Speed via `--rk-stories-heart-duration`; colour/size via `.rk-stories-heart`. Cannot be replaced through a slot yet — restyle with CSS, or `display: none` + own animation from `@double-tap`.

## Tap zones

Left `tap-zone-split` (default 0.3) of width → previous story; rest → next. At group edges crosses to neighbouring group. Long press pauses + hides UI (`hide-ui-on-pause`). Swipe down closes.

## Sub-Components

| Component           | Notes                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StoriesRing`       | avatar + gradient ring; emits `click`. Props type `StoriesRingProps`                                                                                                                      |
| `StoriesRingList`   | row of rings + names; emits `select(groupIndex)`. Props type `StoriesRingListProps`                                                                                                       |
| `StoryHeader`       | default header (avatar, name, verified, time, sound, pause, close, spinner). Props type `StoryHeaderProps`                                                                                |
| `CanvasProgressBar` | canvas segmented bar, drawn from signals, sliding window for many stories. `:live="false"`: draws only on signal change or resize, no animation loop. Props type `CanvasProgressBarProps` |
| `ImageStorySlide`   | full-bleed image, `object-fit: cover`. Props type `ImageStorySlideProps`                                                                                                                  |
| `VideoStorySlide`   | shared `<video>`, iOS sound continuity, poster frames. Props type `VideoStorySlideProps`                                                                                                  |
| `HeartAnimation`    | double-tap heart; emits `complete`                                                                                                                                                        |

## Re-exports

From `@reelkit/vue`: `Observe`, `SoundProvider`, `useSoundState`, `useOverlayUrlState`, `createViewedStateController`, `twoAxisViewedTracking`, `createLocalStorageAdapter`, `createSessionStorageAdapter`, `createMemoryStorageAdapter`, `urlIndexTwoAxisKey`, `urlStableIdTwoAxisKey`, `base64UrlCodec`, types `UrlAdapter`, `UrlCodec`, `UrlLocator`, `UrlKey`, `UrlStateController`, `TwoAxisPosition`, `TwoAxisIdentity`, `UrlIndexTwoAxisKeyOptions`, `ViewedStateController`, `ViewedStateOptions`, `StorageAdapter`.

From `@reelkit/stories-core`: `createStoriesViewedStateController`, `StoriesViewedStateController`, `StoriesViewedStateControllerConfig`, `StoryItem`, `AuthorInfo`, `StoriesGroup`, `MediaType`.

Own types: `StoriesOverlayProps`, `StoriesUrlOverlayProps`, `StoriesRingProps`, `StoriesRingListProps`, `StoryHeaderProps`, `CanvasProgressBarProps`, `ImageStorySlideProps`, `VideoStorySlideProps`, `DesktopLayout`, `StoriesApi`, and the eight `*SlotScope` types.

Consumer never needs a direct `@reelkit/core` import.

## CSS Theming Tokens

Defaults on `:root`, override at `:root` or any ancestor of overlay.

`--rk-stories-overlay-bg` `#000`, `--rk-stories-overlay-z` `9999`, `--rk-stories-container-radius` `12px`, `--rk-stories-swipe-gap` `16px`, `--rk-stories-top-shade-height` `120px`, `--rk-stories-top-shade-bg`, `--rk-stories-ui-transition` `200ms`, `--rk-stories-nav-size` `44px`, `--rk-stories-nav-bg`, `--rk-stories-nav-bg-hover`, `--rk-stories-nav-fg`, `--rk-stories-nav-fg-hover`, `--rk-stories-error-bg`, `--rk-stories-error-fg`, `--rk-stories-error-text-size`, `--rk-stories-video-bg`, `--rk-stories-video-poster-transition`, `--rk-stories-header-top`, `--rk-stories-header-padding`, `--rk-stories-header-avatar-size`, `--rk-stories-header-name-fg`, `--rk-stories-header-name-size`, `--rk-stories-header-time-fg`, `--rk-stories-header-btn-fg`, `--rk-stories-heart-duration` `800ms`, `--rk-stories-ring-spin-duration` `4s`, `--rk-stories-ring-list-gap`, `--rk-stories-ring-list-padding`, `--rk-stories-ring-list-name-size`, `--rk-stories-card-bg`, `--rk-stories-card-radius`, `--rk-stories-card-scrim`, `--rk-stories-card-fg`, `--rk-stories-card-name-size`, `--rk-stories-card-time-fg`, `--rk-stories-card-time-size`, `--rk-stories-card-gap`, `--rk-stories-card-transition` `300ms`.

## CSS Classes

`.rk-stories-overlay` (+ `--carousel`, `--sliding`), `.rk-stories-swipe-wrapper`, `.rk-stories-container`, `.rk-stories-ui-layer` (+ `--hidden`), `.rk-stories-error`, `.rk-stories-error-text`, `.rk-stories-nav-btn`, `.rk-stories-progress-bar`, `.rk-stories-slide-wrapper`, `.rk-stories-story`, `.rk-stories-image`, `.rk-stories-video`, `.rk-stories-video-element`, `.rk-stories-video-poster` (+ `--visible`), `.rk-stories-header` (+ `--hidden`, `-avatar`, `-name`, `-verified`, `-time`, `-actions`, `-btn`, `-spinner`), `.rk-stories-heart`, `.rk-stories-ring` (+ `--active`, `-avatar`), `.rk-stories-ring-list` (+ `-item`, `-name`), `.rk-stories-carousel` (+ `--instant`), `.rk-stories-card` (+ `--center`, `--hidden`, `-button`, `-image`, `-scrim`, `-info`, `-name`, `-time`).

## Accessibility

Root `role="dialog"`, `aria-modal="true"`, `aria-label` from prop. Focus captured on open, trapped inside, returned on close. Nav arrows labelled "Previous story" / "Next story". Carousel card = button "Open stories by {name}", after player controls in tab order, out of tab order while sliding, focus returned to dialog when its group opens.

## SSR

Closed overlay renders nothing; `StoriesRingList` renders every ring unwatched on server — viewed store read only after mount, so server markup matches first client render.

## Keyboard

`ArrowLeft` previous story, `ArrowRight` next story, `Escape` close. All gated by `enable-keyboard`.

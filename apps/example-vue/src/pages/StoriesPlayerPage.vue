<script setup lang="ts">
import { shallowRef } from 'vue';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
  type DesktopLayout,
  type ChromePlacement,
  type SlideSlotScope,
} from '@reelkit/vue-stories-player';
import {
  cubeTransition,
  flipTransition,
  fadeTransition,
  zoomTransition,
  slideTransition,
  type TransitionTransformFn,
} from '@reelkit/vue';
import '@reelkit/vue-stories-player/styles.css';
import { persistedRef } from '../composables/persistedRef';
import StoriesSwitches from '../components/StoriesSwitches.vue';
import CustomStorySlide from './stories-player/CustomStorySlide.vue';
import {
  generateGroups,
  kLoadMoreCount,
  nextPage,
  type CustomStory,
} from './stories-player/storiesFeed';

const _kTransitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'cube', fn: cubeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'fade', fn: fadeTransition },
  { label: 'zoom', fn: zoomTransition },
  { label: 'slide', fn: slideTransition },
];

const isOpen = shallowRef(false);
const selectedGroup = shallowRef(0);
// The feed grows: "Load more" hands over a longer array while the player is
// open, and the player picks the new groups up.
const groups = shallowRef(generateGroups());
const transition = shallowRef<TransitionTransformFn>(cubeTransition);
const rememberSeen = persistedRef('reelkit-stories-player-remember-seen', true);
const desktopLayout = persistedRef<DesktopLayout>(
  'reelkit-stories-player-desktop-layout',
  'single',
);
const chromePlacement = persistedRef<ChromePlacement>(
  'reelkit-stories-player-chrome-placement',
  'overlay',
);

// What was seen is one controller, handed to the ring list and the player:
// they attach it and follow it themselves. It reads the groups through the
// ref, so groups added later are counted too.
const viewed = createStoriesViewedStateController({
  storageKey: 'reelkit-stories-player-seen',
  groups: () => groups.value,
});

const loadMore = () => {
  groups.value = [...groups.value, ...nextPage(groups.value.length)];
};

const openStories = (groupIndex: number) => {
  selectedGroup.value = groupIndex;
  isOpen.value = true;
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Stories Player Demo</h1>
      <p class="subtitle">
        Click on a story ring to open the player. Tap left/right to navigate
        stories, swipe left/right to switch users. Tap-and-hold to pause,
        double-tap to like.
      </p>
      <p class="subtitle">
        The feed can grow while the player is open. With the Carousel layout on
        a desktop screen, a “Load more” button sits in the corner of the open
        player and adds {{ kLoadMoreCount }} more authors to the end of the
        feed, the way a real one pages in. Go to the last group and press it:
        the new cards appear beside the player, a click opens them, and the
        player moves on to them instead of closing after the last group.
      </p>

      <div class="toolbar">
        <button
          v-for="option in _kTransitions"
          :key="option.label"
          type="button"
          class="chip"
          :class="{ on: transition === option.fn }"
          @click="transition = option.fn"
        >
          {{ option.label }}
        </button>
        <button type="button" class="chip clear" @click="viewed.forget()">
          clear seen
        </button>
      </div>

      <div class="switches">
        <StoriesSwitches
          v-model:remember-seen="rememberSeen"
          v-model:desktop-layout="desktopLayout"
          v-model:chrome-placement="chromePlacement"
        />
      </div>

      <!-- "Remember seen" off means the controller is not handed over at all. -->
      <StoriesRingList
        :groups="groups"
        :viewed="rememberSeen ? viewed : undefined"
        @select="openStories"
      />
    </div>

    <!-- The same controller as the ring list: the carousel cards draw the same
         rings, groups resume where they were left, and every story shown is
         recorded. -->
    <StoriesOverlay
      v-model:is-open="isOpen"
      :groups="groups"
      :initial-group-index="selectedGroup"
      :viewed="rememberSeen ? viewed : undefined"
      :group-transition="transition"
      :desktop-layout="desktopLayout"
      :chrome-placement="chromePlacement"
    >
      <template #slide="scope">
        <CustomStorySlide :scope="scope as SlideSlotScope<CustomStory>" />
      </template>
    </StoriesOverlay>

    <!-- Drawn over the open player, which covers the rest of the page. Only for
         the carousel on a desktop screen: the point is the cards picking up the
         new groups, and the single layout and a phone show none. -->
    <button
      v-if="isOpen && desktopLayout === 'carousel'"
      type="button"
      class="load-more-groups"
      @click="loadMore"
    >
      Load more ({{ groups.length }} groups)
    </button>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
  color: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.chip {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 150ms;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.chip.on {
  background: #fff;
  color: #000;
}

.chip.clear {
  margin-left: auto;
}

.switches {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

/* Desktop screens only, above the same 768px the player counts as a phone. It
   sits one step above the player overlay (--rk-stories-overlay-z, 9999). */
.load-more-groups {
  display: none;
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 10000;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background 150ms;
}

.load-more-groups:hover {
  background: rgba(255, 255, 255, 0.22);
}

@media (min-width: 769px) {
  .load-more-groups {
    display: block;
  }
}
</style>

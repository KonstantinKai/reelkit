<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
} from '@reelkit/vue-stories-player';
import '@reelkit/vue-stories-player/styles.css';
import { groups } from './api';

const open = ref(false);
const startGroup = ref(0);
let lastGroup = 0;
const tray = shallowRef<HTMLElement | null>(null);

// One controller for the rings and the player, kept in localStorage, so what
// was seen survives a reload.
const viewed = createStoriesViewedStateController({
  storageKey: 'stories-tray-seen',
  groups: () => groups,
});

function openAt(groupIndex: number) {
  startGroup.value = groupIndex;
  lastGroup = groupIndex;
  open.value = true;
}

function close() {
  open.value = false;
  // As it unmounts, the player hands focus back to the ring that opened it.
  // Wait one task for that, then move focus on to the ring of the person the
  // viewer stopped at, scrolled into view, so they continue from there.
  setTimeout(() => {
    const ring = tray.value
      ?.querySelectorAll<HTMLElement>('.rk-stories-ring-list-item')
      [lastGroup]?.querySelector<HTMLElement>('[role="button"]');
    ring?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    ring?.focus({ preventScroll: true });
  });
}
</script>

<template>
  <div class="stories-tray">
    <div ref="tray">
      <StoriesRingList :groups="groups" :viewed="viewed" @select="openAt" />
    </div>

    <button type="button" class="forget" @click="viewed.forget()">
      Forget what was seen
    </button>

    <StoriesOverlay
      :is-open="open"
      :groups="groups"
      :initial-group-index="startGroup"
      :viewed="viewed"
      @group-change="(groupIndex: number) => (lastGroup = groupIndex)"
      @close="close"
    />
  </div>
</template>

<style scoped>
.stories-tray {
  padding: 16px;
}

.forget {
  margin-top: 12px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}
</style>

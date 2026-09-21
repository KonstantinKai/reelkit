<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/vue-stories-player';

const props = defineProps<{ groups: StoriesGroup[] }>();

const isOpen = ref(false);
const groupIndex = shallowRef(0);

// One controller for the rings and the player. It reads the groups through
// the getter every time it needs them, so a feed that pages in more groups
// is counted too.
const viewed = createStoriesViewedStateController({
  storageKey: 'stories-seen',
  groups: () => props.groups,
});

const openGroup = (index: number) => {
  groupIndex.value = index;
  isOpen.value = true;
};
</script>

<template>
  <!-- The rings follow the controller by themselves. -->
  <StoriesRingList
    :groups="props.groups"
    :viewed="viewed"
    @select="openGroup"
  />

  <!-- The player resumes, records, and draws its card rings from it. -->
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="props.groups"
    :initial-group-index="groupIndex"
    :viewed="viewed"
  />
</template>

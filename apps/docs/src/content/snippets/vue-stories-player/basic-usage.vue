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
    author: { id: 'alice', name: 'Alice', avatar: '/alice.jpg', verified: true },
    stories: [
      { id: 's1', mediaType: 'image', src: '/story-1.jpg' },
      { id: 's2', mediaType: 'video', src: '/story-2.mp4', poster: '/poster-2.jpg' },
    ],
  },
  {
    author: { id: 'bob', name: 'Bob', avatar: '/bob.jpg' },
    stories: [{ id: 's3', mediaType: 'image', src: '/story-3.jpg' }],
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

  <!-- v-model:is-open keeps the ref in sync however the viewer closes it:
       the ✕ button, a swipe down, Escape, or the last story finishing. -->
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :initial-group-index="groupIndex"
  />
</template>

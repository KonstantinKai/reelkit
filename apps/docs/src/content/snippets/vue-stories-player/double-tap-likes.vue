<script setup lang="ts">
import { StoriesOverlay, type StoriesGroup } from '@reelkit/vue-stories-player';

const props = defineProps<{ groups: StoriesGroup[] }>();

// The heart animation is built in; the like itself is yours to keep.
const like = (groupIndex: number, storyIndex: number) => {
  const story = props.groups[groupIndex].stories[storyIndex];
  void fetch(`/api/stories/${story.id}/like`, { method: 'POST' });
};
</script>

<template>
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="props.groups"
    @double-tap="like"
  />
</template>

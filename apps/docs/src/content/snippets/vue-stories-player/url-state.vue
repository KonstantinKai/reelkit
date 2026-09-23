<script setup lang="ts">
import {
  StoriesUrlOverlay,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
  type StoriesGroup,
} from '@reelkit/vue-stories-player';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-stories-player/styles.css';

const props = defineProps<{ groups: StoriesGroup[] }>();

// The outer axis is the group, the inner one the story inside it.
const stories = useOverlayUrlState({
  param: 'story',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexTwoAxisKey({
    outerCount: () => props.groups.length,
    innerCounts: () => props.groups.map((group) => group.stories.length),
  }),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink
    v-for="(group, index) in props.groups"
    :key="group.author.id"
    :to="`?story=${index}.0`"
  >
    {{ group.author.name }}
  </RouterLink>

  <StoriesUrlOverlay :controller="stories" :groups="props.groups" />
</template>

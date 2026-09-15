<script setup lang="ts">
import { ReelPlayerUrlOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
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
  <RouterLink v-for="(post, i) in props.content" :key="post.id" :to="`?reel=${i}`">
    <img :src="post.media[0].src" />
  </RouterLink>

  <ReelPlayerUrlOverlay :controller="reel" :content="props.content" />
</template>

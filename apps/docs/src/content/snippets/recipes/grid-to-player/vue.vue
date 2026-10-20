<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';
import { posts, thumbnailOf } from './api';

const open = ref(false);
const startIndex = ref(0);
let lastViewed = 0;
const thumbnails: (HTMLButtonElement | null)[] = [];

function openAt(index: number) {
  startIndex.value = index;
  lastViewed = index;
  open.value = true;
}

function close() {
  open.value = false;
  // As it unmounts, the player hands focus back to the thumbnail that opened
  // it. Wait one task for that, then move focus on to the post the viewer
  // stopped at, scrolled into view, so they continue from there.
  setTimeout(() => {
    const thumbnail = thumbnails[lastViewed];
    thumbnail?.scrollIntoView({ block: 'nearest' });
    thumbnail?.focus({ preventScroll: true });
  });
}
</script>

<template>
  <div class="feed">
    <div class="grid">
      <button
        v-for="(post, index) in posts"
        :key="post.id"
        :ref="(element) => (thumbnails[index] = element as HTMLButtonElement | null)"
        type="button"
        class="thumbnail"
        :aria-label="`Open ${post.description}`"
        @click="openAt(index)"
      >
        <img :src="thumbnailOf(post)" alt="" loading="lazy" />
      </button>
    </div>

    <ReelPlayerOverlay
      :is-open="open"
      :content="posts"
      :initial-index="startIndex"
      @slide-change="(index: number) => (lastViewed = index)"
      @close="close"
    />
  </div>
</template>

<style scoped>
.feed {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.thumbnail {
  aspect-ratio: 3 / 4;
  padding: 0;
  border: 0;
  overflow: hidden;
  cursor: pointer;
  background: #1e293b;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

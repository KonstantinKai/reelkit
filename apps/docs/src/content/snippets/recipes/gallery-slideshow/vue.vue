<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';
import { photos } from './api';

// Counted from when each photo has loaded, so a slow one is never skipped.
const kSlideshowIntervalMs = 3000;

const open = ref(false);
const startIndex = ref(0);

function openAt(index: number) {
  startIndex.value = index;
  open.value = true;
}
</script>

<template>
  <div class="gallery">
    <div class="grid">
      <button
        v-for="(photo, index) in photos"
        :key="photo.src"
        type="button"
        class="thumbnail"
        :aria-label="`Open ${photo.title}`"
        @click="openAt(index)"
      >
        <img :src="photo.src" alt="" loading="lazy" />
      </button>
    </div>

    <!--
      The default bar gains a play and pause button and a download button once
      auto-advance and show-download are on.
    -->
    <LightboxOverlay
      v-model:is-open="open"
      :items="photos"
      :initial-index="startIndex"
      auto-advance
      :auto-advance-interval="kSlideshowIntervalMs"
      show-download
    />
  </div>
</template>

<style scoped>
.gallery {
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
  aspect-ratio: 1;
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

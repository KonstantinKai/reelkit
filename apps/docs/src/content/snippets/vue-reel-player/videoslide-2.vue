<script setup lang="ts">
import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/vue-reel-player';
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #slide="{ item, size, isActive, slideKey }">
      <ImageSlide
        v-if="item.media[0].type === 'image'"
        :src="item.media[0].src"
        :size="size"
        :style="{ backgroundColor: '#111' }"
        :img-style="{ objectFit: 'contain' }"
      />
      <VideoSlide
        v-else
        :src="item.media[0].src"
        :poster="item.media[0].poster"
        :aspect-ratio="item.media[0].aspectRatio"
        :size="size"
        :is-active="isActive"
        :slide-key="slideKey"
        :style="{ borderRadius: '16px' }"
      />
    </template>
  </ReelPlayerOverlay>
</template>

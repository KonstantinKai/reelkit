<script setup lang="ts">
import { ImageSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <ImageSlide :src="media.src" :size="size" />

  <ImageSlide
    :src="media.src"
    :size="size"
    class-name="my-image-slide"
    :style="{ backgroundColor: '#1a1a1a', borderRadius: '12px' }"
    :img-style="{ objectFit: 'contain' }"
  />
</template>

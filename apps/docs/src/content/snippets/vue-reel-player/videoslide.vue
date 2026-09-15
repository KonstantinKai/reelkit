<script setup lang="ts">
import { VideoSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <VideoSlide
    :src="media.src"
    :poster="media.poster"
    :aspect-ratio="9 / 16"
    :size="size"
    :is-active="isActive"
    :slide-key="slideKey"
    :style="{ borderRadius: '12px' }"
  />
</template>

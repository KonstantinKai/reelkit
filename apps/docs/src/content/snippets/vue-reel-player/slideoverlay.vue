<script setup lang="ts">
import { SlideOverlay } from '@reelkit/vue-reel-player';
</script>

<template>
  <SlideOverlay
    :author="{ name: 'John', avatar: '/avatar.jpg' }"
    description="Amazing content"
    :likes="12500"
  />
</template>

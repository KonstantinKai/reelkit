<script setup lang="ts">
import {
  LightboxOverlay,
  lightboxFadeTransition,
  lightboxZoomTransition,
} from '@reelkit/vue-lightbox';
</script>

<template>
  <!-- Built-in transition -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxFadeTransition"
  />

  <!-- Different built-in -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxZoomTransition"
  />
</template>

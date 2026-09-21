<script setup lang="ts">
import { StoriesOverlay } from '@reelkit/vue-stories-player';
import {
  cubeTransition,
  flipTransition,
  fadeTransition,
  zoomTransition,
  slideTransition,
} from '@reelkit/vue';
</script>

<template>
  <!-- cubeTransition is the default; flip, fade, zoom and slide ship too. -->
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :group-transition="flipTransition"
  />
</template>

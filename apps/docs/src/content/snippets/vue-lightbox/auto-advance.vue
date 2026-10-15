<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxApi } from '@reelkit/vue-lightbox';

const open = ref(false);
const lightbox = ref<LightboxApi | null>(null);
</script>

<template>
  <LightboxOverlay
    ref="lightbox"
    v-model:is-open="open"
    :items="items"
    auto-advance
    :auto-advance-interval="4000"
  />
  <!-- The template ref drives it from outside: lightbox?.pause() -->
</template>

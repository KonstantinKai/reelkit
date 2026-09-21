<script setup lang="ts">
import { ref } from 'vue';
import { StoriesOverlay } from '@reelkit/vue-stories-player';

const isOpen = ref(false);
</script>

<template>
  <button type="button" @click="isOpen = true">Open stories</button>

  <!-- One binding, in both directions. -->
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups" />

  <!-- The explicit pair still works when you need the event itself. -->
  <StoriesOverlay
    :is-open="isOpen"
    :groups="groups"
    @close="isOpen = false"
  />
</template>

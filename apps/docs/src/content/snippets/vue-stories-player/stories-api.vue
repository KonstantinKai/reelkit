<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { StoriesOverlay, type StoriesApi } from '@reelkit/vue-stories-player';

const isOpen = ref(false);
const player = useTemplateRef<StoriesApi>('player');

// Calls while the player is closed are safely ignored.
const skipUser = () => player.value?.nextGroup();
</script>

<template>
  <button type="button" @click="skipUser">Skip this user</button>

  <StoriesOverlay
    ref="player"
    v-model:is-open="isOpen"
    :groups="groups"
    @api-ready="(api) => api.pause()"
  />
</template>

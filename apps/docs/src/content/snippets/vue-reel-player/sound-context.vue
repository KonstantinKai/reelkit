<script setup lang="ts">
import { useSoundState, toVueRef } from '@reelkit/vue';

// Inside a custom control rendered from the #controls slot:
const soundState = useSoundState();
const muted = toVueRef(soundState.muted);
</script>

<template>
  <button @click="soundState.toggle()">
    {{ muted ? 'Unmute' : 'Mute' }}
  </button>
</template>

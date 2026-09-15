<script setup lang="ts">
import { shallowRef } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = shallowRef<HTMLDivElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });
</script>

<template>
  <div ref="containerRef">
    <button @click="toggle">
      {{ isFullscreen.value ? 'Exit fullscreen' : 'Enter fullscreen' }}
    </button>
  </div>
</template>

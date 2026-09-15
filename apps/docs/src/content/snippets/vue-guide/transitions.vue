<script setup lang="ts">
import { Reel, cubeTransition } from '@reelkit/vue';
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    :transition="cubeTransition"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>

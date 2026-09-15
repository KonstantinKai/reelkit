<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<InstanceType<typeof Reel> & ReelExpose>();
</script>

<template>
  <Reel ref="reelRef" :count="10" :size="[400, 600]">
    <template #item="{ index }">
      <Slide :index="index" />
    </template>
  </Reel>

  <button @click="reelRef?.prev()">Prev</button>
  <button @click="reelRef?.next()">Next</button>
  <button @click="reelRef?.goTo(5)">Go to 5</button>
</template>

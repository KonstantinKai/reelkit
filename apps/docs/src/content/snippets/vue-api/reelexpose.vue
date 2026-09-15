<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<ReelExpose | null>(null);

function prev()  { reelRef.value?.prev(); }
function next()  { reelRef.value?.next(); }
function jump(i: number) { reelRef.value?.goTo(i, true); }
</script>

<template>
  <Reel ref="reelRef" :count="100">
    <template #item="{ index }">
      <div>Slide {{ index }}</div>
    </template>
  </Reel>
</template>

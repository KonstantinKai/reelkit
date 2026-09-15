<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const sliderRef = ref<ReelExpose | null>(null);
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="10"
    :size="[400, 600]"
  >
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        Slide {{ index + 1 }}
      </div>
    </template>
  </Reel>

  <button @click="sliderRef?.prev()">Prev</button>
  <button @click="sliderRef?.next()">Next</button>
  <button @click="sliderRef?.goTo(5)">Go to 6</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const items = [
  { title: 'Slide 1', color: '#6366f1' },
  { title: 'Slide 2', color: '#8b5cf6' },
  { title: 'Slide 3', color: '#ec4899' },
];

const sliderRef = ref<ReelExpose | null>(null);
const currentIndex = ref(0);

const onAfterChange = (index: number) => {
  currentIndex.value = index;
};
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>
  </Reel>

  <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%)">
    <button
      :disabled="currentIndex === 0"
      @click="sliderRef?.prev()"
    >
      Prev
    </button>
    <button
      :disabled="currentIndex === items.length - 1"
      @click="sliderRef?.next()"
    >
      Next
    </button>
    <button @click="sliderRef?.goTo(2)">Go to 3</button>
  </div>
</template>

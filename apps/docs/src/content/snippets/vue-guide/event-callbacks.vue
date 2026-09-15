<script setup lang="ts">
import { Reel } from '@reelkit/vue';

const onBeforeChange = (index: number, nextIndex: number, rangeIndex: number) => {
  console.log('Transitioning from', index, 'to', nextIndex);
};

const onAfterChange = (index: number, rangeIndex: number) => {
  console.log('Arrived at slide', index);
};

const onSlideDragStart = (index: number) => {
  console.log('Started dragging slide', index);
};

const onSlideDragEnd = (index: number) => {
  console.log('Stopped dragging slide', index);
};
</script>

<template>
  <Reel
    :count="20"
    style="width: 100%; height: 100dvh"
    @before-change="onBeforeChange"
    @after-change="onAfterChange"
    @slide-drag-start="onSlideDragStart"
    @slide-drag-end="onSlideDragEnd"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>

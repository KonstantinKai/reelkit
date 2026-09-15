<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    direction="vertical"
    enable-wheel
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: '#fff',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>

    <ReelIndicator />
  </Reel>
</template>

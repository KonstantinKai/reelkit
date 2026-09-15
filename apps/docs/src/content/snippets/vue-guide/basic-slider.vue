<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
  { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
  { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
];

const onAfterChange = (index: number) => {
  console.log('Current index:', index);
};
</script>

<template>
  <Reel
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
          background: items[index].color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }"
      >
        <div style="font-size: 1.5rem; font-weight: bold">
          {{ items[index].title }}
        </div>
        <div style="font-size: 0.875rem; opacity: 0.8">
          {{ items[index].subtitle }}
        </div>
      </div>
    </template>

    <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 10">
      <ReelIndicator direction="vertical" />
    </div>
  </Reel>
</template>

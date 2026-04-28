<script setup lang="ts">
import type { FeedItem } from '../types';

const { data: items } = await useAsyncData<FeedItem[]>('feed', () =>
  Promise.resolve(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      title: `Slide ${i + 1}`,
      color: `hsl(${(i * 37) % 360}, 70%, 65%)`,
    })),
  ),
);
</script>

<template>
  <Feed v-if="items" :items="items" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  type BaseContentItem,
  type SlideOverlaySlotScope,
} from '@reelkit/vue-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  category: 'video' | 'photo';
}

const open = ref(false);
const items: MyItem[] = [/* ... */];
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="open" :content="items">
    <template #slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>">
      <div class="my-overlay">
        <h2>{{ item.title }}</h2>
        <span>{{ item.category }}</span>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>

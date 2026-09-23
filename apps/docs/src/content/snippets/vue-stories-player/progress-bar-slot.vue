<script setup lang="ts">
import { toVueRef, type Signal } from '@reelkit/vue';

const props = defineProps<{
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
}>();

// Core signals do not re-render a Vue component on their own: bridge them.
const active = toVueRef(props.activeIndex);
const progress = toVueRef(props.progress);
</script>

<template>
  <div class="my-progress">
    <span
      v-for="index in totalStories"
      :key="index"
      class="my-segment"
      :style="{
        '--fill':
          index - 1 < active
            ? '100%'
            : index - 1 === active
              ? `${progress * 100}%`
              : '0%',
      }"
    />
  </div>
</template>

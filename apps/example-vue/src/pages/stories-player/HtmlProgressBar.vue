<script setup lang="ts">
import { toVueRef, type Signal } from '@reelkit/vue';

/**
 * A progress bar drawn from plain elements, for the `progressBar` slot demo.
 * The signals are bridged into Vue refs so the segments follow the timer.
 */
const props = defineProps<{
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
}>();

const active = toVueRef(props.activeIndex);
const progress = toVueRef(props.progress);

const fill = (index: number) =>
  index < active.value
    ? 100
    : index === active.value
      ? progress.value * 100
      : 0;
</script>

<template>
  <div class="bar">
    <div v-for="index in totalStories" :key="index" class="segment">
      <div
        class="fill"
        :class="{ done: index - 1 < active, current: index - 1 === active }"
        :style="{ width: `${fill(index - 1)}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  gap: 4px;
  padding: 8px 8px 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.segment {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  transition: width 200ms;
}

.fill.done {
  background: #6366f1;
}

.fill.current {
  transition: none;
}
</style>

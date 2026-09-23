<script setup lang="ts">
import { Observe, toVueRef } from '@reelkit/vue';
import { createTimerController } from '@reelkit/stories-core';

const timer = createTimerController({ duration: 5000 });

// toVueRef binds the signal to THIS component: every tick re-renders all of
// it. Fine for a small component, wasteful when something heavy sits beside
// the part that changes.
const progress = toVueRef(timer.progress);
</script>

<template>
  <section>
    <!-- Only the slot below re-renders on a tick; the list keeps its DOM. -->
    <Observe :signals="[timer.progress]">
      <progress :value="timer.progress.value" max="1" />
    </Observe>

    <ExpensiveList :items="items" />

    <!-- The same value through toVueRef, for comparison. -->
    <p>{{ Math.round(progress * 100) }}%</p>
  </section>
</template>

<script setup lang="ts">
import type { TimelineSlotScope } from '@reelkit/vue-reel-player';
</script>

<template>
  <!-- Wrap or augment the default bar from #timeline: -->
  <ReelPlayerOverlay>
    <template #timeline="{ defaultContent }: TimelineSlotScope">
      <MyTimecode />
      <component :is="defaultContent" />
    </template>
  </ReelPlayerOverlay>
</template>

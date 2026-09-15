<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import {
  ReelPlayerOverlay,
  type TimelineSlotScope,
} from '@reelkit/vue-reel-player';
import { toVueRef, type TimelineController } from '@reelkit/vue';

const trackRef = shallowRef<HTMLDivElement | null>(null);
let dispose: (() => void) | null = null;
const bind = (state: TimelineController) => {
  if (trackRef.value) dispose = state.bindInteractions(trackRef.value);
};
onBeforeUnmount(() => dispose?.());
</script>

<template>
  <ReelPlayerOverlay :is-open="open" :content="items" timeline="always">
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <div class="rk-reel-timeline" style="padding: 0 16px" @vue:mounted="bind(timelineState)">
        <div ref="trackRef" role="slider" style="height:6px;background:rgba(255,255,255,0.2)">
          <div :style="{
            width: (timelineState.progress.value * 100) + '%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #ec4899)',
          }" />
        </div>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>

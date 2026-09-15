<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
  type SlideOverlaySlotScope,
  type ControlsSlotScope,
} from '@reelkit/vue-reel-player';

const isOpen = ref(false);
const content = ref<ContentItem[]>([/* ... */]);
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <!-- Custom per-slide overlay: branded caption -->
    <template #slideOverlay="{ item, isActive }: SlideOverlaySlotScope">
      <div v-if="isActive" style="position:absolute;bottom:80px;left:16px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px">
          <img :src="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
          <span style="font-weight:600">{{ item.author.name }}</span>
        </div>
        <p style="margin-top:8px">{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom global controls -->
    <template #controls="{ onClose }: ControlsSlotScope">
      <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
        <SoundButton />
        <CloseButton :on-click="onClose" />
      </div>
    </template>

    <!-- Custom playback timeline -->
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <CustomTimelineBar :state="timelineState" />
    </template>
  </ReelPlayerOverlay>
</template>

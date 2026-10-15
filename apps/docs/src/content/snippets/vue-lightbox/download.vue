<script setup lang="ts">
import { ref } from 'vue';
import {
  CloseButton,
  DownloadButton,
  LightboxOverlay,
  type LightboxItem,
} from '@reelkit/vue-lightbox';

const open = ref(false);
const items: LightboxItem[] = [
  {
    src: 'https://cdn.example.com/beach-1600.jpg',
    // Save the original rather than the resized preview
    downloadUrl: 'https://cdn.example.com/beach-original.jpg',
    downloadName: 'beach.jpg',
  },
];
</script>

<template>
  <LightboxOverlay v-model:is-open="open" :items="items" show-download>
    <!-- A custom bar shows the buttons only when their handler is there -->
    <template #controls="{ onClose, isDownloading, onDownload }">
      <DownloadButton
        v-if="onDownload"
        :is-downloading="isDownloading"
        :on-press="onDownload"
      />
      <CloseButton :on-press="onClose" />
    </template>
  </LightboxOverlay>
</template>

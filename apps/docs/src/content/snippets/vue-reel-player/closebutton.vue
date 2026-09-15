<script setup lang="ts">
import { CloseButton } from '@reelkit/vue-reel-player';
</script>

<template>
  <CloseButton :on-click="onClose" />
  <CloseButton :on-click="onClose" class-name="my-close-btn" :style="{ top: '24px', right: '24px' }" />
</template>

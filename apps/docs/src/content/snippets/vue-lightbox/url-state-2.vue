<script setup lang="ts">
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const adapter = useVueRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>

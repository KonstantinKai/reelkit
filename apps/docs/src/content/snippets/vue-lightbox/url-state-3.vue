<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>

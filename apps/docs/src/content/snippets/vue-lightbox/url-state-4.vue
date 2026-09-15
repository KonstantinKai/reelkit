<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>

<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => items.value.findIndex((x) => x.id === id),
    identify: (index) => items.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      items.value = loaded; // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="items" />
</template>

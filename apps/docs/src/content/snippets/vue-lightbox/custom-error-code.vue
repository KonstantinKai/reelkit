<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #error="{ item, activeIndex }">
      <div class="my-error">
        <span>Failed to load</span>
        <span class="muted">{{ item.title ?? item.src }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>

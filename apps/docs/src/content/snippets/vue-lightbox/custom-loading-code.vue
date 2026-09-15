<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #loading="{ item, activeIndex }">
      <div class="my-loading">
        <span>Loading image {{ activeIndex + 1 }}…</span>
        <span class="muted">{{ item.title }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>

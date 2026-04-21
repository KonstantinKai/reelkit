<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const pathname = computed(() => route.path);

const links = [
  { to: '/', label: 'Full Page Slider' },
  { to: '/reel-player', label: 'Reel Player' },
  { to: '/reel-player-custom', label: 'Custom Player' },
];
</script>

<template>
  <nav class="topnav">
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="link"
      :class="{ active: pathname === link.to }"
    >
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.topnav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 1000;
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.topnav::-webkit-scrollbar {
  display: none;
}
.link {
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.8rem;
  transition: background-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.link.active {
  background-color: rgba(255, 255, 255, 0.9);
  color: #000;
}
</style>

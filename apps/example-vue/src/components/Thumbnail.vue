<script setup lang="ts">
import { ref } from 'vue';
import { ImageOff } from 'lucide-vue-next';

defineProps<{ src: string }>();

const errored = ref(false);
</script>

<template>
  <div v-if="errored" class="error">
    <ImageOff :size="32" :stroke-width="1.5" />
    <span>Error</span>
  </div>
  <img v-else :src="src" alt="" loading="lazy" @error="errored = true" />
</template>

<style scoped>
img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: #1a1a1a;
  color: rgba(255, 255, 255, 0.3);
}
.error span {
  font-size: 10px;
}
</style>

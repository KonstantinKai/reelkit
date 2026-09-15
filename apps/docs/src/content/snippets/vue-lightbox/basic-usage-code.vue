<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

const open = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  open.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    <button
      v-for="(img, i) in images"
      :key="img.src"
      style="aspect-ratio:4/3;cursor:pointer"
      @click="openAt(i)"
    >
      <img :src="img.src" style="width:100%;height:100%;object-fit:cover" />
    </button>
  </div>

  <LightboxOverlay
    v-model:is-open="open"
    :items="images"
    :initial-index="startIndex"
  />
</template>

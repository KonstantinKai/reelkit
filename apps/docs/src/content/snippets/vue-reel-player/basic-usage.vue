<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: '/cdn/samples/videos/video-01.mp4',
      poster: '/cdn/samples/videos/video-poster-01.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: '/cdn/samples/images/image-01.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: '/cdn/samples/avatars/avatar-02.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [{
      id: 'v2',
      type: 'video',
      src: '/cdn/samples/videos/video-02.mp4',
      poster: '/cdn/samples/videos/video-poster-02.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Mike Chen', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'Adventure awaits',
  },
];

const isOpen = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  isOpen.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
    <button
      v-for="(item, i) in content"
      :key="item.id"
      @click="openAt(i)"
      style="aspect-ratio:9/16;cursor:pointer;overflow:hidden;padding:0;border:0"
    >
      <img
        :src="item.media[0].poster || item.media[0].src"
        style="width:100%;height:100%;object-fit:cover"
      />
    </button>
  </div>

  <ReelPlayerOverlay
    v-model:is-open="isOpen"
    :content="content"
    :initial-index="startIndex"
  />
</template>

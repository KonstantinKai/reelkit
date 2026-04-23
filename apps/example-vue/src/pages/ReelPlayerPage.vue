<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ReelPlayerOverlay,
  type ContentItem,
  type MediaItem,
} from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';
import { cdnUrl, generateContent, getThumbnail } from '@reelkit/example-data';
import Thumbnail from '../components/Thumbnail.vue';

const _kContentCount = 50;

const isPlayerOpen = ref(false);
const selectedIndex = ref(0);

const content = computed<ContentItem[]>(() => {
  const items = generateContent(_kContentCount);
  items.splice(1, 0, {
    id: 'long-video-content',
    media: [
      {
        id: 'long-video',
        type: 'video',
        src: cdnUrl('samples/videos/video-06.mp4'),
        poster: cdnUrl('samples/videos/video-poster-06.jpg'),
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'Timeline Demo',
      avatar: cdnUrl('samples/avatars/avatar-02.jpg'),
    },
    likes: 4200,
    description:
      'Long video: the playback timeline bar should render automatically.',
  });
  items.splice(3, 0, {
    id: 'broken-content',
    media: [
      {
        id: 'broken-img',
        type: 'image',
        src: 'https://broken.invalid/does-not-exist.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: {
      name: 'Error Demo',
      avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
    },
    likes: 0,
    description: 'This slide has a broken image to demonstrate error handling.',
  });
  return items;
});

const openPlayer = (index: number) => {
  selectedIndex.value = index;
  isPlayerOpen.value = true;
};

const closePlayer = () => {
  isPlayerOpen.value = false;
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Reel Player Demo</h1>
      <p class="subtitle">
        Click on any thumbnail to open the player. Swipe up/down or use arrow
        keys to navigate. Supports images, videos, and multi-media posts with
        horizontal sliders.
      </p>

      <div class="grid">
        <div
          v-for="(item, index) in content"
          :key="item.id"
          class="thumb"
          @click="openPlayer(index)"
        >
          <Thumbnail :src="getThumbnail(item)" />
          <div
            v-if="item.media.some((m: MediaItem) => m.type === 'video')"
            class="video-badge"
          >
            ▶
          </div>
          <div v-if="item.media.length > 1" class="multi-badge">
            {{ item.media.length }}
          </div>
          <div class="author">
            <img :src="item.author.avatar" alt="" class="avatar" />
            <span class="author-name">{{ item.author.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <ReelPlayerOverlay
      :is-open="isPlayerOpen"
      :content="content"
      :initial-index="selectedIndex"
      :timeline-min-duration-seconds="10"
      @close="closePlayer"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
  color: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #222;
  transition: transform 0.2s;
}

.thumb:hover {
  transform: scale(1.02);
}

.video-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.multi-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  font-size: 0.7rem;
  font-weight: 500;
}

.author {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px 8px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

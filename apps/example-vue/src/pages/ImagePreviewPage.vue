<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  LightboxOverlay,
  flipTransition,
  lightboxFadeTransition,
  lightboxZoomTransition,
  slideTransition,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import type {
  SwipeToCloseDirection,
  TransitionTransformFn,
} from '@reelkit/vue';
import { cdnUrl } from '@reelkit/example-data';
import Thumbnail from '../components/Thumbnail.vue';
import '@reelkit/vue-lightbox/styles.css';

const _kTransitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'slide', fn: slideTransition },
  { label: 'fade', fn: lightboxFadeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'zoom-in', fn: lightboxZoomTransition },
];
const _kSwipeDirections: SwipeToCloseDirection[] = ['up', 'down'];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description:
      'A beautiful mountain river flowing through the forest. The water is crystal clear and reflects the surrounding trees.',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
    width: 1000,
    height: 1600,
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description:
      'Misty morning in the dense forest. The sun rays pierce through the fog creating a magical atmosphere.',
    width: 1600,
    height: 900,
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
    width: 900,
    height: 1400,
  },
  {
    src: 'https://broken.invalid/does-not-exist.jpg',
    title: 'Broken Image',
    description:
      'This image intentionally fails to demonstrate error handling.',
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description:
      'A winding path through the autumn forest covered in golden leaves.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-06.jpg'),
    title: 'Sunset Silhouette',
    width: 1200,
    height: 1800,
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-08.jpg'),
    title: 'Desert Dunes',
    description:
      'Rolling sand dunes stretching to the horizon under the scorching sun.',
    width: 1920,
    height: 1280,
  },
  {
    src: cdnUrl('samples/images/image-09.jpg'),
    title: 'Puppy Portrait',
    description: 'An adorable puppy looking at the camera with curious eyes.',
    width: 900,
    height: 1350,
  },
  {
    src: cdnUrl('samples/images/image-10.jpg'),
    title: 'Northern Lights',
    description: 'The magical aurora borealis dancing across the night sky.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-11.jpg'),
    title: 'City Lights',
    description: 'Urban skyline glittering at night.',
    width: 1080,
    height: 1620,
  },
  {
    src: cdnUrl('samples/images/image-12.jpg'),
    title: 'Waterfall',
    description: 'A thundering waterfall cascading down the rocky cliff.',
    width: 1600,
    height: 1067,
  },
];

const open = ref(false);
const initialIndex = ref(0);
const transitionFn = ref<TransitionTransformFn>(slideTransition);
const swipeDirection = ref<SwipeToCloseDirection>('up');

const openAt = (index: number) => {
  initialIndex.value = index;
  open.value = true;
};

const onKeyActivate = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openAt(index);
  }
};

// Disable mobile pull-to-refresh while the lightbox is open so the
// `swipe-to-close-direction="down"` gesture is not preempted.
watch(open, (isOpen, _, onCleanup) => {
  if (!isOpen) return;
  const html = document.documentElement;
  const prev = html.style.overscrollBehaviorY;
  html.style.overscrollBehaviorY = 'contain';
  onCleanup(() => {
    html.style.overscrollBehaviorY = prev;
  });
});
</script>

<template>
  <div class="image-gallery-page">
    <header class="gallery-header">
      <h1>Image Gallery</h1>
      <p>
        Click on any image to open the preview. Use arrow keys or swipe to
        navigate.
      </p>
      <div class="transition-selector">
        <span>Transition:</span>
        <button
          v-for="t in _kTransitions"
          :key="t.label"
          class="transition-btn"
          :class="{ active: transitionFn === t.fn }"
          @click="transitionFn = t.fn"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="transition-selector">
        <span>Swipe-to-close:</span>
        <button
          v-for="d in _kSwipeDirections"
          :key="d"
          class="transition-btn"
          :class="{ active: swipeDirection === d }"
          @click="swipeDirection = d"
        >
          {{ d }}
        </button>
      </div>
    </header>

    <div class="gallery-grid">
      <div
        v-for="(image, index) in sampleImages"
        :key="index"
        class="gallery-item"
        role="button"
        tabindex="0"
        @click="openAt(index)"
        @keydown="onKeyActivate($event, index)"
      >
        <Thumbnail :src="image.src" />
        <div class="gallery-item-overlay">
          <span v-if="image.title" class="gallery-item-title">{{
            image.title
          }}</span>
        </div>
      </div>
    </div>

    <LightboxOverlay
      v-model:is-open="open"
      :items="sampleImages"
      :initial-index="initialIndex"
      :transition-fn="transitionFn"
      :swipe-to-close-direction="swipeDirection"
    />
  </div>
</template>

<style scoped>
.image-gallery-page {
  min-height: 100dvh;
  padding: 56px 24px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.gallery-header {
  max-width: 1200px;
  margin: 0 auto 32px;
  text-align: center;
  color: #fff;
}

.gallery-header h1 {
  margin: 0 0 12px;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gallery-header p {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.transition-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.transition-selector span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.transition-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.transition-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.transition-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4 / 3;
  background: rgba(255, 255, 255, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.gallery-item:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.gallery-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-item-overlay {
  opacity: 1;
}

.gallery-item-title {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .image-gallery-page {
    padding: 48px 12px 12px;
  }

  .gallery-header h1 {
    font-size: 1.75rem;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .gallery-item {
    border-radius: 8px;
  }

  .gallery-item-overlay {
    opacity: 1;
    padding: 8px;
  }

  .gallery-item-title {
    font-size: 12px;
  }
}
</style>

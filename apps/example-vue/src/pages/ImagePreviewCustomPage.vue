<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  LightboxOverlay,
  CloseButton,
  Counter,
  FullscreenButton,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/vue-lightbox/styles.css';

type DemoType =
  | 'custom-info'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-navigation'
  | 'custom-loading-error'
  | 'theming'
  | null;

interface DemoCard {
  id: Exclude<DemoType, null>;
  title: string;
  description: string;
}

const demos: DemoCard[] = [
  {
    id: 'custom-info',
    title: 'Custom Info Overlay',
    description:
      'Uses the #info slot to replace the default title/description with a custom styled overlay.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses the #controls slot with CloseButton + Counter + FullscreenButton sub-components plus a custom Download button.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide',
    description:
      'Uses the #slide slot to inject a CTA card on the last slide. Other slides fall back to the default image renderer.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses the #navigation slot to replace the default prev/next arrows with pill-shaped buttons and a counter.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses the #loading and #error slots to replace the default spinner and error icon. Includes a broken image to demonstrate the error state.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the lightbox by overriding --rk-lightbox-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest.',
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the sea.',
  },
];

const imagesWithBroken: LightboxItem[] = [
  ...sampleImages.slice(0, 2),
  {
    src: 'https://broken.invalid/does-not-exist.jpg',
    title: 'Broken Image',
    description: 'This image fails to load — shows custom error UI.',
  },
  ...sampleImages.slice(2, 4),
];

const activeDemo = ref<DemoType>(null);
const isOpen = computed({
  get: () => activeDemo.value !== null,
  set: (v: boolean) => {
    if (!v) activeDemo.value = null;
  },
});

const openDemo = (id: Exclude<DemoType, null>) => {
  activeDemo.value = id;
};

const themingCss = `
  :root {
    --rk-lightbox-overlay-bg: #0f172a;
    --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
    --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
    --rk-lightbox-nav-size: 56px;
    --rk-lightbox-counter-bg: rgba(99, 102, 241, 0.65);
    --rk-lightbox-info-bg: linear-gradient(
      transparent,
      rgba(99, 102, 241, 0.55) 60%,
      rgba(168, 85, 247, 0.85)
    );
  }
`;
</script>

<template>
  <div class="custom-page">
    <div class="container">
      <h1>Custom Lightbox</h1>
      <p class="subtitle">
        Demonstrates slot-based customization: info overlays, controls,
        navigation, and custom slides.
      </p>

      <div class="demo-grid">
        <div v-for="demo in demos" :key="demo.id" class="demo-card">
          <h2>{{ demo.title }}</h2>
          <p>{{ demo.description }}</p>
          <button @click="openDemo(demo.id)">Open Demo</button>
        </div>
      </div>
    </div>

    <!-- Custom info -->
    <LightboxOverlay
      v-if="activeDemo === 'custom-info'"
      v-model:is-open="isOpen"
      :items="sampleImages"
    >
      <template #info="{ item }">
        <div class="custom-info">
          <div class="custom-info-title">{{ item.title }}</div>
          <div v-if="item.description" class="custom-info-description">
            {{ item.description }}
          </div>
        </div>
      </template>
    </LightboxOverlay>

    <!-- Custom controls -->
    <LightboxOverlay
      v-if="activeDemo === 'custom-controls'"
      v-model:is-open="isOpen"
      :items="sampleImages"
      :show-info="false"
    >
      <template
        #controls="{
          onClose,
          activeIndex,
          count,
          isFullscreen,
          onToggleFullscreen,
        }"
      >
        <div class="custom-controls">
          <div class="custom-controls-left">
            <Counter :current-index="activeIndex" :count="count" />
            <FullscreenButton
              :is-fullscreen="isFullscreen"
              :on-press="onToggleFullscreen"
            />
          </div>
          <div class="custom-controls-right">
            <button class="pill-btn">Download</button>
            <CloseButton :on-press="onClose" class="pill-close" />
          </div>
        </div>
      </template>
    </LightboxOverlay>

    <!-- Custom slide -->
    <LightboxOverlay
      v-if="activeDemo === 'custom-slide'"
      v-model:is-open="isOpen"
      :items="sampleImages"
    >
      <template #slide="{ index, size, onReady }">
        <template v-if="index === sampleImages.length - 1">
          <div
            class="cta-slide"
            :style="{ width: `${size[0]}px`, height: `${size[1]}px` }"
          >
            <h2>View all photos</h2>
            <p>You&rsquo;ve reached the end of the gallery</p>
            <button class="cta-button" @click="onReady">Browse Gallery</button>
          </div>
        </template>
      </template>
    </LightboxOverlay>

    <!-- Custom navigation -->
    <LightboxOverlay
      v-if="activeDemo === 'custom-navigation'"
      v-model:is-open="isOpen"
      :items="sampleImages"
    >
      <template #navigation="{ onPrev, onNext, activeIndex, count }">
        <div class="custom-nav">
          <button
            class="pill-btn"
            :disabled="activeIndex === 0"
            @click="onPrev"
          >
            Prev
          </button>
          <span class="custom-nav-counter">
            {{ activeIndex + 1 }} / {{ count }}
          </span>
          <button
            class="pill-btn"
            :disabled="activeIndex === count - 1"
            @click="onNext"
          >
            Next
          </button>
        </div>
      </template>
      <template #controls="{ onClose, isFullscreen, onToggleFullscreen }">
        <div class="custom-nav-controls">
          <FullscreenButton
            :is-fullscreen="isFullscreen"
            :on-press="onToggleFullscreen"
          />
          <CloseButton :on-press="onClose" class="pill-close" />
        </div>
      </template>
    </LightboxOverlay>

    <!-- Custom loading / error -->
    <LightboxOverlay
      v-if="activeDemo === 'custom-loading-error'"
      v-model:is-open="isOpen"
      :items="imagesWithBroken"
    >
      <template #loading="{ activeIndex }">
        <div class="custom-loading">
          Loading slide {{ activeIndex + 1 }}&hellip;
        </div>
      </template>
      <template #error="{ activeIndex }">
        <div class="custom-error">
          <div class="custom-error-icon">⚠️</div>
          <div>Slide {{ activeIndex + 1 }} failed to load</div>
        </div>
      </template>
    </LightboxOverlay>

    <!-- Themed via CSS tokens -->
    <template v-if="activeDemo === 'theming'">
      <component :is="'style'">{{ themingCss }}</component>
      <LightboxOverlay v-model:is-open="isOpen" :items="sampleImages" />
    </template>
  </div>
</template>

<style scoped>
.custom-page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.container h1 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.demo-card {
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-card h2 {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.demo-card p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  line-height: 1.5;
  flex: 1;
}

.demo-card button {
  padding: 10px 20px;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Custom info */
.custom-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(transparent, rgba(99, 102, 241, 0.8));
  color: #fff;
  z-index: 10;
}
.custom-info-title {
  font-weight: 600;
  font-size: 1rem;
}
.custom-info-description {
  font-size: 0.8rem;
  opacity: 0.85;
  margin-top: 4px;
}

/* Custom controls */
.custom-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  z-index: 10;
}
.custom-controls-left,
.custom-controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  backdrop-filter: blur(8px);
}
.pill-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.pill-close {
  position: static;
}

/* CTA slide */
.cta-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #111;
  color: #fff;
  gap: 16px;
}
.cta-slide h2 {
  font-size: 1.5rem;
  font-weight: 600;
}
.cta-slide p {
  opacity: 0.6;
}
.cta-button {
  padding: 12px 24px;
  border-radius: 20px;
  border: none;
  background-color: #6366f1;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Custom navigation */
.custom-nav {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}
.custom-nav-counter {
  color: #fff;
  font-size: 0.85rem;
}
.custom-nav-controls {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  z-index: 10;
}

/* Custom loading / error */
.custom-loading {
  position: absolute;
  top: 22px;
  right: 72px;
  z-index: 10;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 12px;
}
.custom-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  color: #ff6b6b;
  text-align: center;
}
.custom-error-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>

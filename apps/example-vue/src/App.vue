<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  OneItemSlider,
  OneItemSliderIndicator,
  type OneItemSliderExpose,
} from '@kdevsoft/one-item-slider-vue';

const SLIDES = [
  { id: 1, color: '#FF6B6B', title: 'Slide 1', description: 'Swipe up or down to navigate' },
  { id: 2, color: '#4ECDC4', title: 'Slide 2', description: 'Like TikTok!' },
  { id: 3, color: '#45B7D1', title: 'Slide 3', description: 'Smooth animations' },
  { id: 4, color: '#96CEB4', title: 'Slide 4', description: 'Touch or keyboard' },
  { id: 5, color: '#FFEAA7', title: 'Slide 5', description: 'Use arrow keys ↑↓' },
];

const activeIndex = ref(0);
const sliderRef = ref<OneItemSliderExpose | null>(null);
const size = ref<[number, number]>([window.innerWidth, window.innerHeight]);

const handleResize = () => {
  size.value = [window.innerWidth, window.innerHeight];
  sliderRef.value?.adjust();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleIndexChange = (index: number) => {
  activeIndex.value = index;
};

const handlePrev = () => {
  sliderRef.value?.prev();
};

const handleNext = () => {
  sliderRef.value?.next();
};

const handleIndicatorClick = (index: number) => {
  sliderRef.value?.goTo(index);
};
</script>

<template>
  <div :style="{ width: '100vw', height: '100vh', overflow: 'hidden' }">
    <OneItemSlider
      ref="sliderRef"
      :count="SLIDES.length"
      :size="size"
      direction="vertical"
      @index-change="handleIndexChange"
    >
      <template #default="{ indexes, axisValue }">
        <!-- Container that moves -->
        <div
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            transform: `translateY(${axisValue}px)`,
            width: '100%',
            height: `${indexes.length * size[1]}px`,
          }"
        >
          <!-- Each slide in the visible range -->
          <div
            v-for="(dataIndex, rangeIndex) in indexes"
            :key="SLIDES[dataIndex].id"
            :style="{
              width: `${size[0]}px`,
              height: `${size[1]}px`,
              backgroundColor: SLIDES[dataIndex].color,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }"
          >
            <h1 :style="{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }">
              {{ SLIDES[dataIndex].title }}
            </h1>
            <p :style="{ fontSize: '1.25rem', opacity: 0.7, color: '#000' }">
              {{ SLIDES[dataIndex].description }}
            </p>
          </div>
        </div>
      </template>
    </OneItemSlider>

    <div
      :style="{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }"
    >
      <OneItemSliderIndicator
        :count="SLIDES.length"
        :active-index="activeIndex"
        direction="vertical"
        @click="handleIndicatorClick"
      />
    </div>

    <div
      :style="{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10,
      }"
    >
      <button
        @click="handlePrev"
        :style="{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          cursor: 'pointer',
        }"
      >
        ↑ Previous
      </button>
      <button
        @click="handleNext"
        :style="{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          cursor: 'pointer',
        }"
      >
        Next ↓
      </button>
    </div>
  </div>
</template>

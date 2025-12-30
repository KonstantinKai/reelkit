<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Reel,
  ReelIndicator,
  type ReelExpose,
} from '@reelkit/vue';

const TOTAL_SLIDES = 10000;

// Generate color from index using HSL for nice variety
const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360; // Golden angle for good distribution
  return `hsl(${hue}, 70%, 65%)`;
};

// Generate slide content from index
const getSlideContent = (index: number) => ({
  title: `Slide ${index + 1}`,
  description: index === 0
    ? 'Swipe up or down to navigate'
    : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

const activeIndex = ref(0);
const sliderRef = ref<ReelExpose | null>(null);
const size = ref<[number, number]>([window.innerWidth, window.innerHeight]);
const goToValue = ref('');

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

const handleGoTo = () => {
  const index = parseInt(goToValue.value, 10) - 1;
  if (index >= 0 && index < TOTAL_SLIDES) {
    sliderRef.value?.goTo(index, true);
  }
};

const handleGoToKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleGoTo();
  }
};

const handleIndicatorClick = (index: number) => {
  sliderRef.value?.goTo(index, true);
};
</script>

<template>
  <div :style="{ width: '100vw', height: '100vh', overflow: 'hidden' }">
    <Reel
      ref="sliderRef"
      :count="TOTAL_SLIDES"
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
            v-for="dataIndex in indexes"
            :key="dataIndex"
            :style="{
              width: `${size[0]}px`,
              height: `${size[1]}px`,
              backgroundColor: getSlideColor(dataIndex),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }"
          >
            <h1 :style="{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }">
              {{ getSlideContent(dataIndex).title }}
            </h1>
            <p :style="{ fontSize: '1.25rem', opacity: 0.7, color: '#000' }">
              {{ getSlideContent(dataIndex).description }}
            </p>
          </div>
        </div>
      </template>
    </Reel>

    <!-- Current position indicator -->
    <div
      :style="{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '0.9rem',
        zIndex: 10,
      }"
    >
      {{ (activeIndex + 1).toLocaleString() }} / {{ TOTAL_SLIDES.toLocaleString() }}
    </div>

    <!-- Go to index control -->
    <div
      :style="{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
      }"
    >
      <input
        type="number"
        :min="1"
        :max="TOTAL_SLIDES"
        v-model="goToValue"
        @keydown="handleGoToKeydown"
        placeholder="Slide #"
        :style="{
          padding: '12px 16px',
          fontSize: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          width: '100px',
          outline: 'none',
        }"
      />
      <button
        @click="handleGoTo"
        :style="{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }"
      >
        Go
      </button>
    </div>

    <!-- Navigation buttons -->
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

    <!-- Indicator -->
    <div
      :style="{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }"
    >
      <ReelIndicator
        :count="TOTAL_SLIDES"
        :activeIndex="activeIndex"
        direction="vertical"
        :visible="4"
        :radius="4"
        :gap="6"
        @click="handleIndicatorClick"
      />
    </div>
  </div>
</template>

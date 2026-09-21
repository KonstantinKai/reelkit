<script setup lang="ts">
import { computed } from 'vue';
import {
  ImageStorySlide,
  VideoStorySlide,
  type SlideSlotScope,
} from '@reelkit/vue-stories-player';
import type { CustomStory } from './storiesFeed';

/**
 * The demo's `slide` slot: a story with a title and an emoji over its media,
 * or over a gradient when it has none, the way a promo story looks.
 */
const props = defineProps<{ scope: SlideSlotScope<CustomStory> }>();

const story = computed(() => props.scope.story);
const hasImage = computed(
  () => story.value.mediaType === 'image' && story.value.src.length > 0,
);
const isVideo = computed(() => story.value.mediaType === 'video');
const hasMedia = computed(() => hasImage.value || isVideo.value);
const isPerfStory = computed(() => story.value.id.startsWith('perf-'));
</script>

<template>
  <div
    class="slide"
    :style="{
      width: `${scope.size[0]}px`,
      height: `${scope.size[1]}px`,
      background: hasMedia ? '#000' : (story.bgGradient ?? '#222'),
    }"
  >
    <div v-if="hasImage" class="media">
      <ImageStorySlide
        :src="story.src"
        :on-load="scope.onReady"
        :on-error="scope.onError"
      />
    </div>

    <div v-if="isVideo" class="media">
      <VideoStorySlide
        :src="story.src"
        :poster="story.poster"
        :group-index="scope.groupIndex"
        :story-index="scope.index"
        :active-group-index="scope.activeGroupIndex"
        :active-story-index="scope.activeStoryIndex"
        :on-duration-ready="scope.onDurationReady"
        :on-playing="scope.onReady"
        :on-waiting="scope.onWaiting"
        :on-ended="scope.onEnded"
        :on-error="scope.onError"
      />
    </div>

    <div v-if="isPerfStory" class="counter">{{ scope.index + 1 }} / 100</div>

    <div
      v-if="story.title || story.emoji"
      class="copy"
      :class="{ shaded: hasMedia }"
    >
      <div v-if="story.emoji" class="emoji">{{ story.emoji }}</div>
      <div v-if="story.title" class="title">{{ story.title }}</div>
      <div v-if="story.subtitle" class="subtitle">{{ story.subtitle }}</div>
      <div v-if="story.ctaText" role="button" class="cta">
        {{ story.ctaText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media {
  position: absolute;
  inset: 0;
}

.counter {
  position: absolute;
  bottom: 48px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
  color: #fff;
  font-size: 64px;
  font-weight: 800;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.copy {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 32px;
}

.copy.shaded {
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
}

.emoji {
  font-size: 56px;
  margin-bottom: 16px;
}

.title {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  line-height: 1.4;
}

.cta {
  margin-top: 24px;
  padding: 10px 28px;
  background: #fff;
  color: #000;
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
  display: inline-block;
}
</style>

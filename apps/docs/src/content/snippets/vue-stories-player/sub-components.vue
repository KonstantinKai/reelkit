<script setup lang="ts">
import {
  CanvasProgressBar,
  HeartAnimation,
  ImageStorySlide,
  StoriesRing,
  StoriesRingList,
  StoryHeader,
  VideoStorySlide,
} from '@reelkit/vue-stories-player';
</script>

<template>
  <!-- One ring, and the horizontal row of them. -->
  <StoriesRing
    :author="group.author"
    :total-stories="group.stories.length"
    :viewed-count="2"
    :size="72"
    @click="open(group)"
  />
  <StoriesRingList :groups="groups" :viewed="viewed" @select="open" />

  <!-- Inside a #header slot: the default header, with your own additions. -->
  <StoryHeader
    :author="group.author"
    :created-at="story.createdAt"
    :is-paused="isPaused"
    :is-video="story.mediaType === 'video'"
    :is-muted="isMuted"
    :on-toggle-pause="onTogglePause"
    :on-toggle-sound="onToggleSound"
    :on-close="onClose"
  />

  <!-- Inside a #progressBar slot: the canvas bar, driven by the signals. -->
  <CanvasProgressBar
    :total-stories="group.stories.length"
    :active-index="activeIndex"
    :progress="progress"
    :min-segment-width="12"
  />

  <!-- Inside a #slide slot; see the slide slot example above. -->
  <ImageStorySlide :src="story.src" :on-load="onReady" :on-error="onError" />
  <VideoStorySlide
    :src="story.src"
    :group-index="groupIndex"
    :story-index="index"
    :active-group-index="activeGroupIndex"
    :active-story-index="activeStoryIndex"
  />

  <!-- Standalone, outside the player. -->
  <HeartAnimation @complete="remove(heart.id)" />
</template>

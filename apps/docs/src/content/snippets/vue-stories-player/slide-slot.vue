<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <!-- Compose ImageStorySlide and VideoStorySlide to keep autoplay, poster
         capture and sound sync while drawing your own layout around them.
         Pass the callbacks through, or the timer never starts. -->
    <template #slide="scope">
      <div class="my-slide">
        <VideoStorySlide
          v-if="scope.story.mediaType === 'video'"
          :src="scope.story.src"
          :poster="scope.story.poster"
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
        <ImageStorySlide
          v-else
          :src="scope.story.src"
          :on-load="scope.onReady"
          :on-error="scope.onError"
        />

        <!-- A carousel card draws this same slot with isActive: false, and
             nothing in it can be clicked. Keep playback or analytics behind
             the flag. -->
        <span v-if="scope.isActive" class="my-badge">{{ scope.story.id }}</span>
      </div>
    </template>
  </StoriesOverlay>
</template>

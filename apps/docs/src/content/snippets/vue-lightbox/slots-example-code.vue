<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <!-- Custom info overlay -->
    <template #info="{ item }">
      <div class="my-caption">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom navigation -->
    <template #navigation="{ onPrev, onNext, activeIndex, count }">
      <div class="my-nav">
        <button :disabled="activeIndex === 0" @click="onPrev">Prev</button>
        <span>{{ activeIndex + 1 }} / {{ count }}</span>
        <button :disabled="activeIndex === count - 1" @click="onNext">Next</button>
      </div>
    </template>

    <!-- Custom controls -->
    <template #controls="{ onClose, isFullscreen, onToggleFullscreen }">
      <div class="my-controls">
        <button @click="onToggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
        </button>
        <button @click="onClose">Close</button>
      </div>
    </template>
  </LightboxOverlay>
</template>

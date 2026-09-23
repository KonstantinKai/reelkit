<template>
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :viewed="viewed"
    desktop-layout="carousel"
  >
    <!-- The player still positions, scales and slides the card; this fills
         it. `offset` is negative on the left, positive on the right, and 0
         for the card passing through the center during a slide. -->
    <template #groupPreview="{ group, story, viewedCount, offset, onOpen }">
      <button type="button" class="my-card" @click="onOpen">
        <img v-if="story?.poster" :src="story.poster" alt="" />
        <span>{{ group.author.name }}</span>
        <small>{{ viewedCount }} / {{ group.stories.length }} seen</small>
        <em v-if="offset === 0">opening…</em>
      </button>
    </template>
  </StoriesOverlay>
</template>

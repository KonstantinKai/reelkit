<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <!-- Replaces both desktop arrows at once. The first node sits left of
         the story, the rest to its right. -->
    <template #navigation="{ onPrevStory, onNextStory, onPrevGroup, onNextGroup }">
      <div class="my-nav">
        <button type="button" @click="onPrevGroup">Previous user</button>
        <button type="button" @click="onPrevStory">Back</button>
      </div>
      <div class="my-nav">
        <button type="button" @click="onNextGroup">Next user</button>
        <button type="button" @click="onNextStory">Forward</button>
      </div>
    </template>
  </StoriesOverlay>
</template>

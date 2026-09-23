<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <!-- Every slot is optional; one you leave out keeps the default, and so
         does one that renders nothing. -->
    <template #header="{ author, isPaused, onTogglePause, onClose }">
      <header class="my-header">
        <img :src="author.avatar" :alt="author.name" />
        <span>{{ author.name }}</span>
        <button type="button" @click="onTogglePause">
          {{ isPaused ? 'Play' : 'Pause' }}
        </button>
        <button type="button" @click="onClose">Close</button>
      </header>
    </template>

    <template #footer="{ author, story }">
      <form class="my-reply" @submit.prevent="reply(author, story)">
        <input v-model="draft" :placeholder="`Reply to ${author.name}…`" />
      </form>
    </template>
  </StoriesOverlay>
</template>

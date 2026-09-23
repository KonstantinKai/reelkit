<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <!-- Both are drawn over the active story only. Without the loading slot
         the default is the header spinner; without the error slot it is the
         built-in "Content unavailable" panel. -->
    <template #loading="{ story }">
      <p class="my-loading">Loading {{ story.mediaType }}…</p>
    </template>

    <template #error="{ story, groupIndex }">
      <div class="my-error">
        <p>That {{ story.mediaType }} would not load.</p>
        <button type="button" @click="report(groupIndex, story)">Report</button>
      </div>
    </template>
  </StoriesOverlay>
</template>

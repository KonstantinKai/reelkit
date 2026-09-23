<template>
  <!-- Every group carries its own progress bar and header, so both turn with
       the group instead of switching above the player once it has changed. -->
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    chrome-placement="group"
  />
</template>

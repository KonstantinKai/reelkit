<template>
  <!-- Neighbouring groups sit beside the active story as dimmed cards on a
       desktop screen. Phones keep the plain player whatever this says. -->
  <StoriesOverlay
    v-model:is-open="isOpen"
    :groups="groups"
    :viewed="viewed"
    desktop-layout="carousel"
  />
</template>

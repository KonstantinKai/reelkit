<template>
  <button @click="open = true">Open</button>
  <ReelPlayerOverlay v-model:is-open="open" :content="content" />
</template>

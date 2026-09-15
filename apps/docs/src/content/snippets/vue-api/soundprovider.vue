<template>
  <SoundProvider>
    <Reel :count="items.length">
      <template #item="{ index }">
        <VideoSlide :index="index" />
      </template>
      <MuteButton />
    </Reel>
  </SoundProvider>
</template>

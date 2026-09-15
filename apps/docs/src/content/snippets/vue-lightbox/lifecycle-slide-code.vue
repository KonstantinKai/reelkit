<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template
      #slide="{ item, size, isActive, onReady, onWaiting, onError }"
    >
      <template v-if="item.type === 'video'">
        <video
          :src="item.src"
          :poster="item.poster"
          :autoplay="isActive"
          :style="{ width: `${size[0]}px`, height: `${size[1]}px`, objectFit: 'contain' }"
          @canplay="onReady"
          @waiting="onWaiting"
          @error="onError"
        />
      </template>
      <template v-else>
        <img
          :src="item.src"
          :style="{ width: `${size[0]}px`, height: `${size[1]}px`, objectFit: 'contain' }"
          @load="onReady"
          @error="onError"
        />
      </template>
    </template>
  </LightboxOverlay>
</template>

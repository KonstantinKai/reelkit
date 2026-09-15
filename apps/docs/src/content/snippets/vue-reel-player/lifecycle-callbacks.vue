<!-- Inside #slide — wire callbacks to your custom media -->
<template #slide="{ item, size, isActive, onReady, onWaiting, onError }">
  <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
    <img
      v-if="item.media[0].type === 'image'"
      :src="item.media[0].src"
      @load="onReady"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
    <video
      v-else
      :src="item.media[0].src"
      :autoplay="isActive"
      @canplay="onReady"
      @waiting="onWaiting"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
  </div>
</template>

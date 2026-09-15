<template #item="{ index, indexInRange, size }">
  <!--
    index        : number          — absolute slide index (0 to count-1)
    indexInRange  : number          — position in visible window (0, 1, or 2)
    size          : [number, number] — [width, height] of the container
  -->
  <MySlide
    :data="items[index]"
    :style="{ width: size[0] + 'px', height: size[1] + 'px' }"
  />
</template>

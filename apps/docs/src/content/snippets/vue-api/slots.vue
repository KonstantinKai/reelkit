<Reel :count="items.length">
  <template #item="{ index, indexInRange, size }">
    <!-- index       : number         — absolute slide index (0 to count-1) -->
    <!-- indexInRange : number         — position in the visible window (0, 1, or 2) -->
    <!-- size         : [number,number] — [width, height] of the container -->
    <MySlide :index="index" :size="size" />
  </template>

  <!-- default slot: overlay content rendered on top of the slides -->
  <ReelIndicator />
</Reel>

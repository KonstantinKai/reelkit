<Reel
  :count="items.length"
  :size="[400, 300]"
  direction="horizontal"
>
  <template #item="{ index, size }">
    <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
      {{ items[index].title }}
    </div>
  </template>

  <ReelIndicator direction="horizontal" />
</Reel>

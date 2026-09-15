<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index }">
    <Slide :data="items[index]" />
  </template>
  <ReelIndicator />
</Reel>

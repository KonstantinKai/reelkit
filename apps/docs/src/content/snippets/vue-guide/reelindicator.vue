<!-- Auto-connect: count and active are inherited from parent Reel -->
<Reel :count="10" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
  <ReelIndicator direction="vertical" />
</Reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a Reel) -->
<ReelIndicator :count="10" :active="currentIndex" />

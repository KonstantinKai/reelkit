<!-- Explicit size (fixed) -->
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
</Reel>

<!-- Auto-size (responsive — sized by CSS) -->
<Reel :count="items.length" style="width: 100%; height: 100dvh">
  <template #item="{ index, size }"> ... </template>
</Reel>

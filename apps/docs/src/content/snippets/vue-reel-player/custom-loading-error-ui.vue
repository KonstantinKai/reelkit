<ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
  <template #loading="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             align-items:center;justify-content:center;color:#fff;font-size:14px"
    >
      Loading slide {{ activeIndex + 1 }}...
    </div>
  </template>

  <template #error="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             flex-direction:column;align-items:center;justify-content:center;
             gap:12px;color:rgba(255,255,255,0.5)"
    >
      <span style="font-size:48px">!</span>
      <span>Slide {{ activeIndex + 1 }} failed to load</span>
    </div>
  </template>
</ReelPlayerOverlay>

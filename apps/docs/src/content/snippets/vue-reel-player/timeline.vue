<ReelPlayerOverlay
  :is-open="isOpen"
  :content="items"
  timeline="auto"
  :timeline-min-duration-seconds="30"
  @close="isOpen = false"
/>

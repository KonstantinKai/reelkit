// A double tap plays the heart over the story and reports which story it
// landed on. The heart draws itself; this is only the reporting half.
<rk-stories-overlay
  [isOpen]="isOpen()"
  [groups]="groups"
  (doubleTapped)="like($event.groupIndex, $event.storyIndex)"
  (closed)="isOpen.set(false)"
/>

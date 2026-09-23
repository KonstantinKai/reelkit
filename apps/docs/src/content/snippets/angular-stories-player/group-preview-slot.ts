// One side card of the desktop carousel. `offset` is negative on the left
// and positive on the right, and 0 while the card slides through the centre.
<ng-template
  rkStoriesGroupPreview
  let-group
  let-story="story"
  let-offset="offset"
  let-viewedCount="viewedCount"
  let-onOpen="onOpen"
>
  <button type="button" class="my-card" (click)="onOpen()">
    <img [src]="group.author.avatar" [alt]="group.author.name" />
    <span>{{ group.author.name }}</span>
    <span>{{ viewedCount }} / {{ group.stories.length }} seen</span>
  </button>
</ng-template>

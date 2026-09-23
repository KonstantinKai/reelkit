// activeIndex and progress are core signals, the same ones the built-in
// canvas bar reads. Bridge them with toAngularSignal to follow the timer.
<ng-template
  rkStoriesProgressBar
  let-group
  let-total="totalStories"
  let-activeIndex="activeIndex"
  let-progress="progress"
>
  <app-my-progress-bar
    [totalStories]="total"
    [activeIndex]="activeIndex"
    [progress]="progress"
  />
</ng-template>

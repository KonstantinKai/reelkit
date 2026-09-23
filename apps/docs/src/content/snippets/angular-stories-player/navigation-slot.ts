// The four moves arrive as the implicit value, so `let-nav` is all a
// template needs. Supplying this replaces both built-in arrows.
<ng-template rkStoriesNavigation let-nav>
  <button type="button" (click)="nav.onPrevGroup()">Previous user</button>
  <button type="button" (click)="nav.onPrevStory()">Back</button>
  <button type="button" (click)="nav.onNextStory()">Next</button>
  <button type="button" (click)="nav.onNextGroup()">Next user</button>
</ng-template>

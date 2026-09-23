// Both are scoped to the story on screen: the player reports one loading
// state, and these draw only over the slide the viewer is looking at.
<ng-template rkStoriesLoading let-story>
  <div class="my-spinner">Loading {{ story.mediaType }}…</div>
</ng-template>

<ng-template rkStoriesError let-story>
  <div class="my-error">That story could not be loaded.</div>
</ng-template>

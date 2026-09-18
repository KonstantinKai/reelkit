import { createStoriesViewedStateController } from '@reelkit/stories-core';

// Once, where the feed lives. The getter is read every time, so it has to
// return the groups as they are now.
const viewed = createStoriesViewedStateController({
  storageKey: 'stories-seen',
  groups: () => groups,
});

// The player components do this themselves when given `viewed`.
const detach = viewed.attach();

viewed.viewedState.value; // Map { 'user_42' => 2 }, and a signal to follow
viewed.resumeStoryIndex(0); // 2 — the first story not yet seen
viewed.markViewed(0, 2); // furthest point wins; a rewatch never rewinds
viewed.forget(); // clears it all

detach();

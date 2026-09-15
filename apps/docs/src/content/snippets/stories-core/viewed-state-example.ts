import { createStoriesViewedState } from '@reelkit/stories-core';
import {
  createViewedStateController,
  urlStableIdTwoAxisKey,
  twoAxisViewedTracking,
} from '@reelkit/core';

const seen = createViewedStateController({
  storageKey: 'stories-seen',
  ...urlStableIdTwoAxisKey({ outerItems, innerItems }),
  ...twoAxisViewedTracking,
});
seen.attach();

const viewed = createStoriesViewedState(seen, () => groups);

viewed.viewedCounts(); // Map { 'user_42' => 2 }
viewed.resumeStoryIndex(0); // 2 — the first story not yet seen
viewed.markViewed(0, 2); // furthest point wins; a rewatch never rewinds

import {
  createUrlStateController,
  createViewedStateController,
  urlStableIdTwoAxisKey,
  twoAxisViewedTracking,
} from '@reelkit/core';

const key = urlStableIdTwoAxisKey({ outerItems, innerItems });

const url = createUrlStateController({ param: 'story', ...key });
const seen = createViewedStateController({
  storageKey: 'stories-seen',
  ...key,
  ...twoAxisViewedTracking,
});

seen.attach();                       // reads storage, follows other tabs
seen.record({ outer: 2, inner: 1 }); // furthest point wins, a rewatch never rewinds
seen.resolve('user_42');             // → { outer: 2, inner: 1 } | null

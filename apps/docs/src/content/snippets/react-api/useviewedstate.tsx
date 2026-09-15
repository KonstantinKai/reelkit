import {
  useViewedState,
  urlStableIdTwoAxisKey,
  twoAxisViewedTracking,
  Observe,
} from '@reelkit/react';
import {
  StoriesRingList,
  createStoriesViewedState,
} from '@reelkit/react-stories-player';

const key = urlStableIdTwoAxisKey({ outerItems, innerItems });
const seen = useViewedState({
  storageKey: 'stories-seen',
  ...key,
  ...twoAxisViewedTracking,
});
const viewed = createStoriesViewedState(seen, () => groups);

<Observe signals={[seen.entries]}>
  {() => (
    <StoriesRingList
      groups={groups}
      viewedState={viewed.viewedCounts()}
      onSelect={open}
    />
  )}
</Observe>;

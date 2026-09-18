import { StoriesRingList } from '@reelkit/react-stories-player';

// `viewed` is the same createStoriesViewedStateController the player takes; the
// rings follow it by themselves.
<StoriesRingList
  groups={groups}
  viewed={viewed}
  onSelect={(groupIndex) => openStories(groupIndex)}
/>;

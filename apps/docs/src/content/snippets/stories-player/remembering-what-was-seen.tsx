import { useMemo, useState } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  useViewedState,
  createStoriesViewedState,
  urlStableIdTwoAxisKey,
  twoAxisViewedTracking,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import { Observe } from '@reelkit/react';

function Feed({ groups }: { groups: StoriesGroup[] }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(0);

  const seen = useViewedState({
    storageKey: 'stories-seen',
    ...urlStableIdTwoAxisKey({
      outerItems: () => groups.map((g) => ({ id: g.author.id })),
      innerItems: (outer) =>
        groups.find((g) => g.author.id === outer.id)?.stories ?? [],
    }),
    ...twoAxisViewedTracking,
  });
  const viewed = useMemo(
    () => createStoriesViewedState(seen, () => groups),
    [seen, groups],
  );

  return (
    <>
      {/* entries is a signal, so the rings repaint as stories are seen */}
      <Observe signals={[seen.entries]}>
        {() => (
          <StoriesRingList
            groups={groups}
            viewedState={viewed.viewedCounts()}
            onSelect={(index) => {
              setGroup(index);
              setOpen(true);
            }}
          />
        )}
      </Observe>

      <StoriesOverlay
        isOpen={open}
        onClose={() => setOpen(false)}
        groups={groups}
        initialGroupIndex={group}
        resumeStoryIndex={viewed.resumeStoryIndex}
        onStoryViewed={viewed.markViewed}
      />
    </>
  );
}

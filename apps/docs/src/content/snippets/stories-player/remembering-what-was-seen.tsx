import { useRef, useState } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/react-stories-player';

function Feed({ groups }: { groups: StoriesGroup[] }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(0);

  // The controller reads the groups through a getter every time it needs
  // them, so keep the getter current: a ref for a plain prop, or a signal.
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  const [viewed] = useState(() =>
    createStoriesViewedStateController({
      storageKey: 'stories-seen',
      groups: () => groupsRef.current,
    }),
  );

  return (
    <>
      {/* The rings follow the controller by themselves. */}
      <StoriesRingList
        groups={groups}
        viewed={viewed}
        onSelect={(index) => {
          setGroup(index);
          setOpen(true);
        }}
      />

      {/* The player resumes, records and draws its card rings from it. */}
      <StoriesOverlay
        isOpen={open}
        onClose={() => setOpen(false)}
        groups={groups}
        initialGroupIndex={group}
        viewed={viewed}
      />
    </>
  );
}

import { useState, useMemo } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';
import { cdnUrl } from '@reelkit/example-data';
import { useTheme } from '../../context/ThemeContext';

const groups: StoriesGroup[] = [
  {
    author: {
      id: 'user-1',
      name: 'Alice',
      avatar: cdnUrl('samples/avatars/avatar-06.jpg'),
      verified: true,
    },
    stories: [
      {
        id: 's1-1',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-001.jpg'),
      },
      {
        id: 's1-2',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-002.jpg'),
      },
      {
        id: 's1-3',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-003.jpg'),
      },
    ],
  },
  {
    author: {
      id: 'user-2',
      name: 'Bob',
      avatar: cdnUrl('samples/avatars/avatar-07.jpg'),
    },
    stories: [
      {
        id: 's2-1',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-004.jpg'),
      },
      {
        id: 's2-2',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-005.jpg'),
      },
    ],
  },
  {
    author: {
      id: 'user-3',
      name: 'Charlie',
      avatar: cdnUrl('samples/avatars/avatar-08.jpg'),
      verified: true,
    },
    stories: [
      {
        id: 's3-1',
        mediaType: 'image',
        src: cdnUrl('samples/images/stories/story-006.jpg'),
      },
    ],
  },
];

export function StoriesPlayerDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const viewedState = useMemo(() => new Map<string, number>(), []);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const openStories = (groupIndex: number) => {
    setSelectedGroup(groupIndex);
    setIsOpen(true);
  };

  return (
    <div
      className="w-full h-full overflow-auto p-4"
      style={{ background: isDark ? '#0f172a' : '#f8fafc' }}
    >
      <StoriesRingList
        groups={groups}
        viewedState={viewedState}
        onSelect={openStories}
      />

      <StoriesOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={selectedGroup}
        onStoryViewed={(gi, si) => {
          const author = groups[gi].author;
          const current = viewedState.get(author.id) ?? 0;
          viewedState.set(author.id, Math.max(current, si + 1));
        }}
      />
    </div>
  );
}

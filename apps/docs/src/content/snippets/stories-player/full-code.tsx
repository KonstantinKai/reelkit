import { useState } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';

const groups: StoriesGroup[] = [
  {
    author: {
      id: 'user-1',
      name: 'Alice',
      avatar: '/cdn/samples/avatars/avatar-06.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's1-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-001.jpg',
      },
      {
        id: 's1-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-002.jpg',
      },
      {
        id: 's1-3',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-003.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-2',
      name: 'Bob',
      avatar: '/cdn/samples/avatars/avatar-07.jpg',
    },
    stories: [
      {
        id: 's2-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-004.jpg',
      },
      {
        id: 's2-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-005.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-3',
      name: 'Charlie',
      avatar: '/cdn/samples/avatars/avatar-08.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's3-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-006.jpg',
      },
    ],
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);
  // What was seen: rings, resume and recording from one controller, kept in
  // localStorage across reloads.
  const [viewed] = useState(() =>
    createStoriesViewedStateController({
      storageKey: 'stories-seen',
      groups: () => groups,
    }),
  );

  const openStories = (groupIndex: number) => {
    setSelectedGroup(groupIndex);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <StoriesRingList groups={groups} viewed={viewed} onSelect={openStories} />

      <StoriesOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={selectedGroup}
        viewed={viewed}
      />
    </div>
  );
}

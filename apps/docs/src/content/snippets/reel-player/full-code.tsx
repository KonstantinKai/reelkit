import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: '/cdn/samples/videos/video-01.mp4',
      poster: '/cdn/samples/videos/video-poster-01.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: '/cdn/samples/images/image-01.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: '/cdn/samples/avatars/avatar-02.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [{
      id: 'v2',
      type: 'video',
      src: '/cdn/samples/videos/video-04.mp4',
      poster: '/cdn/samples/videos/video-poster-04.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'James Wilson', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'City life adventures',
  },
  {
    id: '4',
    media: [
      { id: 'img2', type: 'image', src: '/cdn/samples/images/image-02.jpg', aspectRatio: 2 / 3 },
      { id: 'img3', type: 'image', src: '/cdn/samples/images/image-03.jpg', aspectRatio: 3 / 4 },
    ],
    author: { name: 'Emma Davis', avatar: '/cdn/samples/avatars/avatar-04.jpg' },
    likes: 8901,
    description: 'Travel moments',
  },
  {
    id: '5',
    media: [{
      id: 'img4',
      type: 'image',
      src: '/cdn/samples/images/image-04.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Michael Brown', avatar: '/cdn/samples/avatars/avatar-05.jpg' },
    likes: 2345,
    description: 'Golden hour magic',
  },
  {
    id: '6',
    media: [{
      id: 'v3',
      type: 'video',
      src: '/cdn/samples/videos/video-05.mp4',
      poster: '/cdn/samples/videos/video-poster-05.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 7890,
    description: 'Living the moment',
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {content.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { setInitialIndex(i); setIsOpen(true); }}
            style={{
              position: 'relative', aspectRatio: '9 / 16', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#1e293b',
            }}
          >
            <img
              src={item.media[0].poster || item.media[0].src}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </div>
  );
}

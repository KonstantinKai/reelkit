import { useState, useMemo } from 'react';
import {
  ReelPlayerOverlay,
  type ContentItem,
} from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
import { Play } from 'lucide-react';
import { cdnUrl } from '@reelkit/example-data';

const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: '1',
    media: [
      {
        id: 'v1',
        type: 'video',
        src: cdnUrl('samples/videos/video-01.mp4'),
        poster: cdnUrl('samples/videos/video-poster-01.jpg'),
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'Alex Johnson',
      avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
    },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [
      {
        id: 'img1',
        type: 'image',
        src: cdnUrl('samples/images/image-01.jpg'),
        aspectRatio: 2 / 3,
      },
    ],
    author: {
      name: 'Sarah Miller',
      avatar: cdnUrl('samples/avatars/avatar-02.jpg'),
    },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [
      {
        id: 'v2',
        type: 'video',
        src: cdnUrl('samples/videos/video-02.mp4'),
        poster: cdnUrl('samples/videos/video-poster-02.jpg'),
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'James Wilson',
      avatar: cdnUrl('samples/avatars/avatar-03.jpg'),
    },
    likes: 3456,
    description: 'City life adventures',
  },
  {
    id: '4',
    media: [
      {
        id: 'img2',
        type: 'image',
        src: cdnUrl('samples/images/image-02.jpg'),
        aspectRatio: 2 / 3,
      },
      {
        id: 'img3',
        type: 'image',
        src: cdnUrl('samples/images/image-03.jpg'),
        aspectRatio: 3 / 4,
      },
    ],
    author: {
      name: 'Emma Davis',
      avatar: cdnUrl('samples/avatars/avatar-04.jpg'),
    },
    likes: 8901,
    description: 'Travel moments',
  },
  {
    id: '5',
    media: [
      {
        id: 'img4',
        type: 'image',
        src: cdnUrl('samples/images/image-04.jpg'),
        aspectRatio: 2 / 3,
      },
    ],
    author: {
      name: 'Michael Brown',
      avatar: cdnUrl('samples/avatars/avatar-05.jpg'),
    },
    likes: 2345,
    description: 'Golden hour magic',
  },
  {
    id: '6',
    media: [
      {
        id: 'v3',
        type: 'video',
        src: cdnUrl('samples/videos/video-03.mp4'),
        poster: cdnUrl('samples/videos/video-poster-03.jpg'),
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'Alex Johnson',
      avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
    },
    likes: 7890,
    description: 'Living the moment',
  },
];

function getThumbnail(item: ContentItem): string {
  const first = item.media[0];
  return first.type === 'video' ? first.poster || first.src : first.src;
}

export function ReelPlayerDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const content = useMemo(() => SAMPLE_CONTENT, []);

  const handleOpen = (index: number) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="w-full h-full overflow-auto p-4 bg-slate-50 dark:bg-slate-900">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}
      >
        {content.map((item, i) => (
          <button
            key={item.id}
            onClick={() => handleOpen(i)}
            className="bg-slate-200 dark:bg-slate-800"
            style={{
              position: 'relative',
              aspectRatio: '9 / 16',
              borderRadius: 8,
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src={getThumbnail(item)}
              alt={item.description}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
            />
            {item.media[0].type === 'video' && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play size={12} color="white" fill="white" />
              </div>
            )}
            {item.media.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 11,
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {item.media.length}
              </div>
            )}
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

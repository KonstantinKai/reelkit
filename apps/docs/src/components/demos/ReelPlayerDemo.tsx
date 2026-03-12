import { useState, useMemo } from 'react';
import {
  ReelPlayerOverlay,
  type ContentItem,
} from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
import { Play } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: '1',
    media: [
      {
        id: 'v1',
        type: 'video',
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        poster:
          'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'Alex Johnson',
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
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
        src: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
        aspectRatio: 2 / 3,
      },
    ],
    author: {
      name: 'Sarah Miller',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
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
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        poster:
          'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'James Wilson',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
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
        src: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
        aspectRatio: 2 / 3,
      },
      {
        id: 'img3',
        type: 'image',
        src: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
        aspectRatio: 3 / 4,
      },
    ],
    author: {
      name: 'Emma Davis',
      avatar:
        'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
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
        src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
        aspectRatio: 2 / 3,
      },
    ],
    author: {
      name: 'Michael Brown',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
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
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        poster:
          'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        aspectRatio: 16 / 9,
      },
    ],
    author: {
      name: 'Alex Johnson',
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
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
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const content = useMemo(() => SAMPLE_CONTENT, []);

  const handleOpen = (index: number) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  return (
    <div
      className="w-full h-full overflow-auto p-4"
      style={{ background: isDark ? '#0f172a' : '#f8fafc' }}
    >
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
            style={{
              position: 'relative',
              aspectRatio: '9 / 16',
              borderRadius: 8,
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: isDark ? '#1e293b' : '#e2e8f0',
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

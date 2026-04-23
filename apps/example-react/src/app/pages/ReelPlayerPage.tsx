import React, { useState, useMemo } from 'react';
import { ImageOff, Play } from 'lucide-react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
import {
  generateContent,
  getThumbnail,
} from '../components/reel-player/mockContent';
import { cdnUrl } from '@reelkit/example-data';

const CONTENT_COUNT = 50;

const Thumbnail: React.FC<{ src: string }> = ({ src }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          gap: 4,
        }}
      >
        <ImageOff size={32} strokeWidth={1.5} />
        <span style={{ fontSize: 10 }}>Error</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};

function ReelPlayerPage() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const content = useMemo(() => {
    const items = generateContent(CONTENT_COUNT);
    // Insert a long video at index 1 so the built-in timeline bar is easy to find
    items.splice(1, 0, {
      id: 'long-video-content',
      media: [
        {
          id: 'long-video',
          type: 'video',
          src: cdnUrl('samples/videos/video-06.mp4'),
          poster: cdnUrl('samples/videos/video-poster-06.jpg'),
          aspectRatio: 16 / 9,
        },
      ],
      author: {
        name: 'Timeline Demo',
        avatar: cdnUrl('samples/avatars/avatar-02.jpg'),
      },
      likes: 4200,
      description:
        'Long video: the playback timeline bar should render automatically.',
    });
    // Insert a broken image slide at index 3 to demonstrate error handling
    items.splice(3, 0, {
      id: 'broken-content',
      media: [
        {
          id: 'broken-img',
          type: 'image',
          src: 'https://broken.invalid/does-not-exist.jpg',
          aspectRatio: 9 / 16,
        },
      ],
      author: {
        name: 'Error Demo',
        avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
      },
      likes: 0,
      description:
        'This slide has a broken image to demonstrate error handling.',
    });
    return items;
  }, []);

  const openPlayer = (index: number) => {
    setSelectedIndex(index);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#111',
        padding: '56px 16px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          Reel Player Demo
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 32,
          }}
        >
          Click on any thumbnail to open the player. Swipe up/down or use arrow
          keys to navigate. Supports images, videos, and multi-media posts with
          horizontal sliders.
        </p>

        {/* Thumbnail grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 8,
          }}
        >
          {content.map((item, index) => {
            const hasVideo = item.media.some((m) => m.type === 'video');
            const isMulti = item.media.length > 1;

            return (
              <div
                key={item.id}
                onClick={() => openPlayer(index)}
                style={{
                  position: 'relative',
                  aspectRatio: '9 / 16',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#222',
                }}
              >
                <Thumbnail src={getThumbnail(item)} />

                {/* Video indicator */}
                {hasVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={14} fill="#fff" color="#fff" />
                  </div>
                )}

                {/* Multi-media indicator */}
                {isMulti && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      padding: '4px 8px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  >
                    {item.media.length}
                  </div>
                )}

                {/* Hover overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)';
                  }}
                />

                {/* Author info */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '32px 8px 8px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <img
                      src={item.author.avatar}
                      alt=""
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <span
                      style={{
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.author.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReelPlayerOverlay
        isOpen={isPlayerOpen}
        onClose={closePlayer}
        content={content}
        initialIndex={selectedIndex}
        timelineMinDurationSeconds={10}
      />
    </div>
  );
}

export default ReelPlayerPage;

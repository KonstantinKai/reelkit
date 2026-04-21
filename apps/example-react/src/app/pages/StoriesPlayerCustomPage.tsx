import { useState, useMemo } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  CanvasProgressBar,
  type StoriesGroup,
  type StoryItem,
} from '@reelkit/react-stories-player';
import { Observe, generate, type Signal } from '@reelkit/react';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-stories-player/styles.css';

const AVATARS = [
  cdnUrl('samples/avatars/avatar-13.jpg'),
  cdnUrl('samples/avatars/avatar-14.jpg'),
  cdnUrl('samples/avatars/avatar-15.jpg'),
];

type DemoType =
  | 'custom-header'
  | 'custom-footer'
  | 'custom-navigation'
  | 'custom-progress'
  | 'custom-loading-error'
  | 'theming'
  | null;

interface Demo {
  id: NonNullable<DemoType>;
  title: string;
  description: string;
}

const DEMOS: Demo[] = [
  {
    id: 'custom-header',
    title: 'Custom Header',
    description:
      'Uses renderHeader to replace the default header with a minimal close button and custom author layout.',
  },
  {
    id: 'custom-footer',
    title: 'Custom Footer',
    description:
      'Uses renderFooter to add a reply input and action buttons below each story.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses renderNavigation to replace default chevron buttons with labeled pill buttons.',
  },
  {
    id: 'custom-progress',
    title: 'Custom Progress Bar',
    description:
      'Uses renderProgressBar to replace the default canvas bar with a simple HTML progress element.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses renderLoading and renderError to replace default spinner and error icon. Includes a broken image story.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the stories overlay by overriding --rk-stories-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

function generateGroups(): StoriesGroup[] {
  return [
    {
      author: {
        id: 'u1',
        name: 'Travel',
        avatar: AVATARS[0],
        verified: true,
      },
      stories: [
        {
          id: 'c1',
          mediaType: 'image',
          src: cdnUrl('samples/images/image-01.jpg'),
          createdAt: new Date(Date.now() - 3600_000).toISOString(),
        },
        {
          id: 'c2',
          mediaType: 'image',
          src: cdnUrl('samples/images/image-02.jpg'),
          createdAt: new Date(Date.now() - 7200_000).toISOString(),
        },
        {
          id: 'c3',
          mediaType: 'video',
          src: cdnUrl('samples/videos/video-01.mp4'),
          poster: cdnUrl('samples/videos/video-poster-01.jpg'),
          createdAt: new Date(Date.now() - 10800_000).toISOString(),
        },
      ],
    },
    {
      author: { id: 'u2', name: 'Food', avatar: AVATARS[1] },
      stories: [
        {
          id: 'c4',
          mediaType: 'image',
          src: cdnUrl('samples/images/image-03.jpg'),
          createdAt: new Date(Date.now() - 3600_000).toISOString(),
        },
        {
          id: 'c5',
          mediaType: 'image',
          src: 'https://broken.invalid/does-not-exist.jpg',
          createdAt: new Date(Date.now() - 7200_000).toISOString(),
        },
        {
          id: 'c6',
          mediaType: 'image',
          src: cdnUrl('samples/images/image-04.jpg'),
          createdAt: new Date(Date.now() - 10800_000).toISOString(),
        },
      ],
    },
    {
      author: { id: 'u3', name: 'Music', avatar: AVATARS[2], verified: true },
      stories: [
        {
          id: 'c7',
          mediaType: 'video',
          src: cdnUrl('samples/videos/video-02.mp4'),
          poster: cdnUrl('samples/videos/video-poster-02.jpg'),
          createdAt: new Date(Date.now() - 3600_000).toISOString(),
        },
        {
          id: 'c8',
          mediaType: 'image',
          src: cdnUrl('samples/images/image-05.jpg'),
          createdAt: new Date(Date.now() - 7200_000).toISOString(),
        },
      ],
    },
  ];
}

function HtmlProgressBar({
  totalStories,
  activeIndex,
  progress,
}: {
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: '8px 8px 0',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <Observe signals={[activeIndex, progress]}>
        {() => (
          <>
            {generate(totalStories, (i) => {
              const ai = activeIndex.value;
              const p = progress.value;
              const fill = i < ai ? 100 : i === ai ? p * 100 : 0;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.25)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${fill}%`,
                      height: '100%',
                      background:
                        i < ai
                          ? '#6366f1'
                          : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                      borderRadius: 2,
                      transition: i === ai ? 'none' : 'width 200ms',
                    }}
                  />
                </div>
              );
            })}
          </>
        )}
      </Observe>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  border: 'none',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'background 150ms',
};

function StoriesPlayerCustomPage() {
  const groups = useMemo(() => generateGroups(), []);
  const [activeDemo, setActiveDemo] = useState<DemoType>(null);
  const [viewedState] = useState(() => new Map<string, number>());

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#111',
        padding: '56px 16px 16px',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Custom Stories Player
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 32,
          }}
        >
          Demonstrates render prop customization: headers, footers, navigation,
          progress bars, and loading/error states.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {DEMOS.map((demo) => (
            <div
              key={demo.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h2
                style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500 }}
              >
                {demo.title}
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {demo.description}
              </p>
              <button
                onClick={() => setActiveDemo(demo.id)}
                style={{
                  ...btnStyle,
                  backgroundColor: '#fff',
                  color: '#000',
                  fontWeight: 500,
                }}
              >
                Open Demo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Header */}
      <StoriesOverlay
        isOpen={activeDemo === 'custom-header'}
        onClose={() => setActiveDemo(null)}
        groups={groups}
        onStoryViewed={(gi, si) => {
          const author = groups[gi].author;
          const current = viewedState.get(author.id) ?? 0;
          viewedState.set(author.id, Math.max(current, si + 1));
        }}
        renderHeader={({
          author,
          onClose,
          isPaused,
          onTogglePause,
          isMuted,
          onToggleSound,
          isVideo,
        }) => (
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 12,
              right: 12,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={author.avatar}
                alt={author.name}
                style={{ width: 28, height: 28, borderRadius: '50%' }}
              />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {author.name}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isVideo && (
                <button
                  onClick={onToggleSound}
                  style={{
                    ...btnStyle,
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.7rem',
                  }}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              )}
              <button
                onClick={onTogglePause}
                style={{
                  ...btnStyle,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.7rem',
                }}
              >
                {isPaused ? 'Play' : 'Pause'}
              </button>
              <button
                onClick={onClose}
                style={{
                  ...btnStyle,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.7rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      />

      {/* Custom Footer */}
      <StoriesOverlay
        isOpen={activeDemo === 'custom-footer'}
        onClose={() => setActiveDemo(null)}
        groups={groups}
        renderFooter={({ author, story }) => (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 12px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            <input
              type="text"
              placeholder={`Reply to ${author.name}...`}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              style={{
                ...btnStyle,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              Send
            </button>
          </div>
        )}
      />

      {/* Custom Navigation */}
      <StoriesOverlay
        isOpen={activeDemo === 'custom-navigation'}
        onClose={() => setActiveDemo(null)}
        groups={groups}
        renderNavigation={({
          onPrevStory,
          onNextStory,
          onPrevGroup,
          onNextGroup,
        }) => (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={onPrevGroup}
                style={{
                  ...btnStyle,
                  background: 'rgba(99,102,241,0.3)',
                  color: '#a78bfa',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Prev Group
              </button>
              <button
                onClick={onPrevStory}
                style={{
                  ...btnStyle,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Prev
              </button>
            </div>
            <div style={{ width: 16 }} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={onNextGroup}
                style={{
                  ...btnStyle,
                  background: 'rgba(99,102,241,0.3)',
                  color: '#a78bfa',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Next Group
              </button>
              <button
                onClick={onNextStory}
                style={{
                  ...btnStyle,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      />

      {/* Custom Progress Bar */}
      <StoriesOverlay
        isOpen={activeDemo === 'custom-progress'}
        onClose={() => setActiveDemo(null)}
        groups={groups}
        renderProgressBar={({ totalStories, activeIndex, progress }) => (
          <HtmlProgressBar
            totalStories={totalStories}
            activeIndex={activeIndex}
            progress={progress}
          />
        )}
      />

      {/* Custom Loading / Error */}
      <StoriesOverlay
        isOpen={activeDemo === 'custom-loading-error'}
        onClose={() => setActiveDemo(null)}
        groups={groups}
        renderLoading={({ story }) => (
          <div
            style={{
              position: 'absolute',
              top: 22,
              right: 72,
              zIndex: 20,
              color: '#fff',
              fontSize: 12,
              background: 'rgba(99,102,241,0.8)',
              padding: '4px 12px',
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          >
            Loading {story.mediaType}...
          </div>
        )}
        renderError={({ story }) => (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: 'linear-gradient(145deg, #2d1b1b 0%, #1a1a2e 100%)',
              color: '#ff6b6b',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 48 }}>!</div>
            <div style={{ fontSize: 14 }}>Failed to load {story.mediaType}</div>
          </div>
        )}
      />

      {/* Themed via CSS Tokens */}
      {activeDemo === 'theming' && (
        <>
          <style>{`
            .rk-stories-overlay {
              --rk-stories-overlay-bg: #0f172a;
              --rk-stories-container-radius: 24px;
              --rk-stories-nav-bg: rgba(99, 102, 241, 0.35);
              --rk-stories-nav-bg-hover: rgba(168, 85, 247, 0.65);
              --rk-stories-top-shade-bg: linear-gradient(
                to bottom,
                rgba(99, 102, 241, 0.5) 0%,
                transparent 100%
              );
              --rk-stories-header-name-fg: #fef3c7;
              --rk-stories-ring-spin-duration: 2s;
            }
          `}</style>
          <StoriesOverlay
            isOpen
            onClose={() => setActiveDemo(null)}
            groups={groups}
          />
        </>
      )}
    </div>
  );
}

export default StoriesPlayerCustomPage;

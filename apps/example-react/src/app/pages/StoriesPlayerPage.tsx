import { useState, useMemo } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  ImageStorySlide,
  VideoStorySlide,
  type StoriesGroup,
  type StoryItem,
  type SlideRenderProps,
} from '@reelkit/react-stories-player';
import {
  cubeTransition,
  flipTransition,
  fadeTransition,
  zoomTransition,
  slideTransition,
  type TransitionTransformFn,
} from '@reelkit/react';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-stories-player/styles.css';

const AVATARS = [
  cdnUrl('samples/avatars/avatar-06.jpg'),
  cdnUrl('samples/avatars/avatar-07.jpg'),
  cdnUrl('samples/avatars/avatar-08.jpg'),
  cdnUrl('samples/avatars/avatar-09.jpg'),
  cdnUrl('samples/avatars/avatar-10.jpg'),
  cdnUrl('samples/avatars/avatar-11.jpg'),
];

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
const _kTransitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'cube', fn: cubeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'fade', fn: fadeTransition },
  { label: 'zoom', fn: zoomTransition },
  { label: 'slide', fn: slideTransition },
];

interface CustomStory extends StoryItem {
  title?: string;
  subtitle?: string;
  bgGradient?: string;
  emoji?: string;
  ctaText?: string;
}

const PROMO_STORIES: CustomStory[] = [
  {
    id: 'promo-0',
    mediaType: 'image',
    src: cdnUrl('samples/images/image-01.jpg'),
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    title: 'New Collection',
    subtitle: 'Spring 2026 is here',
    emoji: '🌸',
  },
  {
    id: 'promo-1',
    mediaType: 'image',
    src: '',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    title: 'Flash Sale',
    subtitle: 'Up to 50% off everything',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    emoji: '🔥',
    ctaText: 'Shop Now',
  },
  {
    id: 'promo-2',
    mediaType: 'video',
    src: cdnUrl('samples/videos/video-01.mp4'),
    poster: cdnUrl('samples/videos/video-poster-01.jpg'),
    createdAt: new Date(Date.now() - 10800_000).toISOString(),
    title: 'Behind the Scenes',
    emoji: '🎬',
  },
  {
    id: 'promo-3',
    mediaType: 'image',
    src: '',
    createdAt: new Date(Date.now() - 14400_000).toISOString(),
    title: 'Did you know?',
    subtitle: 'ReelKit supports cube, flip, fade, and slide transitions',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '✨',
  },
  {
    id: 'promo-4',
    mediaType: 'image',
    src: cdnUrl('samples/images/image-03.jpg'),
    createdAt: new Date(Date.now() - 18000_000).toISOString(),
    title: 'Explore Nature',
    subtitle: 'Best hiking trails of the season',
    emoji: '🏔️',
  },
  {
    id: 'promo-5',
    mediaType: 'image',
    src: '',
    createdAt: new Date(Date.now() - 21600_000).toISOString(),
    title: 'Thank You',
    subtitle: '10K followers! You are amazing',
    bgGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    emoji: '🎉',
  },
];

function CustomSlide({
  story: item,
  index,
  groupIndex,
  size,
  activeGroupIndex,
  activeStoryIndex,
  onDurationReady,
  onReady,
  onWaiting,
  onError,
  onEnded,
}: SlideRenderProps<CustomStory>) {
  const [w, h] = size;
  const hasImage =
    item.src && item.src.length > 0 && item.mediaType === 'image';
  const isVideo = item.mediaType === 'video';
  const hasMedia = hasImage || isVideo;
  const isPerfStory = item.id.startsWith('perf-');

  return (
    <div
      style={{
        width: w,
        height: h,
        background: hasMedia ? '#000' : (item.bgGradient ?? '#222'),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {hasImage && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImageStorySlide src={item.src} onLoad={onReady} onError={onError} />
        </div>
      )}

      {isVideo && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <VideoStorySlide
            src={item.src}
            poster={item.poster}
            groupIndex={groupIndex}
            storyIndex={index}
            activeGroupIndex={activeGroupIndex}
            activeStoryIndex={activeStoryIndex}
            onDurationReady={onDurationReady}
            onPlaying={onReady}
            onWaiting={onWaiting}
            onEnded={onEnded}
            onError={onError}
          />
        </div>
      )}

      {isPerfStory && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 1,
            color: '#fff',
            fontSize: 64,
            fontWeight: 800,
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
        >
          {index + 1} / 100
        </div>
      )}

      {(item.title || item.emoji) && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '0 32px',
            textShadow: hasMedia ? '0 2px 12px rgba(0,0,0,0.7)' : 'none',
          }}
        >
          {item.emoji && (
            <div style={{ fontSize: 56, marginBottom: 16 }}>{item.emoji}</div>
          )}
          {item.title && (
            <div
              style={{
                color: '#fff',
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              {item.title}
            </div>
          )}
          {item.subtitle && (
            <div
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                lineHeight: 1.4,
              }}
            >
              {item.subtitle}
            </div>
          )}
          {item.ctaText && (
            <div
              role="button"
              onClick={() => alert('CTA button pressed')}
              style={{
                marginTop: 24,
                padding: '10px 28px',
                background: '#fff',
                color: '#000',
                borderRadius: 24,
                fontWeight: 600,
                fontSize: 14,
                display: 'inline-block',
              }}
            >
              {item.ctaText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function generateGroups(): StoriesGroup<CustomStory>[] {
  const regular: StoriesGroup<CustomStory>[] = NAMES.map((name, i) => ({
    author: {
      id: `user-${i}`,
      name,
      avatar: AVATARS[i],
      verified: i === 0 || i === 3,
    },
    stories: [
      ...Array.from({ length: 2 + (i % 3) }, (_, j) => ({
        id: `story-${i}-${j}`,
        mediaType: 'image' as const,
        src: cdnUrl(
          `samples/images/stories/story-${String(((i * 10 + j) % 100) + 1).padStart(3, '0')}.jpg`,
        ),
        createdAt: new Date(Date.now() - (i * 3 + j) * 3600_000).toISOString(),
      })),
      // Add a broken image to the first user's stories
      ...(i === 0
        ? [
            {
              id: `story-${i}-broken`,
              mediaType: 'image' as const,
              src: 'https://broken.invalid/does-not-exist.jpg',
              createdAt: new Date(
                Date.now() - (i * 3 + 5) * 3600_000,
              ).toISOString(),
            },
          ]
        : []),
      // Add a broken video to the second user's stories
      ...(i === 1
        ? [
            {
              id: `story-${i}-broken-vid`,
              mediaType: 'video' as const,
              src: 'https://broken.invalid/does-not-exist.mp4',
              createdAt: new Date(
                Date.now() - (i * 3 + 5) * 3600_000,
              ).toISOString(),
            },
          ]
        : []),
      ...(i % 2 === 0
        ? [
            {
              id: `story-${i}-vid`,
              mediaType: 'video' as const,
              src: cdnUrl(
                `samples/videos/video-${String((i % 12) + 1).padStart(2, '0')}.mp4`,
              ),
              poster: cdnUrl(
                `samples/videos/video-poster-${String((i % 12) + 1).padStart(2, '0')}.jpg`,
              ),
              createdAt: new Date(Date.now() - i * 5 * 3600_000).toISOString(),
            },
          ]
        : []),
    ],
  }));

  const promoGroup: StoriesGroup<CustomStory> = {
    author: {
      id: 'promo',
      name: 'ReelKit',
      avatar: AVATARS[5],
      verified: true,
    },
    stories: PROMO_STORIES,
  };

  const perfGroup: StoriesGroup<CustomStory> = {
    author: {
      id: 'perf-test',
      name: '100 Stories',
      avatar: cdnUrl('samples/avatars/avatar-12.jpg'),
      verified: false,
    },
    stories: Array.from({ length: 100 }, (_, i) => ({
      id: `perf-${i}`,
      mediaType: 'image' as const,
      src: cdnUrl(
        `samples/images/stories/story-${String((i % 100) + 1).padStart(3, '0')}.jpg`,
      ),
      duration: 3000,
      createdAt: new Date(Date.now() - i * 600_000).toISOString(),
    })),
  };

  return [promoGroup, ...regular, perfGroup];
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  border: 'none',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'background 150ms',
};

function StoriesPlayerPage() {
  const groups = useMemo(() => generateGroups(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [viewedState] = useState(() => new Map<string, number>());
  const [transition, setTransition] = useState<TransitionTransformFn>(
    () => cubeTransition,
  );

  const openStories = (groupIndex: number) => {
    setSelectedGroup(groupIndex);
    setIsOpen(true);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#111',
        padding: '56px 16px 16px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          Stories Player Demo
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}
        >
          Click on a story ring to open the player. Tap left/right to navigate
          stories, swipe left/right to switch users. Tap-and-hold to pause,
          double-tap to like.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {_kTransitions.map((t) => (
            <button
              key={t.label}
              onClick={() => setTransition(() => t.fn)}
              style={{
                ...btnStyle,
                background:
                  transition === t.fn ? '#fff' : 'rgba(255,255,255,0.15)',
                color: transition === t.fn ? '#000' : '#fff',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <StoriesRingList
          groups={groups}
          viewedState={viewedState}
          onSelect={openStories}
        />
      </div>

      <StoriesOverlay<CustomStory>
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={selectedGroup}
        groupTransition={transition}
        renderSlide={(props) => <CustomSlide {...props} />}
        onStoryViewed={(gi, si) => {
          const author = groups[gi].author;
          const current = viewedState.get(author.id) ?? 0;
          viewedState.set(author.id, Math.max(current, si + 1));
        }}
      />
    </div>
  );
}

export default StoriesPlayerPage;

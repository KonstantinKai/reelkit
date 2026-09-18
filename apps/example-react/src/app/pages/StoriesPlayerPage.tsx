import { useState } from 'react';
import { persistedSignal } from '../components/persistedSignal';
import { RememberSeenSwitch } from '../components/RememberSeenSwitch';
import { DesktopLayoutSwitch } from '../components/DesktopLayoutSwitch';
import {
  StoriesOverlay,
  StoriesRingList,
  ImageStorySlide,
  VideoStorySlide,
  createStoriesViewedStateController,
  type StoriesGroup,
  type StoryItem,
  type SlideRenderProps,
  type DesktopLayout,
} from '@reelkit/react-stories-player';
import {
  cubeTransition,
  flipTransition,
  fadeTransition,
  zoomTransition,
  slideTransition,
  createSignal,
  Observe,
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
// Authors that "Load more" appends while the player is open, a few at a time.
const _kMoreNames = ['Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];
const _kLoadMoreCount = 3;
// The ReelKit group, one per name above, and the 100 stories group.
const _kInitialGroupCount = NAMES.length + 2;
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

function makeUserGroup(name: string, i: number): StoriesGroup<CustomStory> {
  return {
    author: {
      id: `user-${i}`,
      name,
      avatar: AVATARS[i % AVATARS.length],
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
  };
}

function generateGroups(): StoriesGroup<CustomStory>[] {
  const regular = NAMES.map(makeUserGroup);

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

// A stylesheet rather than inline styles, for the media query: the button is
// for desktop screens only, above the same 768px the player counts as a phone.
// It sits one step above the player overlay (`--rk-stories-overlay-z`, 9999).
const _kLoadMoreStyles = `
  .load-more-groups {
    display: none;
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 10000;
    padding: 10px 18px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 0.85rem;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background 150ms;
  }
  .load-more-groups:hover {
    background: rgba(255, 255, 255, 0.22);
  }
  @media (min-width: 769px) {
    .load-more-groups {
      display: block;
    }
  }
`;

function StoriesPlayerPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);

  // The switch choices are kept next to the seen store, so a reload respects
  // them. The groups are a signal because the feed grows: "Load more" replaces
  // the array with a longer one while the player is open. What was seen is one
  // controller, handed to the ring list and the player: they attach it and
  // follow it themselves. It reads the groups through the signal, so groups
  // added later are counted too.
  const [{ groups, transition, rememberSeen, desktopLayout, viewed }] =
    useState(() => {
      const groups = createSignal(generateGroups());
      const rememberSeen = persistedSignal(
        'reelkit-stories-player-remember-seen',
        true,
      );
      return {
        groups,
        transition: createSignal<TransitionTransformFn>(cubeTransition),
        rememberSeen,
        desktopLayout: persistedSignal<DesktopLayout>(
          'reelkit-stories-player-desktop-layout',
          'single',
        ),
        viewed: createStoriesViewedStateController({
          storageKey: 'reelkit-stories-player-seen',
          groups: () => groups.value,
        }),
      };
    });

  // Stands in for fetching the next page of a feed. The new groups go on the
  // end, so every group already loaded keeps its index and its place.
  const loadMore = () => {
    const loaded = groups.value.length;
    groups.value = [
      ...groups.value,
      ...Array.from({ length: _kLoadMoreCount }, (_, offset) => {
        const added = loaded - _kInitialGroupCount + offset;
        const round = Math.floor(added / _kMoreNames.length);
        const name = _kMoreNames[added % _kMoreNames.length];
        return makeUserGroup(
          round === 0 ? name : `${name} ${round + 1}`,
          NAMES.length + added,
        );
      }),
    ];
  };

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
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}
        >
          The feed can grow while the player is open. With the Carousel layout
          on a desktop screen, a &ldquo;Load more&rdquo; button sits in the
          corner of the open player and adds {_kLoadMoreCount} more authors to
          the end of the feed, the way a real one pages in. Go to the last group
          and press it: the new cards appear beside the player, a click opens
          them, and the player moves on to them instead of closing after the
          last group.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Observe signals={[transition]}>
            {() => (
              <>
                {_kTransitions.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      transition.value = t.fn;
                    }}
                    style={{
                      ...btnStyle,
                      background:
                        transition.value === t.fn
                          ? '#fff'
                          : 'rgba(255,255,255,0.15)',
                      color: transition.value === t.fn ? '#000' : '#fff',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            )}
          </Observe>
          <button
            onClick={() => viewed.forget()}
            style={{
              ...btnStyle,
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          >
            clear seen
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <RememberSeenSwitch signal={rememberSeen} />
          <DesktopLayoutSwitch signal={desktopLayout} />
        </div>

        {/* The rings follow the viewed controller by themselves, so only the
            growing feed and the switch are watched for here. "Remember seen"
            off means the controller is not handed over at all. */}
        <Observe signals={[groups, rememberSeen]}>
          {() => (
            <StoriesRingList
              groups={groups.value}
              viewed={rememberSeen.value ? viewed : undefined}
              onSelect={openStories}
            />
          )}
        </Observe>
      </div>

      {/* The same controller as the ring list: the carousel cards draw the
          same rings, groups resume where they were left, and every story
          shown is recorded. */}
      <Observe signals={[groups, transition, desktopLayout, rememberSeen]}>
        {() => (
          <StoriesOverlay<CustomStory>
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            groups={groups.value}
            initialGroupIndex={selectedGroup}
            viewed={rememberSeen.value ? viewed : undefined}
            groupTransition={transition.value}
            desktopLayout={desktopLayout.value}
            renderSlide={(props) => <CustomSlide {...props} />}
          />
        )}
      </Observe>

      {/* Drawn over the open player, which covers the rest of the page. Only
          for the carousel on a desktop screen: the point is the cards picking
          up the new groups, and the single layout and a phone show none. */}
      {isOpen ? (
        <>
          <style>{_kLoadMoreStyles}</style>
          <Observe signals={[groups, desktopLayout]}>
            {() =>
              desktopLayout.value === 'carousel' ? (
                <button
                  type="button"
                  className="load-more-groups"
                  onClick={loadMore}
                >
                  Load more ({groups.value.length} groups)
                </button>
              ) : null
            }
          </Observe>
        </>
      ) : null}
    </div>
  );
}

export default StoriesPlayerPage;

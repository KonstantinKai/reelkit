import type { StoriesGroup, StoryItem } from '@reelkit/vue-stories-player';
import { cdnUrl } from '@reelkit/example-data';

const _kAvatars = [
  cdnUrl('samples/avatars/avatar-06.jpg'),
  cdnUrl('samples/avatars/avatar-07.jpg'),
  cdnUrl('samples/avatars/avatar-08.jpg'),
  cdnUrl('samples/avatars/avatar-09.jpg'),
  cdnUrl('samples/avatars/avatar-10.jpg'),
  cdnUrl('samples/avatars/avatar-11.jpg'),
];

const _kNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

/** Authors "Load more" appends while the player is open, a few at a time. */
const _kMoreNames = ['Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];

/** Groups one press of "Load more" adds. */
export const kLoadMoreCount = 3;

// The ReelKit group, one per name above, and the 100 stories group.
const _kInitialGroupCount = _kNames.length + 2;

/** A story carrying the extra fields the demo's custom slide draws. */
export interface CustomStory extends StoryItem {
  title?: string;
  subtitle?: string;
  bgGradient?: string;
  emoji?: string;
  ctaText?: string;
}

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

const _kPromoStories: CustomStory[] = [
  {
    id: 'promo-0',
    mediaType: 'image',
    src: cdnUrl('samples/images/image-01.jpg'),
    createdAt: hoursAgo(1),
    title: 'New Collection',
    subtitle: 'Spring 2026 is here',
    emoji: '🌸',
  },
  {
    id: 'promo-1',
    mediaType: 'image',
    src: '',
    createdAt: hoursAgo(2),
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
    createdAt: hoursAgo(3),
    title: 'Behind the Scenes',
    emoji: '🎬',
  },
  {
    id: 'promo-3',
    mediaType: 'image',
    src: '',
    createdAt: hoursAgo(4),
    title: 'Did you know?',
    subtitle: 'ReelKit supports cube, flip, fade, and slide transitions',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '✨',
  },
  {
    id: 'promo-4',
    mediaType: 'image',
    src: cdnUrl('samples/images/image-03.jpg'),
    createdAt: hoursAgo(5),
    title: 'Explore Nature',
    subtitle: 'Best hiking trails of the season',
    emoji: '🏔️',
  },
  {
    id: 'promo-5',
    mediaType: 'image',
    src: '',
    createdAt: hoursAgo(6),
    title: 'Thank You',
    subtitle: '10K followers! You are amazing',
    bgGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    emoji: '🎉',
  },
];

const storyImage = (n: number) =>
  cdnUrl(`samples/images/stories/story-${String(n).padStart(3, '0')}.jpg`);

const makeUserGroup = (name: string, i: number): StoriesGroup<CustomStory> => ({
  author: {
    id: `user-${i}`,
    name,
    avatar: _kAvatars[i % _kAvatars.length],
    verified: i === 0 || i === 3,
  },
  stories: [
    ...Array.from({ length: 2 + (i % 3) }, (_, j) => ({
      id: `story-${i}-${j}`,
      mediaType: 'image' as const,
      src: storyImage(((i * 10 + j) % 100) + 1),
      createdAt: hoursAgo(i * 3 + j),
    })),
    // The first user has a broken image, the second a broken video.
    ...(i === 0
      ? [
          {
            id: `story-${i}-broken`,
            mediaType: 'image' as const,
            src: 'https://broken.invalid/does-not-exist.jpg',
            createdAt: hoursAgo(i * 3 + 5),
          },
        ]
      : []),
    ...(i === 1
      ? [
          {
            id: `story-${i}-broken-vid`,
            mediaType: 'video' as const,
            src: 'https://broken.invalid/does-not-exist.mp4',
            createdAt: hoursAgo(i * 3 + 5),
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
            createdAt: hoursAgo(i * 5),
          },
        ]
      : []),
  ],
});

/** The demo feed: a promo group, one group per user, and a 100 stories group. */
export const generateGroups = (): StoriesGroup<CustomStory>[] => [
  {
    author: {
      id: 'promo',
      name: 'ReelKit',
      avatar: _kAvatars[5],
      verified: true,
    },
    stories: _kPromoStories,
  },
  ..._kNames.map(makeUserGroup),
  {
    author: {
      id: 'perf-test',
      name: '100 Stories',
      avatar: cdnUrl('samples/avatars/avatar-12.jpg'),
      verified: false,
    },
    stories: Array.from({ length: 100 }, (_, i) => ({
      id: `perf-${i}`,
      mediaType: 'image' as const,
      src: storyImage((i % 100) + 1),
      duration: 3000,
      createdAt: new Date(Date.now() - i * 600_000).toISOString(),
    })),
  },
];

/**
 * The next page of the feed, standing in for a fetch. It goes on the end, so
 * every group already loaded keeps its index and its place.
 */
export const nextPage = (loaded: number): StoriesGroup<CustomStory>[] =>
  Array.from({ length: kLoadMoreCount }, (_, offset) => {
    const added = loaded - _kInitialGroupCount + offset;
    const round = Math.floor(added / _kMoreNames.length);
    const name = _kMoreNames[added % _kMoreNames.length];
    return makeUserGroup(
      round === 0 ? name : `${name} ${round + 1}`,
      _kNames.length + added,
    );
  });

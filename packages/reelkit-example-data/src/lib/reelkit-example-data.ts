/* eslint-disable @nx/workspace-constant-naming */
import type { ContentItem, MediaItem } from './types';
import { cdnUrl, generate } from './cdn';

const pad = (n: number) => String(n).padStart(2, '0');

const IMAGE_ASPECT_RATIOS = [
  2 / 3,
  2 / 3,
  3 / 4,
  2 / 3,
  16 / 9,
  16 / 9,
  2 / 3,
  2 / 3,
  3 / 4,
  2 / 3,
  2 / 3,
  3 / 4,
  2 / 3,
  16 / 9,
  2 / 3,
];

const NAMES = [
  'Alex Johnson',
  'Sarah Miller',
  'James Wilson',
  'Emma Davis',
  'Michael Brown',
];

const DESCRIPTIONS = [
  'Beautiful sunset vibes',
  'Nature at its finest',
  'City life adventures',
  'Travel moments',
  'Chasing dreams',
  'Living the moment',
  'Golden hour magic',
  'Wanderlust',
  'Good vibes only',
  'Making memories',
];

function lazy<T>(factory: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= factory());
}

const getSampleVideos = lazy(() =>
  generate(12, (i) => ({
    src: cdnUrl(`samples/videos/video-${pad(i + 1)}.mp4`),
    poster: cdnUrl(`samples/videos/video-poster-${pad(i + 1)}.jpg`),
    aspectRatio: 16 / 9,
  })),
);

const getPexelsImages = lazy(() =>
  generate(15, (i) => ({
    src: cdnUrl(`samples/images/image-${pad(i + 1)}.jpg`),
    aspectRatio: IMAGE_ASPECT_RATIOS[i],
  })),
);

const getAvatars = lazy(() =>
  generate(5, (i) => cdnUrl(`samples/avatars/avatar-${pad(i + 1)}.jpg`)),
);

const buildUniqueContent = (): ContentItem[] => {
  const VIDEOS = getSampleVideos();
  const IMAGES = getPexelsImages();
  const AVTS = getAvatars();

  const content: ContentItem[] = [];
  let contentIndex = 0;

  IMAGES.forEach((img, i) => {
    content.push({
      id: `content-${contentIndex}`,
      media: [
        {
          id: `img-${contentIndex}-0`,
          type: 'image',
          src: img.src,
          aspectRatio: img.aspectRatio,
        },
      ],
      author: {
        name: NAMES[i % NAMES.length],
        avatar: AVTS[i % AVTS.length],
      },
      likes: 1000 + i * 500,
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    });
    contentIndex++;
  });

  VIDEOS.forEach((vid, i) => {
    content.push({
      id: `content-${contentIndex}`,
      media: [
        {
          id: `vid-${contentIndex}-0`,
          type: 'video',
          src: vid.src,
          poster: vid.poster,
          aspectRatio: vid.aspectRatio,
        },
      ],
      author: {
        name: NAMES[(i + 2) % NAMES.length],
        avatar: AVTS[(i + 2) % AVTS.length],
      },
      likes: 2000 + i * 700,
      description: DESCRIPTIONS[(i + 3) % DESCRIPTIONS.length],
    });
    contentIndex++;
  });

  const multiMediaPosts: MediaItem[][] = [
    [
      {
        id: 'multi-0-0',
        type: 'image',
        src: IMAGES[0].src,
        aspectRatio: IMAGES[0].aspectRatio,
      },
      {
        id: 'multi-0-1',
        type: 'image',
        src: IMAGES[1].src,
        aspectRatio: IMAGES[1].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-1-0',
        type: 'video',
        src: VIDEOS[0].src,
        poster: VIDEOS[0].poster,
        aspectRatio: VIDEOS[0].aspectRatio,
      },
      {
        id: 'multi-1-1',
        type: 'image',
        src: IMAGES[2].src,
        aspectRatio: IMAGES[2].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-2-0',
        type: 'image',
        src: IMAGES[3].src,
        aspectRatio: IMAGES[3].aspectRatio,
      },
      {
        id: 'multi-2-1',
        type: 'image',
        src: IMAGES[4].src,
        aspectRatio: IMAGES[4].aspectRatio,
      },
      {
        id: 'multi-2-2',
        type: 'image',
        src: IMAGES[5].src,
        aspectRatio: IMAGES[5].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-3-0',
        type: 'video',
        src: VIDEOS[1].src,
        poster: VIDEOS[1].poster,
        aspectRatio: VIDEOS[1].aspectRatio,
      },
      {
        id: 'multi-3-1',
        type: 'video',
        src: VIDEOS[2].src,
        poster: VIDEOS[2].poster,
        aspectRatio: VIDEOS[2].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-4-0',
        type: 'image',
        src: IMAGES[6].src,
        aspectRatio: IMAGES[6].aspectRatio,
      },
      {
        id: 'multi-4-1',
        type: 'video',
        src: VIDEOS[3].src,
        poster: VIDEOS[3].poster,
        aspectRatio: VIDEOS[3].aspectRatio,
      },
      {
        id: 'multi-4-2',
        type: 'image',
        src: IMAGES[7].src,
        aspectRatio: IMAGES[7].aspectRatio,
      },
    ],
  ];

  multiMediaPosts.forEach((media, i) => {
    content.push({
      id: `content-${contentIndex}`,
      media,
      author: {
        name: NAMES[(i + 1) % NAMES.length],
        avatar: AVTS[(i + 1) % AVTS.length],
      },
      likes: 5000 + i * 1000,
      description: DESCRIPTIONS[(i + 5) % DESCRIPTIONS.length],
    });
    contentIndex++;
  });

  // Shuffle content for variety (deterministic shuffle)
  const shuffled = [...content];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(
      (Math.sin(i * 9999) * 10000 - Math.floor(Math.sin(i * 9999) * 10000)) *
        (i + 1),
    );
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const getUniqueContent = lazy(buildUniqueContent);

export const generateContent = (count: number): ContentItem[] => {
  const content = getUniqueContent();
  return content.slice(0, Math.min(count, content.length));
};

export const getContentItem = (index: number): ContentItem => {
  const content = getUniqueContent();
  return content[index % content.length];
};

export const getThumbnail = (item: ContentItem): string => {
  const firstMedia = item.media[0];
  if (firstMedia.type === 'video') {
    return firstMedia.poster ?? firstMedia.src;
  }
  return firstMedia.src;
};

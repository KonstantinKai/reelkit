/* eslint-disable @nx/workspace-constant-naming */
import type { ContentItem, MediaItem } from './types';

const SAMPLE_VIDEOS = [
  {
    src: 'https://videos.pexels.com/video-files/854228/854228-hd_1280_720_30fps.mp4',
    poster:
      'https://images.pexels.com/videos/854228/free-video-854228.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    poster:
      'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/3015482/3015482-hd_1920_1080_24fps.mp4',
    poster:
      'https://images.pexels.com/videos/3015482/free-video-3015482.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/2519660/2519660-hd_1920_1080_24fps.mp4',
    poster:
      'https://images.pexels.com/videos/2519660/free-video-2519660.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4',
    poster:
      'https://images.pexels.com/videos/1409899/free-video-1409899.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4',
    poster:
      'https://images.pexels.com/videos/2098989/free-video-2098989.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster:
      'https://images.pexels.com/videos/854228/free-video-854228.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    poster:
      'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/bunny/poster.png',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/856029/856029-hd_1280_720_30fps.mp4',
    poster:
      'https://images.pexels.com/videos/856029/free-video-856029.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://videos.pexels.com/video-files/857135/857135-hd_1280_720_25fps.mp4',
    poster:
      'https://images.pexels.com/videos/857135/free-video-857135.jpg?auto=compress&w=640',
    aspectRatio: 16 / 9,
  },
];

const PEXELS_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 3 / 4,
  },
  {
    src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 3 / 4,
  },
  {
    src: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 3 / 4,
  },
  {
    src: 'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
  {
    src: 'https://images.pexels.com/photos/1172253/pexels-photo-1172253.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=800',
    aspectRatio: 2 / 3,
  },
];

const AVATARS = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
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

const buildUniqueContent = (): ContentItem[] => {
  const content: ContentItem[] = [];
  let contentIndex = 0;

  PEXELS_IMAGES.forEach((img, i) => {
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
        avatar: AVATARS[i % AVATARS.length],
      },
      likes: 1000 + i * 500,
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    });
    contentIndex++;
  });

  SAMPLE_VIDEOS.forEach((vid, i) => {
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
        avatar: AVATARS[(i + 2) % AVATARS.length],
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
        src: PEXELS_IMAGES[0].src,
        aspectRatio: PEXELS_IMAGES[0].aspectRatio,
      },
      {
        id: 'multi-0-1',
        type: 'image',
        src: PEXELS_IMAGES[1].src,
        aspectRatio: PEXELS_IMAGES[1].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-1-0',
        type: 'video',
        src: SAMPLE_VIDEOS[0].src,
        poster: SAMPLE_VIDEOS[0].poster,
        aspectRatio: SAMPLE_VIDEOS[0].aspectRatio,
      },
      {
        id: 'multi-1-1',
        type: 'image',
        src: PEXELS_IMAGES[2].src,
        aspectRatio: PEXELS_IMAGES[2].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-2-0',
        type: 'image',
        src: PEXELS_IMAGES[3].src,
        aspectRatio: PEXELS_IMAGES[3].aspectRatio,
      },
      {
        id: 'multi-2-1',
        type: 'image',
        src: PEXELS_IMAGES[4].src,
        aspectRatio: PEXELS_IMAGES[4].aspectRatio,
      },
      {
        id: 'multi-2-2',
        type: 'image',
        src: PEXELS_IMAGES[5].src,
        aspectRatio: PEXELS_IMAGES[5].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-3-0',
        type: 'video',
        src: SAMPLE_VIDEOS[1].src,
        poster: SAMPLE_VIDEOS[1].poster,
        aspectRatio: SAMPLE_VIDEOS[1].aspectRatio,
      },
      {
        id: 'multi-3-1',
        type: 'video',
        src: SAMPLE_VIDEOS[2].src,
        poster: SAMPLE_VIDEOS[2].poster,
        aspectRatio: SAMPLE_VIDEOS[2].aspectRatio,
      },
    ],
    [
      {
        id: 'multi-4-0',
        type: 'image',
        src: PEXELS_IMAGES[6].src,
        aspectRatio: PEXELS_IMAGES[6].aspectRatio,
      },
      {
        id: 'multi-4-1',
        type: 'video',
        src: SAMPLE_VIDEOS[3].src,
        poster: SAMPLE_VIDEOS[3].poster,
        aspectRatio: SAMPLE_VIDEOS[3].aspectRatio,
      },
      {
        id: 'multi-4-2',
        type: 'image',
        src: PEXELS_IMAGES[7].src,
        aspectRatio: PEXELS_IMAGES[7].aspectRatio,
      },
    ],
  ];

  multiMediaPosts.forEach((media, i) => {
    content.push({
      id: `content-${contentIndex}`,
      media,
      author: {
        name: NAMES[(i + 1) % NAMES.length],
        avatar: AVATARS[(i + 1) % AVATARS.length],
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

const UNIQUE_CONTENT = buildUniqueContent();

export const generateContent = (count: number): ContentItem[] => {
  return UNIQUE_CONTENT.slice(0, Math.min(count, UNIQUE_CONTENT.length));
};

export const getContentItem = (index: number): ContentItem => {
  return UNIQUE_CONTENT[index % UNIQUE_CONTENT.length];
};

export const getThumbnail = (item: ContentItem): string => {
  const firstMedia = item.media[0];
  if (firstMedia.type === 'video') {
    return firstMedia.poster ?? firstMedia.src;
  }
  return firstMedia.src;
};

export const SAMPLE_IMAGES = PEXELS_IMAGES;
export { SAMPLE_VIDEOS };

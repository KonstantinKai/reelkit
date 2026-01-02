import type { ContentItem, MediaItem } from './types';

// Sample videos from Google's sample video bucket with matching thumbnails
const SAMPLE_VIDEOS = [
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
    aspectRatio: 16 / 9,
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
    aspectRatio: 16 / 9,
  },
];

// Pexels free images (various aspect ratios)
const PEXELS_IMAGES = [
  { src: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 3 / 4 },
  { src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 16 / 9 },
  { src: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 16 / 9 },
  { src: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 3 / 4 },
  { src: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 3 / 4 },
  { src: 'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
  { src: 'https://images.pexels.com/photos/1172253/pexels-photo-1172253.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 16 / 9 },
  { src: 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=800', aspectRatio: 2 / 3 },
];

// Sample author avatars
const AVATARS = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
];

const NAMES = ['Alex Johnson', 'Sarah Miller', 'James Wilson', 'Emma Davis', 'Michael Brown'];

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

// Build unique content items - no repeats
const buildUniqueContent = (): ContentItem[] => {
  const content: ContentItem[] = [];
  let contentIndex = 0;

  // First, add all single images
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

  // Then, add all single videos
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

  // Add some multi-media posts combining unused combinations
  const multiMediaPosts: MediaItem[][] = [
    // Post with 2 images
    [
      { id: 'multi-0-0', type: 'image', src: PEXELS_IMAGES[0].src, aspectRatio: PEXELS_IMAGES[0].aspectRatio },
      { id: 'multi-0-1', type: 'image', src: PEXELS_IMAGES[1].src, aspectRatio: PEXELS_IMAGES[1].aspectRatio },
    ],
    // Post with video + image
    [
      { id: 'multi-1-0', type: 'video', src: SAMPLE_VIDEOS[0].src, poster: SAMPLE_VIDEOS[0].poster, aspectRatio: SAMPLE_VIDEOS[0].aspectRatio },
      { id: 'multi-1-1', type: 'image', src: PEXELS_IMAGES[2].src, aspectRatio: PEXELS_IMAGES[2].aspectRatio },
    ],
    // Post with 3 images
    [
      { id: 'multi-2-0', type: 'image', src: PEXELS_IMAGES[3].src, aspectRatio: PEXELS_IMAGES[3].aspectRatio },
      { id: 'multi-2-1', type: 'image', src: PEXELS_IMAGES[4].src, aspectRatio: PEXELS_IMAGES[4].aspectRatio },
      { id: 'multi-2-2', type: 'image', src: PEXELS_IMAGES[5].src, aspectRatio: PEXELS_IMAGES[5].aspectRatio },
    ],
    // Post with 2 videos
    [
      { id: 'multi-3-0', type: 'video', src: SAMPLE_VIDEOS[1].src, poster: SAMPLE_VIDEOS[1].poster, aspectRatio: SAMPLE_VIDEOS[1].aspectRatio },
      { id: 'multi-3-1', type: 'video', src: SAMPLE_VIDEOS[2].src, poster: SAMPLE_VIDEOS[2].poster, aspectRatio: SAMPLE_VIDEOS[2].aspectRatio },
    ],
    // Post with image + video + image
    [
      { id: 'multi-4-0', type: 'image', src: PEXELS_IMAGES[6].src, aspectRatio: PEXELS_IMAGES[6].aspectRatio },
      { id: 'multi-4-1', type: 'video', src: SAMPLE_VIDEOS[3].src, poster: SAMPLE_VIDEOS[3].poster, aspectRatio: SAMPLE_VIDEOS[3].aspectRatio },
      { id: 'multi-4-2', type: 'image', src: PEXELS_IMAGES[7].src, aspectRatio: PEXELS_IMAGES[7].aspectRatio },
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
    const j = Math.floor((Math.sin(i * 9999) * 10000 - Math.floor(Math.sin(i * 9999) * 10000)) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

// Pre-built unique content
const UNIQUE_CONTENT = buildUniqueContent();

// Generate content list (returns up to available unique items)
export const generateContent = (count: number): ContentItem[] => {
  return UNIQUE_CONTENT.slice(0, Math.min(count, UNIQUE_CONTENT.length));
};

// Get content item by index
export const getContentItem = (index: number): ContentItem => {
  return UNIQUE_CONTENT[index % UNIQUE_CONTENT.length];
};

// Get thumbnail for a content item (first media item)
export const getThumbnail = (item: ContentItem): string => {
  const firstMedia = item.media[0];
  if (firstMedia.type === 'video') {
    return firstMedia.poster || firstMedia.src;
  }
  return firstMedia.src;
};

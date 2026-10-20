import { cdnUrl } from '@reelkit/example-data';

// Stands in for your backend: the posts a profile or a search result would
// load. Each one has the shape of `ContentItem` from the reel player of your
// framework, so the list goes to the player as it is.

export interface Post {
  id: string;
  media: {
    id: string;
    type: 'image' | 'video';
    src: string;
    poster?: string;
    aspectRatio: number;
  }[];
  author: { name: string; avatar: string };
  likes: number;
  description: string;
}

const kAuthors = ['Alex Johnson', 'Sarah Miller', 'Mike Chen', 'Emma Davis'];

const pad = (n: number) => String(n).padStart(2, '0');

export const posts: Post[] = Array.from({ length: 12 }, (_, i) => {
  const isVideo = i % 4 === 0;
  const n = (i % (isVideo ? 3 : 9)) + 1;
  return {
    id: `post-${i + 1}`,
    media: [
      isVideo
        ? {
            id: `video-${i + 1}`,
            type: 'video' as const,
            src: cdnUrl(`samples/videos/video-${pad(n)}.mp4`),
            poster: cdnUrl(`samples/videos/video-poster-${pad(n)}.jpg`),
            aspectRatio: 16 / 9,
          }
        : {
            id: `image-${i + 1}`,
            type: 'image' as const,
            src: cdnUrl(`samples/images/image-${pad(n)}.jpg`),
            aspectRatio: 2 / 3,
          },
    ],
    author: {
      name: kAuthors[i % kAuthors.length],
      avatar: cdnUrl(`samples/avatars/avatar-${pad((i % 8) + 1)}.jpg`),
    },
    likes: 120 + i * 37,
    description: `Post ${i + 1}`,
  };
});

/** The picture a grid cell shows: a video's poster, or the image itself. */
export const thumbnailOf = (post: Post) =>
  post.media[0].poster ?? post.media[0].src;

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  src: string;
  poster?: string;
  aspectRatio: number; // width / height (< 1 = vertical, > 1 = horizontal)
}

export interface ContentItem {
  id: string;
  media: MediaItem[];
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}

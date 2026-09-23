interface StoryItem {
  /** Unique within its group. Stored viewed state keys on it. */
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  /** Poster for a video, also used as the carousel card preview. */
  poster?: string;
  /** Overrides defaultImageDuration for this story, in milliseconds. */
  duration?: number;
  createdAt?: string | Date;
}

interface AuthorInfo {
  /** Stable id. Viewed state and stable-id URLs key on it. */
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}

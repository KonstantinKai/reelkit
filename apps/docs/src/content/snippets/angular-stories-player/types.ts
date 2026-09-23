import type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  StoriesApi,
  DesktopLayout,
} from '@reelkit/angular-stories-player';

interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;
  aspectRatio?: number;
  createdAt?: string | Date;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}

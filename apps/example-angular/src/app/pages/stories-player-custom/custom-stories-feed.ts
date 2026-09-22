import type { StoriesGroup } from '@reelkit/angular-stories-player';
import { cdnUrl } from '@reelkit/example-data';

const _kAvatars = [
  cdnUrl('samples/avatars/avatar-13.jpg'),
  cdnUrl('samples/avatars/avatar-14.jpg'),
  cdnUrl('samples/avatars/avatar-15.jpg'),
];

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

/**
 * The page's own feed, matching the react and vue custom pages: three short
 * groups, one of them carrying a story that will not load so the loading and
 * error demo has something to show.
 */
export const customGroups: StoriesGroup[] = [
  {
    author: {
      id: 'u1',
      name: 'Travel',
      avatar: _kAvatars[0],
      verified: true,
    },
    stories: [
      {
        id: 'c1',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-01.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c2',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-02.jpg'),
        createdAt: hoursAgo(2),
      },
      {
        id: 'c3',
        mediaType: 'video',
        src: cdnUrl('samples/videos/video-01.mp4'),
        poster: cdnUrl('samples/videos/video-poster-01.jpg'),
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    author: { id: 'u2', name: 'Food', avatar: _kAvatars[1] },
    stories: [
      {
        id: 'c4',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-03.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c5',
        mediaType: 'image',
        src: 'https://broken.invalid/does-not-exist.jpg',
        createdAt: hoursAgo(2),
      },
      {
        id: 'c6',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-04.jpg'),
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    author: { id: 'u3', name: 'Music', avatar: _kAvatars[2], verified: true },
    stories: [
      {
        id: 'c7',
        mediaType: 'video',
        src: cdnUrl('samples/videos/video-02.mp4'),
        poster: cdnUrl('samples/videos/video-poster-02.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c8',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-05.jpg'),
        createdAt: hoursAgo(2),
      },
    ],
  },
];

/** One card on the page, and the overlay it opens. */
export interface CustomDemo {
  id:
    | 'custom-header'
    | 'custom-footer'
    | 'custom-navigation'
    | 'custom-progress'
    | 'custom-loading-error'
    | 'theming';
  title: string;
  description: string;
}

export const customDemos: CustomDemo[] = [
  {
    id: 'custom-header',
    title: 'Custom Header',
    description:
      'Uses the header slot to replace the default header with a minimal close button and custom author layout.',
  },
  {
    id: 'custom-footer',
    title: 'Custom Footer',
    description:
      'Uses the footer slot to add a reply input and action buttons below each story.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses the navigation slot to replace default chevron buttons with labeled pill buttons.',
  },
  {
    id: 'custom-progress',
    title: 'Custom Progress Bar',
    description:
      'Uses the progress bar slot to replace the default canvas bar with a simple HTML progress element.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses the loading and error slots to replace default spinner and error icon. Includes a broken image story.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the stories overlay by overriding --rk-stories-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

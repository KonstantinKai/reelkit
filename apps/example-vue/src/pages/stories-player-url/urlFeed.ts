import type { StoriesGroup } from '@reelkit/vue-stories-player';
import { cdnUrl } from '@reelkit/example-data';

/** How the URL addresses the group axis. */
export type Addressing = 'index' | 'stableId';

/** How the URL addresses the inner (story) axis. */
export type InnerKey = 'index' | 'stableId';

/** Groups that have "arrived" before any link pages more in. */
export const kUrlPageSize = 3;

const _kNames = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
];

/** Eight users with two to four image stories each. */
export const generateUrlGroups = (): StoriesGroup[] =>
  _kNames.map((name, i) => ({
    author: {
      id: `user-${i}`,
      name,
      avatar: cdnUrl(
        `samples/avatars/avatar-${String(6 + i).padStart(2, '0')}.jpg`,
      ),
      verified: i % 3 === 0,
    },
    stories: Array.from({ length: 2 + (i % 3) }, (_, j) => ({
      id: `story-${i}-${j}`,
      mediaType: 'image' as const,
      src: cdnUrl(
        `samples/images/stories/story-${String(((i * 10 + j) % 100) + 1).padStart(3, '0')}.jpg`,
      ),
      createdAt: new Date(Date.now() - (i * 3 + j) * 3600_000).toISOString(),
    })),
  }));

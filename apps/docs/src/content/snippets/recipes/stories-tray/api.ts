import { cdnUrl } from '@reelkit/example-data';

// Stands in for your backend: the people a viewer follows and the stories each
// one posted. Each entry has the shape of `StoriesGroup` from the stories
// player of your framework, so the list goes to the player as it is.

export interface Group {
  author: { id: string; name: string; avatar: string };
  stories: { id: string; mediaType: 'image'; src: string }[];
}

const kPeople = ['Alex', 'Sarah', 'Mike', 'Emma', 'Noah', 'Lena'];

// Uneven on purpose: a person with one story is watched to the end at once,
// one with three can be left part way and resumed.
const kStoryCounts = [3, 1, 2, 3, 1, 2];

const pad = (n: number) => String(n).padStart(2, '0');

const storyImage = (n: number) =>
  n <= 6
    ? cdnUrl(`samples/images/stories/story-00${n}.jpg`)
    : cdnUrl(`samples/images/image-${pad(n - 6)}.jpg`);

let nextImage = 1;

export const groups: Group[] = kPeople.map((name, i) => ({
  author: {
    id: `user-${i + 1}`,
    name,
    avatar: cdnUrl(`samples/avatars/avatar-${pad(i + 1)}.jpg`),
  },
  stories: Array.from({ length: kStoryCounts[i] }, (_, j) => ({
    id: `user-${i + 1}-story-${j + 1}`,
    mediaType: 'image' as const,
    src: storyImage(nextImage++),
  })),
}));

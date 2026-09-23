// ?story=alice.s3 — each axis addressed by a stable id, so a link survives
// the feed being reordered or paged.
import { urlStableIdKey } from '@reelkit/angular';

const key = urlIndexTwoAxisKey({
  outerCodec: urlStableIdKey({ items: () => groups }).codec,
  outerLocator: {
    locate: (id) => groups.findIndex((group) => group.author.id === id),
    identify: (index) => groups[index].author.id,
  },
  outerCount: () => groups.length,
  innerCounts: () => groups.map((group) => group.stories.length),
  innerCodec: urlStableIdKey({ items: () => [] }).codec,
  innerLocate: (outer, id) =>
    groups[outer].stories.findIndex((story) => story.id === id),
  innerIdentify: (outer, index) => groups[outer].stories[index].id,
});

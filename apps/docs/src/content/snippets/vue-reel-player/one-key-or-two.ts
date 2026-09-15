import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/vue';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.value.length,
    innerCounts: () => content.value.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2 — ?reel=3.2

import { createOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/angular';

protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => this.content.length,
    innerCounts: () => this.content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2 — ?reel=3.2

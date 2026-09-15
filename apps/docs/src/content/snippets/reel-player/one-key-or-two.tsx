import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/react';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.length,
    innerCounts: () => content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2.
<Link to="?reel=3.2">…</Link>
<ReelPlayerUrlOverlay controller={reel} content={content} />

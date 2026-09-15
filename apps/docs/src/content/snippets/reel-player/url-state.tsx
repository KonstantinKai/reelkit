import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/react';
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import { Link } from 'react-router-dom';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexKey(() => content.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{content.map((item, i) => (
  <Link key={item.id} to={`?reel=${i}`}>
    <img src={getThumbnail(item)} />
  </Link>
))}

<ReelPlayerUrlOverlay controller={reel} content={content} />

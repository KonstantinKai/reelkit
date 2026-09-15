import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/react';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the href is the open action. No open flag, no handler:
// the overlay reads the URL and opens itself.
{images.map((image, i) => (
  <Link key={image.src} to={`?photo=${i}`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />

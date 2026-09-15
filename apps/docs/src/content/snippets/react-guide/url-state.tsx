import { useOverlayUrlState, urlIndexKey } from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
<Link to="?photo=3"><img src={images[3].src} /></Link>
<LightboxUrlOverlay controller={photo} images={images} />

// Read the url-derived state, or close programmatically (a low-level write).
photo.position.value; // 3 for ?photo=3, null when nothing is open
photo.set(null); // close

// Routed app: pass a router-backed adapter, otherwise the router's
// own location goes stale and its next navigation drops the param.
const adapter = useReactRouterUrlAdapter();
const routed = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});

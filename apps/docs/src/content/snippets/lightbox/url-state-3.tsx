import { Link } from 'react-router-dom';

// The href is the open action — no onClick, no open flag.
{images.map((image, i) => (
  <Link key={image.src} to={`?photo=${i}`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />

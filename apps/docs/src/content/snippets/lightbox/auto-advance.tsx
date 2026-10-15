import { LightboxOverlay } from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={index !== null}
  images={images}
  initialIndex={index ?? 0}
  onClose={() => setIndex(null)}
  autoAdvance
  autoAdvanceInterval={4000}
/>;

import {
  LightboxOverlay,
  lightboxFadeTransition,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  initialIndex={0}
  onClose={handleClose}
  transitionFn={lightboxFadeTransition}
/>

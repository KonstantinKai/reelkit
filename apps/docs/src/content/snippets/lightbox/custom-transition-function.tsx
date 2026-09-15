import { LightboxOverlay } from '@reelkit/react-lightbox';
import type { TransitionTransformFn } from '@reelkit/react';

const customFade: TransitionTransformFn = (offset, size) => ({
  transform: `translate3d(${offset * size[0]}px, 0, 0)`,
  opacity: 1 - Math.min(Math.abs(offset), 1),
});

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  transitionFn={customFade}
  onClose={() => setIsOpen(false)}
/>

import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, SoundProvider, hasVideo } =
  useVideoSlideRenderer(items);

// SoundProvider  — wrap LightboxOverlay in this for mute/unmute support
// renderSlide    — pass to LightboxOverlay's renderSlide prop
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (includes Counter, FullscreenButton, SoundButton, CloseButton)
// hasVideo       — true if items contain at least one video

interface SlideRenderProps {
  item: LightboxItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  autoAdvance: boolean; // a video should play once, not loop
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
  onEnded: () => void;  // a video played to its end
}

interface SlideRenderProps {
  item: LightboxItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
}

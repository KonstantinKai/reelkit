interface VideoSlideProps {
  src: string;
  poster?: string;
  aspectRatio: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive?: boolean;   // default: true
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  className?: string;
  style?: CSSProperties;
}

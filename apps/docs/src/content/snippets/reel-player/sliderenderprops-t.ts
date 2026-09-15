interface SlideRenderProps<T extends BaseContentItem> {
  item: T;
  index: number;
  size: [number, number];
  isActive: boolean;
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  innerSliderRef: MutableRefObject<ReelApi | null>;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;
  enableWheel?: boolean;
  defaultContent: ReactNode;
}

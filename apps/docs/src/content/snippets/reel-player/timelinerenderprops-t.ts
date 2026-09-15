interface TimelineRenderProps<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: ReactNode;
}

interface TimelineSlotScope<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: () => VNode | VNode[];
}

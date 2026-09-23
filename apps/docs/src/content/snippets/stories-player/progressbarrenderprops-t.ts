interface ProgressBarRenderProps<T extends StoryItem = StoryItem> {
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
  group: StoriesGroup<T>;
  groupIndex: number;
  isActive: boolean; // false: the signals hold still for a neighbouring group
}

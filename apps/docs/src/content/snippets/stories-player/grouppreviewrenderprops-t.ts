type DesktopLayout = 'single' | 'carousel';

interface GroupPreviewRenderProps<T extends StoryItem = StoryItem> {
  group: StoriesGroup<T>;
  groupIndex: number;
  story: T | undefined; // the story the group would open on
  offset: number; // negative on the left, positive on the right
  viewedCount: number; // from viewedState, 0 without it
  onOpen: () => void;
}

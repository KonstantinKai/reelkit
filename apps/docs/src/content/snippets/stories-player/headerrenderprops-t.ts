interface HeaderRenderProps<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
  isPaused: boolean;
  isMuted: boolean;
  isVideo: boolean;
  groupIndex: number;
  isActive: boolean; // false for a neighbouring group's header
  onToggleSound: () => void;
  onTogglePause: () => void;
  onClose: () => void;
}

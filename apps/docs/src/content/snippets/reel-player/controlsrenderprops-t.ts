interface ControlsRenderProps<T extends BaseContentItem> {
  onClose: () => void;
  soundState: SoundState;
  activeIndex: number;
  content: T[];
}

interface ControlsRenderProps {
  item: LightboxItem;
  activeIndex: number;
  count: number;
  isFullscreen: boolean;
  isAutoAdvancing: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onToggleAutoAdvance?: () => void; // only with autoAdvance
  onDownload?: () => void;          // only with showDownload
}

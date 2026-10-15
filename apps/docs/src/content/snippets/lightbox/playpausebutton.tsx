import {
  LightboxOverlay,
  PlayPauseButton,
  CloseButton,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  autoAdvance
  renderControls={({ isAutoAdvancing, onToggleAutoAdvance, onClose }) => (
    <>
      {onToggleAutoAdvance && (
        <PlayPauseButton
          isPlaying={isAutoAdvancing}
          onToggle={onToggleAutoAdvance}
        />
      )}
      <CloseButton onClick={onClose} />
    </>
  )}
  {...props}
/>;

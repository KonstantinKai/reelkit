import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderControls={({ onClose, content, activeIndex }) => (
    <>
      <CloseButton onClick={onClose} />
      <SoundButton />
      <button
        onClick={() => share(content[activeIndex])}
        style={{
          position: 'absolute',
          bottom: 60,
          right: 16,
          zIndex: 10,
        }}
      >
        Share
      </button>
    </>
  )}
/>
